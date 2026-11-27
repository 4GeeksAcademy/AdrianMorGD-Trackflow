"""User model and TinyDB persistence for API authentication."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


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


class ProfileUpdate(BaseModel):
    """Editable visible fields on an authenticated user's profile."""

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


class AuthenticatedUserResponse(BaseModel):
    """Minimal identity and profile data for the authenticated user."""

    email: str
    role: UserRole
    profile: Profile


class UserLogin(BaseModel):
    """Credentials submitted to obtain an access token."""

    email: str
    password: str
