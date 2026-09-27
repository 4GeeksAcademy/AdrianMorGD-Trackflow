# Technical Context — TrackFlow

## Estado de la documentación técnica

El briefing de negocio define las necesidades y restricciones de TrackFlow, pero no fija una plataforma cloud, base de datos, proveedor de IA, sistema de colas ni herramienta de observabilidad. Por tanto, este documento distingue entre tecnología comprobada en el repositorio, decisiones de arquitectura heredadas y decisiones todavía abiertas.

## Stack comprobado en el repositorio

### Aplicación de interfaz

- **Next.js 16.3.5**, con App Router por la estructura del proyecto.
- **React 19.2.8** y `react-dom` 19.2.8.
- **TypeScript 5** con modo `strict` activado.
- **Tailwind CSS 4**, integrado mediante `@tailwindcss/postcss`.
- **ESLint 9** y `eslint-config-next` para validación de código.
- Scripts disponibles en `uis/talent-pipeline-tracker/package.json`: `dev`, `build`, `start` y `lint`.
- Alias de imports TypeScript: `@/*` apunta a la raíz de la aplicación de talento.

### Tipos de dominio existentes

`src/types/models.ts` define modelos iniciales para:

- `Product`, `Dimensions`, categorías, almacenes y estados de producto.
- `Shipment`, `Destination`, prioridad y estados de envío.
- `Carrier` con países, tarifas, tiempos medios, puntualidad, peso máximo, fragilidad y prioridades aceptadas.
- `InventoryMovement` y tipos de movimiento.

Los tipos modelan Los Ángeles y Zaragoza como almacenes y Estados Unidos y España como países. Incluyen comentarios con reglas de validación, pero no constituyen todavía una API ni una validación de persistencia.

### Código compartido

Existe `packages/shared` como paquete privado `@repo/shared-types`. Actualmente contiene metadatos y tipos compartidos, pero el repositorio no tiene un workspace runner configurado en la raíz.

## Arquitectura actual y decisiones conocidas

- El repositorio sigue una organización de monorepo por responsabilidades: `uis/`, `services/`, `data/`, `agents/`, `skills/`, `mcps/`, `workflows/`, `packages/`, `infra/`, `scripts/` e `internal/`.
- La guía del repositorio recomienda una **API centralizada FastAPI** en `services/` en lugar de crear microservicios prematuramente.
- Las interfaces de usuario deben vivir en `uis/`; los agentes en `agents/`; los pipelines en `data/`; la automatización transversal en `workflows/`; y los tipos reutilizables en `packages/`.
- La UI existente es una aplicación Next.js independiente dentro de `uis/talent-pipeline-tracker`.
- La arquitectura operativa de TrackFlow que se debe integrar es heterogénea: dos WMS, un ERP legado, scripts Python punto a punto y bases de datos en dos proveedores cloud.

## Decisiones arquitectónicas previstas

Estas decisiones se derivan de las necesidades del negocio, pero aún requieren diseño y aprobación técnica:

1. **Capa de integración central** para normalizar WMS, ERP, transportistas, CRM y canales CX.
2. **Modelo de datos común** para inventario, pedidos, envíos, eventos de tracking, devoluciones, clientes e incidencias.
3. **API centralizada** como punto de entrada para UIs, agentes y consumidores internos, evitando microservicios prematuros.
4. **Procesamiento asíncrono/event-driven** para ingesta de pedidos, eventos de transportistas, alertas y tareas largas.
5. **Almacenamiento separado por necesidad**: datos transaccionales, históricos/analíticos, documentos de conocimiento y embeddings; tecnologías concretas pendientes.
6. **Observabilidad desde el inicio** con logs estructurados, métricas, trazas, health checks y alertas centralizadas para Los Ángeles y Zaragoza.
7. **Human-in-the-loop** para devoluciones, clasificación de condición, escalado de CX y decisiones de alto impacto.
8. **Recomendaciones explicables**: toda selección de transportista debe indicar factores como coste, plazo, cobertura, peso, fragilidad y puntualidad.
9. **Soporte regional y bilingüe**: considerar país, zona horaria, moneda, idioma y requisitos regulatorios en contratos y eventos.

## Restricciones técnicas

- Integrar sistemas existentes sin poder asumir que comparten esquema, formato o disponibilidad.
- Convivir con dos proveedores cloud y conectividad potencialmente desigual entre países.
- Las APIs de ocho transportistas pueden tener límites de tasa, formatos de evento y frecuencias de actualización distintos.
- Los procesos de tracking y atención deben estar disponibles 24/7 y ser tolerantes a reintentos y duplicados.
- Los datos de clientes, destinatarios, direcciones, pedidos e imágenes de devoluciones requieren control de acceso, minimización, auditoría y políticas de retención.
- Las decisiones automatizadas deben permitir revisión humana, auditoría y fallback manual.
- El sistema debe evitar depender de una sola fuente de verdad hasta completar la reconciliación entre WMS y ERP.
- La latencia objetivo, SLA, volumen de eventos, RTO/RPO y presupuesto cloud todavía no están definidos.

## Riesgos técnicos principales

- Calidad y consistencia desconocidas de los datos históricos y de inventario.
- Integraciones no documentadas y posibles cambios en sistemas legados.
- Ausencia actual de telemetría, que dificulta establecer una línea base de disponibilidad y rendimiento.
- Riesgo de respuestas incorrectas en RAG/CX y de errores de clasificación visual.
- Coste y complejidad de sincronizar eventos en tiempo casi real entre países y transportistas.
- Falta de infraestructura reproducible, CI/CD y configuración de despliegue documentada en el estado actual.

## Decisiones pendientes

- Elegir proveedor cloud, base de datos transaccional y almacén analítico.
- Definir contrato y versionado de la API central.
- Seleccionar broker/cola, scheduler y estrategia de idempotencia.
- Seleccionar plataforma de logs, métricas y trazas.
- Elegir CRM, ticketing, proveedor de mensajería y conectores de transportistas.
- Definir proveedor/modelo de IA, estrategia RAG y conjunto de evaluación.
- Establecer autenticación, RBAC, cifrado, auditoría, cumplimiento y políticas de datos.
- Definir CI/CD, entornos, backups, despliegue y objetivos SLO/RTO/RPO.
