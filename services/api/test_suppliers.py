"""Tests for supplier registration and TinyDB persistence."""

import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient
from tinydb import TinyDB

from services.api import main as api_main
from services.api.auth import create_access_token
from services.api.supplier_service import SupplierService
from services.api.supplier_tinydb import TinyDBSupplierRepository
from services.api.users import User


class SupplierEndpointTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.database = TinyDB(Path(self.temp_dir.name) / "suppliers.json")
        self.table = self.database.table("suppliers")
        self.service_patch = patch.object(
            api_main.app.state,
            "supplier_service",
            SupplierService(TinyDBSupplierRepository(self.table)),
        )
        self.service_patch.start()
        self.auth_secret_patch = patch(
            "services.api.auth.JWT_SECRET", "test-secret-value-with-32-bytes-minimum"
        )
        self.auth_secret_patch.start()
        self.test_user = User(email="supplier-tests@example.com", hashed_password="unused")
        self.user_lookup_patch = patch.object(
            api_main.user_service, "get_user_by_id", return_value=self.test_user
        )
        self.user_lookup_patch.start()
        token = create_access_token(self.test_user)
        self.client = TestClient(
            api_main.app,
            headers={"Authorization": f"Bearer {token}"},
        )

    def tearDown(self) -> None:
        self.user_lookup_patch.stop()
        self.auth_secret_patch.stop()
        self.service_patch.stop()
        self.database.close()
        self.temp_dir.cleanup()

    def valid_supplier(self) -> dict[str, object]:
        return {
            "name": "Northstar Textiles",
            "country": "United States",
            "product_categories": ["Fashion"],
            "rate": 2.5,
            "status": "active",
        }

    def test_create_supplier_returns_tinydb_assigned_id(self) -> None:
        response = self.client.post("/suppliers", json=self.valid_supplier())

        self.assertEqual(response.status_code, 201, response.text)
        created = response.json()
        self.assertEqual(created["id"], 1)
        self.assertEqual(created["name"], "Northstar Textiles")
        self.assertEqual(created["status"], "active")
        self.assertEqual(self.table.get(doc_id=created["id"])["name"], created["name"])

    def test_supplier_routes_reject_requests_without_authentication(self) -> None:
        anonymous_client = TestClient(api_main.app)
        responses = (
            anonymous_client.post("/suppliers", json=self.valid_supplier()),
            anonymous_client.get("/suppliers"),
            anonymous_client.get("/suppliers/1"),
            anonymous_client.patch("/suppliers/1/rate", json={"rate": 3.0}),
            anonymous_client.patch("/suppliers/1", json={"status": "suspended"}),
            anonymous_client.delete("/suppliers/1"),
        )

        for response in responses:
            with self.subTest(path=response.request.url.path, method=response.request.method):
                self.assertEqual(response.status_code, 401, response.text)

    def test_create_supplier_rejects_invalid_inputs_with_422(self) -> None:
        invalid_payloads = (
            {**self.valid_supplier(), "rate": 0},
            {**self.valid_supplier(), "status": "pending"},
            {**self.valid_supplier(), "country": "Canada"},
            {**self.valid_supplier(), "unexpected": "field"},
            {key: value for key, value in self.valid_supplier().items() if key != "name"},
        )

        for payload in invalid_payloads:
            with self.subTest(payload=payload):
                response = self.client.post("/suppliers", json=payload)
                self.assertEqual(response.status_code, 422, response.text)

        self.assertEqual(len(self.table), 0)

    def test_list_suppliers_returns_all_when_no_filters_are_provided(self) -> None:
        self.client.post("/suppliers", json=self.valid_supplier())
        self.client.post(
            "/suppliers",
            json={
                **self.valid_supplier(),
                "name": "Iberian Electronics",
                "country": "Spain",
                "product_categories": ["Electronics", "Home"],
            },
        )

        response = self.client.get("/suppliers")

        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(len(response.json()), 2)
        self.assertEqual([supplier["id"] for supplier in response.json()], [1, 2])

    def test_list_suppliers_filters_by_country_and_product_category(self) -> None:
        self.client.post("/suppliers", json=self.valid_supplier())
        self.client.post(
            "/suppliers",
            json={
                **self.valid_supplier(),
                "name": "Iberian Electronics",
                "country": "Spain",
                "product_categories": ["Electronics", "Home"],
            },
        )
        self.client.post(
            "/suppliers",
            json={
                **self.valid_supplier(),
                "name": "US Cosmetics",
                "product_categories": ["Cosmetics"],
            },
        )

        spain = self.client.get("/suppliers", params={"country": "Spain"})
        fashion = self.client.get(
            "/suppliers", params={"product_category": "Fashion"}
        )
        matching_both = self.client.get(
            "/suppliers",
            params={"country": "Spain", "product_category": "Electronics"},
        )
        mismatched_both = self.client.get(
            "/suppliers",
            params={"country": "Spain", "product_category": "Fashion"},
        )

        self.assertEqual([item["name"] for item in spain.json()], ["Iberian Electronics"])
        self.assertEqual([item["name"] for item in fashion.json()], ["Northstar Textiles"])
        self.assertEqual(len(matching_both.json()), 1)
        self.assertEqual(mismatched_both.json(), [])

    def test_list_suppliers_rejects_invalid_filter_values(self) -> None:
        invalid_country = self.client.get("/suppliers", params={"country": "Canada"})
        invalid_category = self.client.get(
            "/suppliers", params={"product_category": "Food"}
        )

        self.assertEqual(invalid_country.status_code, 422)
        self.assertEqual(invalid_category.status_code, 422)

    def test_get_supplier_returns_supplier_by_tinydb_id(self) -> None:
        created = self.client.post("/suppliers", json=self.valid_supplier()).json()

        response = self.client.get(f"/suppliers/{created['id']}")

        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json(), created)

    def test_get_supplier_returns_404_when_id_does_not_exist(self) -> None:
        response = self.client.get("/suppliers/999")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Supplier not found.")

    def test_patch_supplier_rate_updates_rate_and_timestamp(self) -> None:
        created = self.client.post("/suppliers", json=self.valid_supplier()).json()
        original_timestamp = created["updated_at"]

        response = self.client.patch(
            f"/suppliers/{created['id']}/rate", json={"rate": 4.25}
        )

        self.assertEqual(response.status_code, 200, response.text)
        updated = response.json()
        self.assertEqual(updated["rate"], 4.25)
        self.assertNotEqual(updated["updated_at"], original_timestamp)
        parsed_timestamp = datetime.fromisoformat(updated["updated_at"])
        self.assertEqual(parsed_timestamp.utcoffset(), timezone.utc.utcoffset(None))
        stored = self.table.get(doc_id=created["id"])
        self.assertEqual(stored["rate"], 4.25)
        self.assertEqual(stored["updated_at"], updated["updated_at"])

    def test_patch_supplier_rate_rejects_non_positive_rate_without_changes(self) -> None:
        created = self.client.post("/suppliers", json=self.valid_supplier()).json()
        before = dict(self.table.get(doc_id=created["id"]))

        for rate in (0, -1):
            with self.subTest(rate=rate):
                response = self.client.patch(
                    f"/suppliers/{created['id']}/rate", json={"rate": rate}
                )
                self.assertEqual(response.status_code, 422, response.text)
                self.assertEqual(dict(self.table.get(doc_id=created["id"])), before)

    def test_patch_supplier_rate_returns_404_for_unknown_supplier(self) -> None:
        response = self.client.patch("/suppliers/999/rate", json={"rate": 3.0})

        self.assertEqual(response.status_code, 404)

    def test_patch_supplier_status_accepts_each_enum_value(self) -> None:
        created = self.client.post("/suppliers", json=self.valid_supplier()).json()

        for status in ("suspended", "active"):
            with self.subTest(status=status):
                response = self.client.patch(
                    f"/suppliers/{created['id']}", json={"status": status}
                )
                self.assertEqual(response.status_code, 200, response.text)
                self.assertEqual(response.json()["status"], status)
                stored = self.table.get(doc_id=created["id"])
                self.assertEqual(stored["status"], status)

    def test_patch_supplier_status_rejects_unsupported_values(self) -> None:
        created = self.client.post("/suppliers", json=self.valid_supplier()).json()
        before = dict(self.table.get(doc_id=created["id"]))

        for status in ("pending", "ACTIVE", ""):
            with self.subTest(status=status):
                response = self.client.patch(
                    f"/suppliers/{created['id']}", json={"status": status}
                )
                self.assertEqual(response.status_code, 422, response.text)
                self.assertEqual(dict(self.table.get(doc_id=created["id"])), before)

    def test_patch_supplier_status_returns_404_for_unknown_supplier(self) -> None:
        response = self.client.patch("/suppliers/999", json={"status": "suspended"})

        self.assertEqual(response.status_code, 404)

    def test_delete_supplier_removes_record_and_returns_no_content(self) -> None:
        created = self.client.post("/suppliers", json=self.valid_supplier()).json()

        response = self.client.delete(f"/suppliers/{created['id']}")

        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.content, b"")
        self.assertIsNone(self.table.get(doc_id=created["id"]))
        self.assertEqual(self.client.get("/suppliers").json(), [])

    def test_delete_supplier_returns_404_when_id_does_not_exist(self) -> None:
        response = self.client.delete("/suppliers/999")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Supplier not found.")


if __name__ == "__main__":
    unittest.main()