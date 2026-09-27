#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
MODELS_FILE="$ROOT_DIR/src/types/models.ts"

fail() {
  printf 'ERROR: %s\n' "$1" >&2
  exit 1
}

[[ -f "$MODELS_FILE" ]] || fail "No existe src/types/models.ts"

for value in 'Los Angeles' 'Zaragoza' 'United States' 'Spain'; do
  grep -Fq "\"$value\"" "$MODELS_FILE" || fail "No se encontró el valor de dominio: $value"
done

for unit in weightKg distanceKm unitCostUSD; do
  grep -Eq "\b${unit}\b" "$MODELS_FILE" || fail "No se encontró el campo con unidad explícita: $unit"
done

for entity in Product Shipment Carrier InventoryMovement; do
  grep -Eq "\b(interface|type)[[:space:]]+$entity\b" "$MODELS_FILE" || fail "No se encontró el modelo: $entity"
done

if grep -Eq '^([[:space:]]*)any([;,)[:space:]]|$)' "$MODELS_FILE"; then
  fail "Se detectó un uso directo de any en los modelos"
fi

printf 'OK: los modelos base cumplen las convenciones mínimas de TrackFlow.\n'
