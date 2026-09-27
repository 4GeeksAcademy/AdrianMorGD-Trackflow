# Domain Data Modeling

Skill para diseñar, modificar y revisar modelos de datos del dominio logístico de TrackFlow.

## Cuándo usarla

Úsala para:

- crear entidades como devoluciones, clientes o eventos de tracking;
- modificar `Product`, `Shipment`, `Carrier` o `InventoryMovement`;
- crear enums, estados y transiciones;
- definir DTOs para WMS, ERP, CRM o transportistas;
- añadir reglas de validación;
- revisar compatibilidad entre frontend, backend, agentes y pipelines;
- normalizar datos externos antes de incorporarlos al dominio interno.

## Qué produce

La skill guía al agente para producir:

- modelos tipados y consistentes;
- validaciones de datos y casos límite;
- separación entre dominio, DTO externo y persistencia;
- fixtures o ejemplos de prueba;
- documentación de cambios y decisiones.

## Archivos incluidos

- `SKILL.md`: instrucciones principales para el agente.
- `resources/data-model-checklist.md`: checklist de diseño y revisión.
- `resources/entity-template.md`: plantilla para documentar una entidad.
- `resources/domain-rules.md`: convenciones del dominio TrackFlow.
- `scripts/validate-models.sh`: comprobaciones básicas de estructura y convenciones.

## Uso del validador

Desde la raíz del repositorio:

```bash
bash skills/domain-data-modeling/scripts/validate-models.sh
```

El script no reemplaza el type-check, los tests ni el lint del proyecto. Solo detecta problemas básicos en los modelos TypeScript existentes y confirma que se mantienen las convenciones principales.
