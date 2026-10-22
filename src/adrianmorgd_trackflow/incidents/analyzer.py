"""Shared CSV validation and aggregate analysis for TrackFlow incidents."""

from __future__ import annotations

import csv
import io
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import TextIO

CARRIERS_BY_COUNTRY = {
    "US": {"UPS", "FEDEX", "DHL_US"},
    "ES": {"MRW", "SEUR", "DHL_ES", "LOCAL_ES"},
}
ALL_CARRIERS = set().union(*CARRIERS_BY_COUNTRY.values())
CATEGORIES = ("LOST_PARCEL", "DELAYED_DELIVERY", "WRONG_ADDRESS", "RETURN_REQUEST", "DAMAGE")
STATUSES = ("OPEN", "CLOSED", "DISCARDED")
CUSTOMER_TYPES = ("B2B", "B2C")
REQUIRED_COLUMNS = {
    "incident_id",
    "date",
    "country",
    "customer_type",
    "tracking_number",
    "carrier",
    "category",
    "description",
    "status",
    "customer_email",
}
INCIDENT_ID_PATTERN = re.compile(r"TRF-\d{6}\Z")
EMAIL_PATTERN = re.compile(r"[^\s@]+@[^\s@]+\.[^\s@]+\Z")
INVALID_LABELS = {
    "malformed_row": "Malformed CSV row",
    "incident_id": "Missing or invalid incident ID",
    "duplicate_incident_id": "Duplicate incident ID",
    "date": "Missing or invalid date",
    "country": "Missing or invalid country",
    "customer_type": "Missing or invalid customer type",
    "carrier": "Missing or invalid carrier",
    "carrier_country": "Carrier/country mismatch",
    "tracking_number": "Invalid or missing tracking number",
    "category": "Invalid or missing category",
    "description": "Empty or too-short description",
    "status": "Missing or invalid status",
    "email": "Invalid or missing email",
    "closed_without_score": "Closed incident, no score",
    "invalid_score": "Satisfaction score out of range or invalid",
}


def validate_record(row: dict[str, str | None], extra_columns: bool) -> list[str]:
    """Return rule identifiers for a row; never include source values in errors."""
    issues: list[str] = []
    if extra_columns:
        issues.append("malformed_row")

    def value(field: str) -> str:
        return (row.get(field) or "").strip()

    incident_id = value("incident_id")
    if not INCIDENT_ID_PATTERN.fullmatch(incident_id):
        issues.append("incident_id")

    raw_date = value("date")
    try:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", raw_date):
            raise ValueError
        date.fromisoformat(raw_date)
    except ValueError:
        issues.append("date")

    country = value("country").upper()
    if country not in CARRIERS_BY_COUNTRY:
        issues.append("country")

    if value("customer_type").upper() not in CUSTOMER_TYPES:
        issues.append("customer_type")

    carrier = value("carrier").upper()
    if not carrier or carrier not in ALL_CARRIERS:
        issues.append("carrier")
    elif country in CARRIERS_BY_COUNTRY and carrier not in CARRIERS_BY_COUNTRY[country]:
        issues.append("carrier_country")

    if len(value("tracking_number")) < 8:
        issues.append("tracking_number")
    if value("category").upper() not in CATEGORIES:
        issues.append("category")
    if len(value("description")) < 5:
        issues.append("description")

    status = value("status").upper()
    if status not in STATUSES:
        issues.append("status")
    if not EMAIL_PATTERN.fullmatch(value("customer_email")):
        issues.append("email")

    score_text = value("satisfaction_score")
    if score_text:
        try:
            score = int(score_text)
        except ValueError:
            issues.append("invalid_score")
        else:
            if not 1 <= score <= 5:
                issues.append("invalid_score")
    if status == "CLOSED" and not score_text:
        issues.append("closed_without_score")
    return issues


