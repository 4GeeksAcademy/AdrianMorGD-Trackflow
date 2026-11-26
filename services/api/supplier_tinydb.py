"""TinyDB adapter for the supplier repository contract."""

from tinydb.table import Table

from services.api.suppliers import Supplier, SupplierCreate


class TinyDBSupplierRepository:
    """Store suppliers in a TinyDB table."""

    def __init__(self, table: Table) -> None:
        self._table = table

    def create(self, supplier_data: SupplierCreate) -> Supplier:
        document = supplier_data.model_dump(mode="json")
        document_id = self._table.insert(document)
        return Supplier.model_validate({**document, "id": document_id})

    def list(self) -> list[Supplier]:
        return [
            Supplier.model_validate({**document, "id": document.doc_id})
            for document in self._table.all()
        ]

    def get(self, supplier_id: int) -> Supplier | None:
        document = self._table.get(doc_id=supplier_id)
        if document is None:
            return None
        return Supplier.model_validate({**document, "id": document.doc_id})

    def save(self, supplier: Supplier) -> None:
        self._table.update(
            supplier.model_dump(mode="json", exclude={"id"}),
            doc_ids=[supplier.id],
        )

    def delete(self, supplier_id: int) -> bool:
        if self._table.get(doc_id=supplier_id) is None:
            return False
        self._table.remove(doc_ids=[supplier_id])
        return True