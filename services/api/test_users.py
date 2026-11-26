"""Tests for the authentication user model and TinyDB repository."""

import unittest
from datetime import datetime, timezone

from tinydb import TinyDB
from tinydb.storages import MemoryStorage

from services.api.user_tinydb import TinyDBUserRepository
from services.api.users import User, UserRole


class UserModelTests(unittest.TestCase):
    def setUp(self) -> None:
        self.database = TinyDB(storage=MemoryStorage)
        self.repository = TinyDBUserRepository(self.database)

    def tearDown(self) -> None:
        self.database.close()

    def test_user_defaults_and_fields_are_authentication_only(self) -> None:
        user = User(email="user@example.com", hashed_password="hashed-value")

        self.assertTrue(user.id)
        self.assertTrue(user.is_active)
        self.assertEqual(user.role, "user")
        self.assertIsInstance(user.created_at, datetime)
        self.assertEqual(user.created_at.tzinfo, timezone.utc)
        self.assertEqual(
            set(user.model_dump()),
            {"id", "email", "hashed_password", "is_active", "role", "created_at"},
        )

    def test_rejects_visible_name_and_contact_fields(self) -> None:
        with self.assertRaises(ValueError):
            User(
                email="user@example.com",
                hashed_password="hashed-value",
                name="Visible Name",
            )

        with self.assertRaises(ValueError):
            User(
                email="user@example.com",
                hashed_password="hashed-value",
                phone="+1-555-0100",
            )

    def test_role_only_accepts_supported_values(self) -> None:
        for role in (UserRole.ADMIN, UserRole.MANAGER, UserRole.USER):
            with self.subTest(role=role):
                user = User(
                    email="user@example.com",
                    hashed_password="hashed-value",
                    role=role,
                )
                self.assertEqual(user.role, role)

        for role in ("owner", "maanager"):
            with self.subTest(role=role), self.assertRaises(ValueError):
                User(
                    email="user@example.com",
                    hashed_password="hashed-value",
                    role=role,
                )

    def test_repository_persists_and_retrieves_user(self) -> None:
        user = User(
            email="user@example.com",
            hashed_password="hashed-value",
            role="admin",
        )
        self.repository.create(user)

        self.assertEqual(self.repository.get_by_id(user.id), user)
        self.assertEqual(self.repository.get_by_email(user.email), user)
        self.assertIsNone(self.repository.get_by_id("missing"))

        stored_document = self.database.table("users").all()[0]
        self.assertEqual(
            set(stored_document),
            {"id", "email", "hashed_password", "is_active", "role", "created_at"},
        )


if __name__ == "__main__":
    unittest.main()