def read_records_from_text(text: str) -> tuple[list[dict[str, str | None]], int]:
    """Parse CSV text, validating its header and preserving malformed-row metadata."""
    if not text.strip():
        raise ValueError("The uploaded CSV is empty. Include the required header and incident records.")
    if "\x00" in text:
        raise ValueError("The uploaded file contains null bytes and is not valid CSV text.")

    try:
        reader = csv.DictReader(io.StringIO(text, newline=""), strict=True)
        if reader.fieldnames is None:
            raise ValueError("The CSV has no header row. Include the required column names.")

        headers = [header.strip() if header else "" for header in reader.fieldnames]
        if len(headers) != len(set(headers)):
            raise ValueError("The CSV contains duplicate column names.")
        missing_columns = sorted(REQUIRED_COLUMNS - set(headers))
        if missing_columns:
            raise ValueError(
            "The file does not match the incidents CSV format. Missing required columns: "
            + ", ".join(missing_columns)
            )

        records: list[dict[str, str | None]] = []
        extra_rows = 0
        for raw_row in reader:
            extra_values = raw_row.pop(None, None)
            row_has_extra = bool(extra_values)
            if row_has_extra:
                extra_rows += 1
            record = {
                (key.strip() if key else ""): value
                for key, value in raw_row.items()
            }
            record["__malformed_extra_cells__"] = row_has_extra
            records.append(record)
        if not records:
            raise ValueError("The CSV contains a header but no incident records.")
        return records, extra_rows
    except csv.Error:
        raise ValueError(
            "The CSV structure is malformed. Check that every quoted field is properly closed."
        ) from None


def read_records(path: Path) -> tuple[list[dict[str, str | None]], int]:
    """Read a UTF-8 CSV path and return records plus count of rows with extra cells."""
    try:
        text = path.read_text(encoding="utf-8-sig")
    except OSError as error:
        raise ValueError(f"Unable to read input file: {error.strerror or 'file error'}.") from None
    except UnicodeDecodeError:
        raise ValueError("The input file must use UTF-8 encoding.") from None
    return read_records_from_text(text)


def analyze(records: list[dict[str, str | None]], extra_rows: int = 0) -> dict[str, object]:
    """Compute validation counts and aggregate metrics; no source rows are returned."""
    issue_counts: Counter[str] = Counter()
    valid_records: list[dict[str, str | None]] = []
    seen_incident_ids: set[str] = set()
    for record in records:
        row_has_extra = bool(record.get("__malformed_extra_cells__", False))
        issues = validate_record(record, row_has_extra)
        incident_id = (record.get("incident_id") or "").strip()
        if INCIDENT_ID_PATTERN.fullmatch(incident_id):
            if incident_id in seen_incident_ids:
                issues.append("duplicate_incident_id")
            else:
                seen_incident_ids.add(incident_id)
        issue_counts.update(issues)
        if not issues:
            valid_records.append(record)

    categories = Counter((record.get("category") or "").strip().upper() for record in valid_records)
    statuses = Counter((record.get("status") or "").strip().upper() for record in valid_records)
    countries = Counter((record.get("country") or "").strip().upper() for record in valid_records)
    scored_closed = [
        int((record.get("satisfaction_score") or "").strip())
        for record in valid_records
        if (record.get("status") or "").strip().upper() == "CLOSED"
    ]

    return {
        "total": len(records),
        "valid": len(valid_records),
        "invalid": len(records) - len(valid_records),
        "issue_counts": issue_counts,
        "categories": categories,
        "statuses": statuses,
        "countries": countries,
        "scored_closed": scored_closed,
    }


def analyze_csv_text(text: str) -> dict[str, object]:
    """Parse and analyze in-memory CSV text using the same logic as the CLI."""
    records, extra_rows = read_records_from_text(text)
    return analyze(records, extra_rows)


def analyze_csv_bytes(content: bytes) -> dict[str, object]:
    """Decode and analyze in-memory UTF-8 CSV bytes."""
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise ValueError("The input file must use UTF-8 encoding.") from None
    return analyze_csv_text(text)


def percentage(part: int, total: int) -> float:
    return (part / total * 100) if total else 0.0


def print_breakdown(title: str, counts: Counter[str], labels: tuple[str, ...], total: int) -> None:
    print(f"\n{title}")
    if not total:
        print("  No valid records.")
        return
    for label in labels:
        count = counts.get(label, 0)
        print(f"  ├─ {label:<25} {count:>6}  ({percentage(count, total):5.1f}%)")


