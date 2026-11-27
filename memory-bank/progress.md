# Progress — TrackFlow

**Última actualización:** 2026-11-19

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
- Añadida la página `/incidents` con carga por selector/arrastrar y soltar, resumen de análisis, desglose de incidencias inválidas y descarga CSV.
- La API FastAPI ahora habilita CORS para `http://localhost:3000` y `http://127.0.0.1:3000`; los orígenes se pueden reemplazar mediante `TRACKFLOW_CORS_ORIGINS`.
- Verificados `npm run build` y `npm run lint` en `uis/backoffice`; la compilación incluye `/incidents`.

### Modelo de autenticación

- Añadido el modelo `User` del API con `id`, `email`, `hashed_password`, `is_active`, `role` y `created_at`, más un repositorio TinyDB para guardarlo y buscarlo.
- Los roles de usuario están limitados al enum `admin`, `manager` y `user`; `POST /users` asigna `user` por defecto y evita devolver el hash de contraseña.
- Añadida la capa `UserService` con operaciones de creación, consulta por ID/email, actualización y eliminación; expuesta mediante `POST /users`, `GET /users`, `GET /users/{id}`, `PUT /users/{id}` y `DELETE /users/{id}`.
- El registro recibe una contraseña en texto solo durante el transporte y la guarda con hash bcrypt mediante libpass; puede crear un `Profile` opcional con nombre, teléfono y dirección, separado de `User`.
- Añadidos `POST /auth/login` (email y contraseña, validación de credenciales y emisión de JWT Bearer con duración configurable) y `GET /auth/me` (protegido; devuelve email, rol y perfil vinculado). Se conserva `/auth/token` como alias compatible. El secreto JWT se configura mediante `TRACKFLOW_JWT_SECRET` en el entorno o `.env` local; `ACCESS_TOKEN_EXPIRES_MINUTES` configura su duración (30 minutos por defecto). El listado es solo para administradores; lectura, actualización y eliminación requieren ser propietario o admin, y cambiar `role` requiere admin.
- Añadidos los endpoints protegidos `GET /profiles/me` y `PUT /profiles/me`; ambos usan el usuario autenticado como vínculo propietario y permiten leer o modificar nombre, teléfono y dirección.
- Aplicada autenticación JWT también a las seis rutas de proveedores y a las rutas de análisis/exportación de incidencias; health check, registro y login permanecen públicos deliberadamente. Añadidas pruebas de rechazo anónimo para las rutas sensibles y pruebas existentes actualizadas para autenticarse.
- Iniciado el alineamiento gradual con la arquitectura hexagonal en proveedores: rutas FastAPI movidas a `supplier_router.py`, casos de uso y filtros a `SupplierService`, contrato de persistencia a `SupplierRepository` y acceso TinyDB a `TinyDBSupplierRepository`. Las seis URLs, respuestas, filtros, errores 404 y autenticación existentes se conservan.
- Separadas las rutas de autenticación, usuarios y perfiles en `user_router.py`; `UserService` depende ahora de contratos en `user_port.py` y los adaptadores TinyDB están en `user_tinydb.py`. La autenticación resuelve el servicio desde `app.state`, evitando la importación inversa de `main.py`. Se mantienen URLs, reglas de acceso y datos existentes. Las 40 pruebas del API pasan; Pylance y `git diff --check` no reportaron errores.
- Separado el módulo de incidencias en `incident_router.py` y `IncidentService` (`incident_service.py`); se mantienen rutas, autenticación, límites de carga, respuestas de error, métricas agregadas y descarga CSV, sin exponer datos personales.
- Centralizada la composición en `create_app()` dentro de `services/api/main.py`, con rutas y servicios inyectables para facilitar pruebas aisladas. Añadido `v1_router.py` bajo `/api/v1` y montados los paths históricos como alias compatibles; se verifica interoperabilidad de análisis y exportación entre ambas rutas.
- Documentación inglesa y española actualizada con setup, variables de entorno, rutas versionadas y aliases compatibles. Validación final: 41 pruebas del API pasan con TinyDB temporales, Pylance sin errores y `git diff --check` limpio. No se retiraron rutas antiguas ni se alteraron datos locales intencionadamente.
- Documentación del backend completada en `services/README.md` y `services/README.es.md`: requisitos Python 3.14/uv, setup con `uv sync`, copia/configuración de `.env`, variables usadas, ejecución, pruebas, conexión al backoffice y brecha/roadmap respecto a `docs/ARCHITECTURE_PROPOSAL.md`. `.env.example` incluye placeholders para variables del backend sin contener secretos reales.
- Las pruebas específicas de API, proveedores y usuarios pasan (40 pruebas); revisiones de Pylance y `git diff --check` no reportaron errores.
- El modelo rechaza campos adicionales para evitar incorporar nombre visible o datos de contacto no solicitados.
- Declarada la dependencia TinyDB; persiste como almacenamiento local de prototipo, no como base productiva.
- Añadidas pruebas del esquema, exclusión de atributos extra y persistencia/consulta.

## No implementado todavía

- API productiva centralizada para inventario, envíos, tracking, devoluciones, CX o reporting. Existe un prototipo FastAPI para analizar CSV de incidencias, pendiente de despliegue y persistencia productiva.
- Conexiones reales con WMS, ERP, CRM o las APIs de los ocho transportistas.
- Base de datos, migraciones, persistencia y sincronización entre Los Ángeles y Zaragoza.
- Ingesta automática de pedidos desde email.
- Motor de selección de transportistas y agregador de tracking.
- Motor de aprobación de devoluciones y clasificación de condición mediante imágenes.
- Base de conocimiento semántica, RAG y agente de Customer Experience.
- Ticketing omnicanal, CRM, scoring de salud de clientes y alertas de renovación.
- Pipelines analíticos, dashboards operativos/ejecutivos e informes automáticos.
- Logs, métricas, trazas, monitorización, alertas, backups y health checks centralizados.
- CI/CD, despliegues y políticas de seguridad productivas. La autenticación JWT implementada es un prototipo y requiere configurar `TRACKFLOW_JWT_SECRET`.

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
