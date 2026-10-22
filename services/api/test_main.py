"""Tests for the incident CSV analysis endpoint."""

import unittest

from fastapi.testclient import TestClient

from services.api import main as api_main

app = api_main.app


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
        api_main._last_analysis = None

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
        self.assertIn("does not match the incidents CSV format", response.json()["detail"])

    def test_rejects_empty_csv_with_descriptive_message(self) -> None:
        response = self.client.post(
            "/api/incidents/analyze",
            files={"file": ("empty.csv", "", "text/csv")},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("uploaded CSV is empty", response.json()["detail"])

    def test_rejects_header_only_csv_with_descriptive_message(self) -> None:
        response = self.client.post(
            "/api/incidents/analyze",
            files={"file": ("incidents.csv", CSV_HEADER, "text/csv")},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("no incident records", response.json()["detail"])

    def test_rejects_malformed_csv_quoting_with_descriptive_message(self) -> None:
        malformed_csv = CSV_HEADER + 'TRF-000001,2026-10-01,US,B2B,TRACK123,UPS,LOST_PARCEL,"unfinished,CLOSED,customer@example.com,4\n'
        response = self.client.post(
            "/api/incidents/analyze",
            files={"file": ("incidents.csv", malformed_csv, "text/csv")},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("CSV structure is malformed", response.json()["detail"])

    def test_rejects_non_utf8_csv_with_descriptive_message(self) -> None:
        response = self.client.post(
            "/api/incidents/analyze",
            files={"file": ("incidents.csv", b"\xff\xfe\x00", "text/csv")},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("UTF-8 encoding", response.json()["detail"])

    def test_rejects_non_csv_content_type(self) -> None:
        response = self.client.post(
            "/api/incidents/analyze",
            files={"file": ("incidents.txt", "some text", "text/plain")},
        )

        self.assertEqual(response.status_code, 415)
        self.assertIn("Upload a CSV file using multipart/form-data", response.json()["detail"])

    def test_export_returns_404_until_analysis_exists(self) -> None:
        response = self.client.get("/api/incidents/results/export")

        self.assertEqual(response.status_code, 404)

    def test_export_downloads_last_analysis_as_csv_without_personal_data(self) -> None:
        analysis_response = self.client.post(
            "/api/incidents/analyze",
            files={"file": ("incidents.csv", CSV_HEADER + VALID_ROW, "text/csv")},
        )
        self.assertEqual(analysis_response.status_code, 200)

        response = self.client.get("/api/incidents/results/export")

        self.assertEqual(response.status_code, 200)
        self.assertIn("text/csv", response.headers["content-type"])
        self.assertIn('attachment; filename="incident-analysis.csv"', response.headers["content-disposition"])
        self.assertIn("metric,value", response.text)
        self.assertIn("total_records,1", response.text)
        self.assertNotIn("customer@example.com", response.text)


if __name__ == "__main__":
    unittest.main()