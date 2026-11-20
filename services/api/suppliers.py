"""Pydantic model for logistics suppliers."""

from datetime import datetime, timezone
from enum import Enum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


SupplierCountry = Literal["United States", "Spain"]
SupplierProductCategory = Literal[
    "Fashion",
    "Electronics",
    "Cosmetics",
    "Home",
    "Other",
]


class SupplierStatus(str, Enum):
    """Allowed lifecycle states for a supplier."""

    ACTIVE = "active"
    SUSPENDED = "suspended"


class SupplierCreate(BaseModel):
    """Supplier fields accepted when registering a supplier."""

    model_config = ConfigDict(extra="forbid")

    name: str
    country: SupplierCountry
    product_categories: list[SupplierProductCategory]
    rate: float = Field(gt=0)  # Currency and pricing unit are not specified.
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    status: SupplierStatus


class SupplierRateUpdate(BaseModel):
    """Positive rate value accepted by the supplier rate update endpoint."""

    model_config = ConfigDict(extra="forbid")

    rate: float = Field(gt=0)


class SupplierStatusUpdate(BaseModel):
    """Status value accepted by the supplier activation endpoint."""

    model_config = ConfigDict(extra="forbid")

    status: SupplierStatus


class Supplier(SupplierCreate):
    """Persisted supplier response, including TinyDB's document ID."""

    id: int
