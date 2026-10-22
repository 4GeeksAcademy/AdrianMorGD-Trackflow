"""Tests for the incident CSV analysis endpoint."""

import unittest

from fastapi.testclient import TestClient

from services.api.main import app


CSV_HEADER = (
    "incident_id,date,country,customer_type,tracking_number,carrier,category,"
    "description,status,customer_email,satisfaction_score\n"
)
VALID_ROW = (
    "TRF-000001,2026-10-01,US,B2B,TRACK123,UPS,LOST_PARCEL,"
    "Package missing,CLOSED,customer@example.com,4\n"
)


class AnalyzeIncidentsEndpointTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_returns_aggregates_without_personal_data(self) -> None:
        response = self.client.post(
            "/api/incidents/analyze",
            files={"file": ("incidents.csv", CSV_HEADER + VALID_ROW, "text/csv")},
        )

        self.assertEqual(response.status_code, 200)
        report = response.json()
        self.assertEqual(report["total_records"], 1)
        self.assertEqual(report["valid_records"], 1)
        self.assertEqual(report["invalid_records"], 0)
        self.assertEqual(report["satisfaction"]["average_score"], 4.0)
        self.assertNotIn("customer@example.com", response.text)

    def test_invalid_row_is_counted_by_rule_without_echoing_values(self) -> None:
        invalid_row = VALID_ROW.replace("TRACK123", "short").replace(
            "customer@example.com", "private@example.com"
        )
        response = self.client.post(
            "/api/incidents/analyze",
            files={"file": ("incidents.csv", CSV_HEADER + invalid_row, "text/csv")},
        )

        self.assertEqual(response.status_code, 200)
        report = response.json()
        self.assertEqual(report["invalid_records"], 1)
        self.assertEqual(report["invalid_breakdown"]["tracking_number"]["count"], 1)
        self.assertNotIn("private@example.com", response.text)

    def test_rejects_missing_required_columns(self) -> None:
        response = self.client.post(
            "/api/incidents/analyze",
            files={"file": ("incidents.csv", "incident_id,date\n", "text/csv")},
        )

        self.assertEqual(response.status_code, 400)

    def test_rejects_non_csv_content_type(self) -> None:
        response = self.client.post(
            "/api/incidents/analyze",
            files={"file": ("incidents.txt", "some text", "text/plain")},
        )

        self.assertEqual(response.status_code, 415)


if __name__ == "__main__":
    unittest.main()