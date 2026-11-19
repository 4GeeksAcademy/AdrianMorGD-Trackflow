"""Tests for the incident CSV analysis endpoint."""

import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from services.api import main as api_main
from services.api.auth import create_access_token

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
        api_main._users_database.drop_tables()
        self.jwt_secret = patch("services.api.auth.JWT_SECRET", "test-secret-value-with-32-bytes-minimum")
        self.jwt_secret.start()

    def tearDown(self) -> None:
        self.jwt_secret.stop()

    def register_user(
        self,
        email: str = "new@example.com",
        role: str | None = None,
        **profile: str,
    ) -> dict[str, object]:
        payload: dict[str, object] = {
            "email": email,
            "password": "correct-horse-battery",
            **profile,
        }
        if role is not None:
            payload["role"] = role
        response = self.client.post("/users", json=payload)
        self.assertEqual(response.status_code, 201, response.text)
        return response.json()

    def authorization(self, user_id: str) -> dict[str, str]:
        user = api_main.user_service.get_user_by_id(user_id)
        assert user is not None
        return {"Authorization": f"Bearer {create_access_token(user)}"}

    def test_create_user_defaults_to_user_and_does_not_return_password_hash(self) -> None:
        response = self.client.post("/users", json={
            "email": "new@example.com",
            "password": "correct-horse-battery",
            "name": "New User",
            "phone": "+1-555-0100",
            "address": "Los Angeles",
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["role"], "user")
        created = response.json()
        self.assertNotIn("hashed_password", created)
        self.assertEqual(created["profile"]["name"], "New User")
        user = api_main.user_service.get_user_by_id(created["id"])
        self.assertIsNotNone(user)
        assert user is not None
        self.assertNotEqual(user.hashed_password, "correct-horse-battery")

    def test_create_user_rejects_unsupported_role(self) -> None:
        response = self.client.post(
            "/users",
            json={
                "email": "new@example.com",
                "password": "correct-horse-battery",
                "role": "owner",
            },
        )

        self.assertEqual(response.status_code, 422)

    def test_create_user_rejects_duplicate_email(self) -> None:
        payload = {"email": "new@example.com", "password": "correct-horse-battery"}

        first_response = self.client.post("/users", json=payload)
        duplicate_response = self.client.post("/users", json=payload)

        self.assertEqual(first_response.status_code, 201)
        self.assertEqual(duplicate_response.status_code, 409)

    def test_user_routes_require_authentication(self) -> None:
        created = self.register_user()
        response = self.client.get(f"/users/{created['id']}")
        self.assertEqual(response.status_code, 401)

    def test_regular_user_can_access_own_record_but_not_another_user(self) -> None:
        owner = self.register_user("owner@example.com")
        other = self.register_user("other@example.com")
        headers = self.authorization(str(owner["id"]))

        own_response = self.client.get(f"/users/{owner['id']}", headers=headers)
        other_response = self.client.get(f"/users/{other['id']}", headers=headers)

        self.assertEqual(own_response.status_code, 200)
        self.assertEqual(other_response.status_code, 403)

    def test_admin_can_list_users_and_change_role(self) -> None:
        admin = self.register_user("admin@example.com")
        admin_user = api_main.user_service.get_user_by_id(str(admin["id"]))
        assert admin_user is not None
        promoted_admin = admin_user.model_copy(update={"role": api_main.UserRole.ADMIN})
        api_main.user_repository.update(promoted_admin)
        target = self.register_user("target@example.com")
        headers = self.authorization(str(admin["id"]))

        list_response = self.client.get("/users", headers=headers)
        update_response = self.client.put(
            f"/users/{target['id']}", json={"role": "manager"}, headers=headers
        )

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()), 2)
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()["role"], "manager")

    def test_user_cannot_change_own_role_and_delete_removes_profile(self) -> None:
        user = self.register_user("owner@example.com", name="Owner")
        headers = self.authorization(str(user["id"]))
        denied = self.client.put(
            f"/users/{user['id']}", json={"role": "admin"}, headers=headers
        )

        self.assertEqual(denied.status_code, 403)
        deleted = self.client.delete(f"/users/{user['id']}", headers=headers)
        self.assertEqual(deleted.status_code, 204)
        self.assertIsNone(api_main.profile_repository.get_by_user_id(str(user["id"])))

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

    def test_allows_backoffice_origin_for_browser_api_requests(self) -> None:
        response = self.client.options(
            "/api/incidents/analyze",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["access-control-allow-origin"], "http://localhost:3000")

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