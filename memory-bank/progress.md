# Progress — TrackFlow

**Última actualización:** 2026-09-27

## Estado general

El proyecto está en una fase inicial de definición y prototipado. El repositorio conserva la estructura base del proyecto transversal de AI Engineering y ya incluye una primera UI de seguimiento de talento junto con modelos TypeScript de dominio logístico. La plataforma completa de TrackFlow todavía no está implementada.

## Completado

### Base del repositorio

- Contexto de TrackFlow incorporado en `CONTEXT.md` y `CONTEXT.es.md`.
- Estructura de monorepo preparada para UIs, servicios, datos, agentes, workflows, paquetes compartidos, infraestructura y documentación.
- Memory bank creado y actualizado con brief de negocio, contexto técnico y progreso.
- Rama actual: `main`.

### Dominio logístico inicial

- Modelos TypeScript en `src/types/models.ts` para:
  - productos y dimensiones;
  - inventario por Los Ángeles y Zaragoza;
  - envíos y destinos;
  - transportistas y sus capacidades/tarifas;
  - movimientos de inventario.
- Utilidades iniciales en `src/utils/` para colecciones, búsqueda, transformaciones y validaciones.
- Paquete `packages/shared` creado como `@repo/shared-types` para tipos reutilizables.
- Skill `skills/domain-data-modeling/` creada para diseñar, validar y documentar modelos de datos del dominio TrackFlow.

### Interfaz existente

- Aplicación `uis/talent-pipeline-tracker` creada con Next.js.
- Stack comprobado: Next.js 16.3.5, React 19.2.8, TypeScript, Tailwind CSS 4 y ESLint 9.
- La aplicación dispone de scripts para desarrollo, build, ejecución de producción y lint.

### Sitio web público

- Añadida la aplicación independiente `uis/website` con Next.js App Router, TypeScript estricto y Tailwind CSS v4.
- Implementada la página corporativa `/` con identidad visual neo-minimalista, navegación responsive, métricas, servicios, cobertura binacional y datos estructurados de organización.
- Implementada `/get-a-quote` con formulario responsive y validación de teléfono en cliente.
- Añadido README local con instrucciones de instalación y ejecución.
- Verificados `npm run lint`, `npm run build` y `git diff --check` desde `uis/website`.

### Backoffice interno

- Añadida la aplicación independiente `uis/backoffice`, separada del layout y configuración de `uis/website`.
- Implementada la ruta `/` como punto de entrada para operaciones internas, con navegación de Overview, Inventory, Shipments y Returns.
- Visible una vista inicial de inventario por almacén para Los Ángeles y Zaragoza, además de métricas de pedidos, envíos y devoluciones basadas en el contexto de TrackFlow.
- Añadido README local y verificados `npm run lint` y `npm run build` desde `uis/backoffice`.

## No implementado todavía

- API centralizada para inventario, envíos, tracking, devoluciones, CX o reporting.
- Conexiones reales con WMS, ERP, CRM o las APIs de los ocho transportistas.
- Base de datos, migraciones, persistencia y sincronización entre Los Ángeles y Zaragoza.
- Ingesta automática de pedidos desde email.
- Motor de selección de transportistas y agregador de tracking.
- Motor de aprobación de devoluciones y clasificación de condición mediante imágenes.
- Base de conocimiento semántica, RAG y agente de Customer Experience.
- Ticketing omnicanal, CRM, scoring de salud de clientes y alertas de renovación.
- Pipelines analíticos, dashboards operativos/ejecutivos e informes automáticos.
- Logs, métricas, trazas, monitorización, alertas, backups y health checks centralizados.
- CI/CD, despliegues, autenticación, autorización y políticas de seguridad productivas.

## Próximos pasos recomendados

1. Definir el MVP y sus usuarios prioritarios; recomendación inicial: inventario unificado y tracking.
2. Diseñar el modelo de datos común y los contratos de la API central.
3. Crear el servicio FastAPI central siguiendo la guía del repositorio.
4. Implementar persistencia, validaciones, autenticación y pruebas de los recursos de inventario y envíos.
5. Preparar adaptadores simulados para ambos WMS y al menos un transportista antes de conectar sistemas reales.
6. Añadir ingesta idempotente de eventos y un primer endpoint de tracking unificado.
7. Incorporar datos de prueba, evaluación y métricas antes de automatizar decisiones con IA.
8. Establecer observabilidad mínima: logs estructurados, health check, errores y alertas.
9. Documentar ADRs, contratos, variables de entorno, despliegue y procedimiento de rollback.

## Riesgos y bloqueos actuales

- No se han definido todavía proveedor cloud, base de datos, broker, plataforma de observabilidad ni proveedor de modelos de IA.
- No hay especificaciones de contratos de los WMS, ERP, CRM o transportistas.
- No están definidos SLA/SLO, volúmenes, latencias objetivo, RTO/RPO ni presupuesto.
- La disponibilidad y calidad de datos reales no están verificadas.
- La interfaz de Talent Pipeline Tracker es un prototipo/app separada y no debe considerarse todavía el dashboard operativo de TrackFlow.

## Criterio para declarar el siguiente hito

El primer hito funcional debería permitir consultar inventario normalizado por SKU y almacén, con datos de prueba reproducibles, API documentada, validaciones, pruebas automatizadas, logs básicos y una UI o cliente que consuma la API sin depender de hojas de cálculo.
