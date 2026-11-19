"""User model and TinyDB persistence for API authentication."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field
from tinydb import Query, TinyDB


class UserRole(str, Enum):
    """Roles supported by the authentication model."""

    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"


class User(BaseModel):
    """Authentication identity; profile and contact data belong elsewhere."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(default_factory=lambda: str(uuid4()))
    email: str
    hashed_password: str
    is_active: bool = True
    role: UserRole = UserRole.USER
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProfileCreate(BaseModel):
    """Optional visible name and contact information stored separately."""

    model_config = ConfigDict(extra="forbid")

    name: str | None = None
    phone: str | None = None
    address: str | None = None


class UserCreate(BaseModel):
    """Registration fields; passwords are supplied unhashed only in transit."""

    model_config = ConfigDict(extra="forbid")

    email: str
    password: str = Field(min_length=8)
    name: str | None = None
    phone: str | None = None
    address: str | None = None


class Profile(BaseModel):
    """User's visible profile, stored independently from authentication data."""

    model_config = ConfigDict(extra="forbid")

    user_id: str
    name: str | None = None
    phone: str | None = None
    address: str | None = None


class UserUpdate(BaseModel):
    """Fields that may be changed after user creation."""

    model_config = ConfigDict(extra="forbid")

    email: str | None = None
    password: str | None = Field(default=None, min_length=8)
    is_active: bool | None = None
    role: UserRole | None = None


class UserResponse(BaseModel):
    """Public user representation that never exposes the password hash."""

    id: str
    email: str
    is_active: bool
    role: UserRole
    created_at: datetime
    profile: Profile


class UserLogin(BaseModel):
    """Credentials submitted to obtain an access token."""

    email: str
    password: str


class UserRepository:
    """Persist and retrieve authentication users from TinyDB."""

    def __init__(self, database: TinyDB, table_name: str = "users") -> None:
        self._table = database.table(table_name)

    def create(self, user: User) -> User:
        self._table.insert(user.model_dump(mode="json"))
        return user

    def get_by_id(self, user_id: str) -> User | None:
        document = self._table.get(Query().id == user_id)
        return User.model_validate(document) if document is not None else None

    def get_by_email(self, email: str) -> User | None:
        document = self._table.get(Query().email == email)
        return User.model_validate(document) if document is not None else None

    def get_all(self) -> list[User]:
        return [User.model_validate(document) for document in self._table.all()]

    def update(self, user: User) -> bool:
        updated_ids = self._table.update(
            user.model_dump(mode="json"), Query().id == user.id
        )
        return bool(updated_ids)

    def delete(self, user_id: str) -> bool:
        return bool(self._table.remove(Query().id == user_id))


class ProfileRepository:
    """Persist visible profile data separately from authentication users."""

    def __init__(self, database: TinyDB, table_name: str = "profiles") -> None:
        self._table = database.table(table_name)

    def create(self, profile: Profile) -> Profile:
        self._table.insert(profile.model_dump(mode="json"))
        return profile

    def get_by_user_id(self, user_id: str) -> Profile | None:
        document = self._table.get(Query().user_id == user_id)
        return Profile.model_validate(document) if document is not None else None

    def delete_by_user_id(self, user_id: str) -> bool:
        return bool(self._table.remove(Query().user_id == user_id))
