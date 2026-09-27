# Checklist de modelos de datos

## Contexto

- [ ] Leí `AGENTS.md` y los cuatro archivos del memory bank.
- [ ] Revisé el README de la carpeta afectada.
- [ ] Identifiqué productores, consumidores y origen de los datos.
- [ ] Confirmé si el modelo contiene información sensible.

## Diseño

- [ ] La entidad tiene un identificador estable y único.
- [ ] Los campos obligatorios y opcionales están justificados.
- [ ] Los tipos representan correctamente el dominio.
- [ ] Los enums y estados tienen valores documentados.
- [ ] Las transiciones de estado válidas están definidas.
- [ ] Las relaciones y cardinalidades están claras.
- [ ] Las unidades aparecen en los nombres cuando aplica.
- [ ] Las fechas incluyen una estrategia de zona horaria.
- [ ] Los importes monetarios tienen moneda y precisión definidas.
- [ ] Se ha considerado compatibilidad hacia atrás.

## Integraciones

- [ ] El DTO externo está separado del modelo de dominio.
- [ ] Existe una estrategia de normalización.
- [ ] Los datos externos se validan en el límite de entrada.
- [ ] La operación es idempotente si puede reintentarse.
- [ ] Se conocen los campos ausentes, duplicados o desconocidos.

## Implementación

- [ ] Se reutilizan tipos existentes sin duplicarlos.
- [ ] No se usa `any` sin una justificación documentada.
- [ ] Las validaciones cubren valores vacíos, inválidos y límites.
- [ ] Los errores no exponen secretos ni datos personales.
- [ ] Se conserva trazabilidad suficiente (`createdAt`, `updatedAt` o eventos cuando corresponda).

## Verificación

- [ ] Se ejecutó type-check.
- [ ] Se ejecutó lint.
- [ ] Se ejecutaron tests o se documentó por qué no existen.
- [ ] Se ejecutó build si el cambio afecta una aplicación.
- [ ] Se ejecutó `git diff --check`.
- [ ] Se revisó el diff completo.
- [ ] Se actualizó la documentación y `progress.md` si corresponde.
