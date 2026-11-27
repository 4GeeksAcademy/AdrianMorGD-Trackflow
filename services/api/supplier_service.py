"""Supplier application use cases."""

from datetime import datetime, timezone

from services.api.supplier_port import SupplierRepository
from services.api.suppliers import (
    Supplier,
    SupplierCountry,
    SupplierCreate,
    SupplierProductCategory,
    SupplierStatus,
)


class SupplierNotFoundError(LookupError):
    """Raised when a requested supplier does not exist."""


class SupplierService:
    """Coordinate supplier use cases through a repository port."""

    def __init__(self, repository: SupplierRepository) -> None:
        self._repository = repository

    def create(self, supplier_data: SupplierCreate) -> Supplier:
        return self._repository.create(supplier_data)

    def list(
        self,
        country: SupplierCountry | None = None,
        product_category: SupplierProductCategory | None = None,
    ) -> list[Supplier]:
        suppliers = self._repository.list()
        if country is not None:
            suppliers = [supplier for supplier in suppliers if supplier.country == country]
        if product_category is not None:
            suppliers = [
                supplier
                for supplier in suppliers
                if product_category in supplier.product_categories
            ]
        return suppliers

    def get(self, supplier_id: int) -> Supplier:
        supplier = self._repository.get(supplier_id)
        if supplier is None:
            raise SupplierNotFoundError(supplier_id)
        return supplier

    def update_rate(self, supplier_id: int, rate: float) -> Supplier:
        supplier = self.get(supplier_id).model_copy(
            update={"rate": rate, "updated_at": datetime.now(timezone.utc)}
        )
        self._repository.save(supplier)
        return supplier

    def update_status(self, supplier_id: int, status: SupplierStatus) -> Supplier:
        supplier = self.get(supplier_id).model_copy(
            update={"status": status, "updated_at": datetime.now(timezone.utc)}
        )
        self._repository.save(supplier)
        return supplier

    def delete(self, supplier_id: int) -> None:
        if not self._repository.delete(supplier_id):
            raise SupplierNotFoundError(supplier_id)