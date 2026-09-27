---
title: Domain Data Modeling
description: Diseña, modifica y valida modelos de datos del dominio logístico de TrackFlow manteniendo consistencia, validación y compatibilidad.
globs:
  - "src/types/**/*"
  - "packages/**/*"
  - "services/**/*"
  - "data/**/*"
  - "agents/**/*"
alwaysApply: false
---

# Domain Data Modeling

Usa esta skill cuando necesites crear, modificar o revisar entidades, tipos, enums, DTOs, esquemas de validación o contratos de datos de TrackFlow.

## Objetivo

Mantener un modelo de dominio común, explícito y compatible para inventario, almacenes, pedidos, envíos, transportistas, tracking, devoluciones, clientes e incidencias.

## Lectura obligatoria

Antes de diseñar o modificar un modelo, lee:

1. `AGENTS.md`.
2. `memory-bank/project-brief.md`.
3. `memory-bank/techContext.md`.
4. `memory-bank/progress.md`.
5. `src/types/models.ts`.
6. `packages/shared/` y el `README.md` de la carpeta afectada.

Si el cambio afecta una integración externa, revisa también el contrato, adaptador o documentación de esa integración.

## Flujo de trabajo

### 1. Entender el cambio

Identifica y documenta:

- entidad o entidades afectadas;
- departamento y usuarios consumidores;
- origen y destino de los datos;
- relaciones con modelos existentes;
- campos obligatorios, opcionales y derivados;
- estados y transiciones válidos;
- unidades, formatos, precisión y zona horaria;
- información sensible o regulada;
- consumidores que podrían romperse con el cambio.

### 2. Diseñar el modelo

Antes de codificar, define:

- identificador estable y único;
- propiedades y tipos;
- valores enumerados y estados válidos;
- reglas de integridad y validación;
- relaciones y cardinalidad;
- timestamps y trazabilidad;
- estrategia de compatibilidad hacia atrás;
- diferencia entre modelo interno, DTO externo y representación de persistencia.

### 3. Implementar

- Reutiliza tipos existentes y evita redefinir entidades.
- Mantén los modelos de dominio independientes de formatos concretos de WMS, ERP o transportistas.
- Crea DTOs y adaptadores para datos externos.
- Usa nombres consistentes y unidades explícitas.
- No hagas opcional un campo solo para ocultar un problema de datos.
- No elimines ni renombres propiedades públicas sin analizar consumidores y migración.
- Añade validaciones en los límites del sistema y no confíes únicamente en TypeScript.
- Mantén separadas las reglas de negocio, serialización y persistencia.

### 4. Validar

Comprueba como mínimo:

- tipos válidos e inválidos;
- valores límite y valores negativos;
- campos vacíos y duplicados;
- fechas, zonas horarias y serialización;
- unidades y precisión monetaria;
- compatibilidad con consumidores existentes;
- normalización de datos externos;
- casos de error y mensajes seguros.

Ejecuta las validaciones disponibles en el módulo afectado: tests, lint, type-check y build. Revisa también `git diff --check`.

### 5. Documentar

Actualiza según corresponda:

- `memory-bank/progress.md` cuando cambie el estado del proyecto;
- `memory-bank/techContext.md` si cambia una decisión o restricción técnica;
- README del módulo;
- un ADR para cambios de contrato, persistencia, compatibilidad o arquitectura;
- fixtures y ejemplos si el modelo se utiliza en pruebas o integraciones.

## Reglas de dominio TrackFlow

- Almacenes oficiales: `Los Angeles` y `Zaragoza`.
- Países oficiales: `United States` y `Spain`.
- Mantén unidades en los nombres: `weightKg`, `distanceKm`, `baseRateUSD`, `unitCostUSD`.
- Representa el almacén de origen en toda operación de inventario o envío que lo requiera.
- No mezcles directamente DTOs externos con modelos internos.
- Los estados deben tener transiciones explícitas y no deben inventarse sin documentación.
- Las recomendaciones de transportistas deben conservar los factores utilizados para permitir auditoría.
- Las decisiones automatizadas sobre devoluciones o atención deben permitir revisión humana y fallback manual.
- Minimiza datos personales y documenta cualquier dato sensible necesario para operar.

## Entregable esperado

Al terminar, informa:

- modelos creados o modificados;
- reglas y validaciones añadidas;
- consumidores afectados y compatibilidad considerada;
- pruebas y comandos ejecutados;
- documentación actualizada;
- decisiones pendientes o riesgos conocidos.
