"""Application use cases for incident CSV analysis and aggregate export."""

from collections import Counter

from adrianmorgd_trackflow.incidents.analyzer import (
    CATEGORIES,
    INVALID_LABELS,
    STATUSES,
    analyze_csv_bytes,
    serialize_summary,
)


class IncidentAnalysisError(ValueError):
    """Raised when uploaded incident data cannot be parsed or analyzed."""


class NoIncidentAnalysisError(LookupError):
    """Raised when no analysis is available to export."""


class IncidentService:
    """Analyze CSV bytes and retain the latest aggregate result for export."""

    def __init__(self) -> None:
        self._last_analysis: dict[str, object] | None = None

    def analyze(self, content: bytes) -> dict[str, object]:
        """Analyze a CSV upload and return the public aggregate report."""
        try:
            summary = analyze_csv_bytes(content)
        except ValueError as error:
            raise IncidentAnalysisError(str(error)) from error
        self._last_analysis = summary
        return self._build_report(summary)

    def export_last_analysis(self) -> str:
        """Return aggregate metrics for the latest analysis as CSV text."""
        if self._last_analysis is None:
            raise NoIncidentAnalysisError
        return serialize_summary(self._last_analysis)

    @staticmethod
    def _build_report(summary: dict[str, object]) -> dict[str, object]:
        """Translate the analyzer summary into the endpoint response schema."""
        issue_counts = summary["issue_counts"]
        categories = summary["categories"]
        statuses = summary["statuses"]
        countries = summary["countries"]
        scores = summary["scored_closed"]
        assert isinstance(issue_counts, Counter)
        assert isinstance(categories, Counter)
        assert isinstance(statuses, Counter)
        assert isinstance(countries, Counter)
        assert isinstance(scores, list)

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