def print_summary(source: str, summary: dict[str, object]) -> None:
    total = int(summary["total"])
    valid = int(summary["valid"])
    invalid = int(summary["invalid"])
    issue_counts = summary["issue_counts"]
    assert isinstance(issue_counts, Counter)

    print("=" * 60)
    print("  TRACKFLOW — INCIDENT REPORT ANALYSIS")
    print(f"  Source file: {source}")
    print("=" * 60)
    print(f"\nTOTAL RECORDS IN FILE .......... {total}")
    print(f"  ├─ Valid records .............. {valid}")
    print(f"  └─ Invalid / incomplete ....... {invalid}")

    print("\nINVALID RECORDS BREAKDOWN")
    found_issue = False
    for rule, label in INVALID_LABELS.items():
        count = issue_counts.get(rule, 0)
        if count:
            found_issue = True
            print(f"  ├─ {label:<39} {count:>5}")
    if not found_issue:
        print("  No invalid records.")
    print("  (A record with multiple problems is counted in each applicable rule.)")

    categories = summary["categories"]
    statuses = summary["statuses"]
    countries = summary["countries"]
    assert isinstance(categories, Counter)
    assert isinstance(statuses, Counter)
    assert isinstance(countries, Counter)
    print_breakdown("BREAKDOWN BY CATEGORY (valid records)", categories, CATEGORIES, valid)
    print_breakdown("BREAKDOWN BY STATUS (valid records)", statuses, STATUSES, valid)
    print_breakdown("BREAKDOWN BY COUNTRY (valid records)", countries, ("US", "ES"), valid)

    scores = summary["scored_closed"]
    assert isinstance(scores, list)
    closed_count = statuses.get("CLOSED", 0)
    print("\nSATISFACTION INDEX (valid closed incidents)")
    print(f"  Scored incidents: {len(scores)} of {closed_count}")
    average = sum(scores) / len(scores) if scores else None
    print(f"  Average score: {average:.2f} / 5.00" if average is not None else "  Average score: N/A")
    score_labels = {
        1: "Very dissatisfied",
        2: "Dissatisfied",
        3: "Neutral",
        4: "Satisfied",
        5: "Very satisfied",
    }
    score_counts = Counter(scores)
    for score, label in score_labels.items():
        print(f"  ├─ Score {score} ({label}){' ' * max(1, 19 - len(label))} {score_counts[score]}")
    print("\n" + "=" * 60)


def export_summary(path: Path, summary: dict[str, object]) -> None:
    """Export aggregate metrics only. No source row values are written."""
    try:
        path.write_text(serialize_summary(summary), encoding="utf-8", newline="")
    except OSError as error:
        raise ValueError(f"Unable to write results file: {error.strerror or 'file error'}.") from None


def serialize_summary(summary: dict[str, object]) -> str:
    """Serialize aggregate metrics to CSV text, never including source row values."""
    categories = summary["categories"]
    statuses = summary["statuses"]
    countries = summary["countries"]
    issue_counts = summary["issue_counts"]
    scores = summary["scored_closed"]
    assert isinstance(categories, Counter)
    assert isinstance(statuses, Counter)
    assert isinstance(countries, Counter)
    assert isinstance(issue_counts, Counter)
    assert isinstance(scores, list)

    metrics: list[tuple[str, str]] = [
        ("total_records", str(summary["total"])),
        ("valid_records", str(summary["valid"])),
        ("invalid_records", str(summary["invalid"])),
    ]
    metrics.extend((f"invalid_{rule}", str(issue_counts.get(rule, 0))) for rule in INVALID_LABELS)
    metrics.extend((f"category_{key}", str(categories.get(key, 0))) for key in CATEGORIES)
    metrics.extend((f"status_{key}", str(statuses.get(key, 0))) for key in STATUSES)
    metrics.extend((f"country_{key}", str(countries.get(key, 0))) for key in ("US", "ES"))
    metrics.extend(
        [
            ("closed_scored_incidents", str(len(scores))),
            ("closed_incidents", str(statuses.get("CLOSED", 0))),
            (
                "average_satisfaction_score",
                f"{sum(scores) / len(scores):.2f}" if scores else "",
            ),
        ]
    )
    score_counts = Counter(scores)
    metrics.extend((f"satisfaction_score_{score}", str(score_counts[score])) for score in range(1, 6))

    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(("metric", "value"))
    writer.writerows(metrics)
    return output.getvalue()
