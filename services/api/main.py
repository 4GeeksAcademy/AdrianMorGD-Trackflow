"""FastAPI endpoints for TrackFlow incident reporting."""

from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile

from adrianmorgd_trackflow.incidents.analyzer import (
    CATEGORIES,
    INVALID_LABELS,
    STATUSES,
    analyze_csv_bytes,
)

app = FastAPI(title="TrackFlow API")

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {
    "text/csv",
    "application/vnd.ms-excel",
    "application/octet-stream",
}


@app.get("/")
async def health_check() -> dict[str, str]:
    """Report that the API process is responding."""
    return {"status": "ok"}


def _build_api_report(summary: dict[str, object]) -> dict[str, object]:
    """Translate the shared analyzer summary into the endpoint response schema."""
    issue_counts = summary["issue_counts"]
    categories = summary["categories"]
    statuses = summary["statuses"]
    countries = summary["countries"]
    scores = summary["scored_closed"]

    valid_count = int(summary["valid"])
    return {
        "total_records": int(summary["total"]),
        "valid_records": valid_count,
        "invalid_records": int(summary["invalid"]),
        "invalid_breakdown": {
            rule: {"description": INVALID_LABELS[rule], "count": issue_counts.get(rule, 0)}
            for rule in INVALID_LABELS
            if issue_counts.get(rule, 0)
        },
        "category_breakdown": {
            category: {
                "count": categories.get(category, 0),
                "percentage": round(categories.get(category, 0) / valid_count * 100, 1)
                if valid_count
                else 0.0,
            }
            for category in CATEGORIES
        },
        "status_breakdown": {
            status: {
                "count": statuses.get(status, 0),
                "percentage": round(statuses.get(status, 0) / valid_count * 100, 1)
                if valid_count
                else 0.0,
            }
            for status in STATUSES
        },
        "country_breakdown": {
            country: {
                "count": countries.get(country, 0),
                "percentage": round(countries.get(country, 0) / valid_count * 100, 1)
                if valid_count
                else 0.0,
            }
            for country in ("US", "ES")
        },
        "satisfaction": {
            "scored_closed_incidents": len(scores),
            "closed_incidents": statuses.get("CLOSED", 0),
            "average_score": round(sum(scores) / len(scores), 2) if scores else None,
            "score_breakdown": {str(score): scores.count(score) for score in range(1, 6)},
        },
    }


@app.post("/api/incidents/analyze")
async def analyze_incidents(file: UploadFile = File(...)) -> dict[str, object]:
    """Analyze an uploaded CSV; personally identifiable data is never returned."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail="Upload a CSV file using multipart/form-data.")

    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="CSV exceeds the 10 mebibyte upload limit.")

    try:
        summary = analyze_csv_bytes(content)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from None
    return _build_api_report(summary)
