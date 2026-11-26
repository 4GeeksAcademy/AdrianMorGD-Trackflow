"""Persistence contract for the supplier application layer."""

from typing import Protocol

from services.api.suppliers import Supplier, SupplierCreate


class SupplierRepository(Protocol):
    """Operations required by supplier use cases, independent of storage."""

    def create(self, supplier_data: SupplierCreate) -> Supplier:
        """Persist a supplier and return it with its assigned ID."""

    def list(self) -> list[Supplier]:
        """Return all persisted suppliers."""

    def get(self, supplier_id: int) -> Supplier | None:
        """Return a supplier by ID, if it exists."""

    def save(self, supplier: Supplier) -> None:
        """Persist changes to an existing supplier."""

    def delete(self, supplier_id: int) -> bool:
        """Delete a supplier and report whether it existed."""