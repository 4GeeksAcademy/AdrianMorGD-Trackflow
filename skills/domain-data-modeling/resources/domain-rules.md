# Reglas del dominio TrackFlow

## Geografía y unidades

- Los almacenes oficiales son `Los Angeles` y `Zaragoza`.
- Los países oficiales son `United States` y `Spain`.
- Los pesos se expresan en kilogramos (`Kg` en los nombres TypeScript: `weightKg`).
- Las distancias se expresan en kilómetros (`distanceKm`).
- Las dimensiones se expresan en centímetros (`lengthCm`, `widthCm`, `heightCm`).
- Los costes y valores deben incluir moneda en el nombre cuando sea relevante, por ejemplo `unitCostUSD`, `baseRateUSD` y `declaredValueUSD`.
- Las fechas deben conservar una zona horaria o normalizarse a UTC en las interfaces técnicas.

## Inventario y productos

- `sku` identifica un producto y no puede estar vacío.
- El peso debe ser mayor que 0 y no superar el máximo definido por el dominio.
- Las dimensiones deben ser positivas y respetar sus límites.
- El stock no puede ser negativo.
- El umbral mínimo de stock no puede ser negativo.
- Un movimiento debe indicar SKU, almacén, tipo, cantidad, motivo y timestamp.
- Un ajuste de inventario debe poder auditarse.

## Envíos y transportistas

- Un envío debe tener origen, destino, cantidad, prioridad y estado.
- La cantidad y el valor declarado deben ser positivos.
- La distancia no puede ser negativa.
- Un transportista puede estar sin asignar mientras el envío esté pendiente.
- Un transportista debe operar en el país de destino y aceptar las restricciones aplicables.
- La recomendación debe conservar sus factores: coste, plazo, cobertura, peso, fragilidad y puntualidad.
- Los eventos de tracking pueden llegar duplicados o fuera de orden; la ingesta debe ser idempotente y soportar reconciliación.

## Devoluciones y automatización

- Las reglas de aprobación pueden variar por cliente y deben ser configurables.
- Una clasificación automática no sustituye la revisión humana cuando el caso sea ambiguo o de alto impacto.
- Las decisiones automatizadas deben registrar entrada, versión de regla/modelo, resultado, explicación y revisión posterior.
- Las imágenes de inspección deben tratarse como datos potencialmente sensibles y conservarse solo el tiempo necesario.

## Integraciones

- Los datos procedentes de WMS, ERP, CRM y transportistas deben entrar mediante DTOs y adaptadores.
- Los campos desconocidos no deben descartarse silenciosamente si afectan a reconciliación o auditoría.
- Las respuestas externas deben validarse antes de convertirse en entidades internas.
- Los reintentos no deben duplicar envíos, movimientos ni eventos.
