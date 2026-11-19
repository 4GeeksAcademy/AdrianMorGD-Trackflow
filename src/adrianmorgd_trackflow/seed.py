"""Command entry point for seeding the local TrackFlow inventory database."""

import os
from pathlib import Path

from tinydb import TinyDB


INITIAL_SKUS: tuple[dict[str, str | int], ...] = (
    {"id": 1, "name": "Classic White Sneaker - Size 42", "sku": "CLT-SNK-W-42", "client_name": "PureStep Footwear", "category": "fashion", "warehouse": "LA"},
    {"id": 2, "name": "Classic White Sneaker - Size 42", "sku": "CLT-SNK-W-42-Z", "client_name": "PureStep Footwear", "category": "fashion", "warehouse": "ZGZ"},
    {"id": 3, "name": "Wireless Earbuds Pro", "sku": "TEC-EAR-001", "client_name": "SoundWave Electronics", "category": "electronics", "warehouse": "LA"},
    {"id": 4, "name": "Hydrating Face Serum 30ml", "sku": "CSM-SRM-030", "client_name": "GlowLab Cosmetics", "category": "cosmetics", "warehouse": "ZGZ"},
    {"id": 5, "name": "Slim Fit Chino - Navy 32/32", "sku": "CLT-CHN-N-32", "client_name": "UrbanThread", "category": "fashion", "warehouse": "LA"},
    {"id": 6, "name": "USB-C Fast Charger 65W", "sku": "TEC-CHG-065", "client_name": "SoundWave Electronics", "category": "electronics", "warehouse": "ZGZ"},
)


def seed_skus(database_path: str | Path) -> int:
    """Insert missing initial SKUs while leaving existing records untouched.

    Existing records are matched by their ``sku`` code. Returns the number of
    records inserted, so rerunning this function is safe.
    """
    database_path = Path(database_path)
    database_path.parent.mkdir(parents=True, exist_ok=True)

    with TinyDB(database_path) as database:
        sku_table = database.table("skus")
        existing_skus = {record.get("sku") for record in sku_table}
        missing_skus = [
            dict(sku) for sku in INITIAL_SKUS if sku["sku"] not in existing_skus
        ]
        if missing_skus:
            sku_table.insert_multiple(missing_skus)

    return len(missing_skus)


def main() -> None:
    """Load the six initial SKUs into the local TinyDB inventory database."""
    database_path = Path(
        os.getenv("TRACKFLOW_INVENTORY_DB_PATH", "data/inventory.json")
    )
    inserted_count = seed_skus(database_path)
    if inserted_count:
        print(f"Seeded {inserted_count} SKUs into {database_path}")
    else:
        print(f"All initial SKUs already exist; nothing inserted into {database_path}")