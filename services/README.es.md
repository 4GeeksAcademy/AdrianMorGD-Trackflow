# Backend de TrackFlow

Actualmente existe una **API FastAPI de prototipo** en `services/api/main.py`. Incluye autenticación de usuarios, gestión de perfiles y proveedores, y análisis/exportación de CSV de incidencias. No es todavía la API central de operaciones descrita en la propuesta de arquitectura.

## Requisitos

- Python **3.14**, indicado en `.python-version` y requerido por `pyproject.toml`.
- [uv](https://docs.astral.sh/uv/) para crear/gestionar el entorno e instalar dependencias.

No necesitas crear ni activar manualmente un `venv`: `uv sync` crea el entorno del proyecto en `.venv` y `uv run` ejecuta comandos dentro de ese entorno.

## Preparación local

Desde la raíz del repositorio:

```bash
uv sync
cp .env.example .env
```

Abre `.env` y reemplaza `TRACKFLOW_JWT_SECRET` por un secreto aleatorio privado. Puedes generar uno con:

```bash
uv run python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Pega el resultado directamente en tu `.env`; no lo compartas ni lo incluyas en Git. `.env.example` solo es una plantilla con valores de ejemplo.

## Variables de entorno

La API carga el `.env` de la raíz durante el desarrollo local. También puedes definir estas variables en el entorno del proceso:

| Variable | Uso | Valor predeterminado |
| --- | --- | --- |
| `TRACKFLOW_JWT_SECRET` | Firma/verificación de tokens JWT. Debe ser un secreto privado; no hay clave predeterminada. Necesario para iniciar sesión y usar rutas protegidas. | Obligatorio para autenticación |
| `ACCESS_TOKEN_EXPIRES_MINUTES` | Duración de los JWT, en minutos; debe ser un entero positivo. | `30` |
| `TRACKFLOW_USERS_DB_PATH` | Archivo TinyDB de usuarios y perfiles. | `data/users.json` |
| `TRACKFLOW_SUPPLIERS_DB_PATH` | Archivo TinyDB de proveedores. | `data/suppliers.json` |
| `TRACKFLOW_CORS_ORIGINS` | Lista de orígenes de navegador separados por comas. | `http://localhost:3000,http://127.0.0.1:3000` |

Configura el mismo `TRACKFLOW_JWT_SECRET` en todos los procesos backend que emitan o validen tokens. No uses un secreto real en el frontend ni en una variable `NEXT_PUBLIC_*`.

## Ejecutar el backend

Desde la raíz del repositorio, después de configurar `.env`:

```bash
uv run uvicorn services.api.main:app --env-file .env --reload --host 0.0.0.0 --port 8000
```

- API: <http://localhost:8000>
- Documentación interactiva OpenAPI: <http://localhost:8000/docs>
- Health check: <http://localhost:8000/>

En desarrollo, `--reload` reinicia el servidor al detectar cambios. No uses esa opción en producción.

Para ejecutar las pruebas del backend:

```bash
uv run python -m unittest services.api.test_main services.api.test_suppliers services.api.test_users
```

## Rutas de la API y compatibilidad

Las rutas nuevas deben publicarse bajo `/api/v1`. La aplicación mantiene montadas las rutas históricas para no romper clientes existentes:

| Recurso | Ruta versionada preferida | Ruta anterior compatible |
| --- | --- | --- |
| Proveedores | `/api/v1/suppliers` | `/suppliers` |
| Usuarios y perfiles | `/api/v1/users`, `/api/v1/profiles/me`, `/api/v1/auth/*` | `/users`, `/profiles/me`, `/auth/*` |
| Análisis y exportación de incidencias | `/api/v1/incidents/analyze`, `/api/v1/incidents/results/export` | `/api/incidents/analyze`, `/api/incidents/results/export` |

Ambas rutas de cada recurso usan los mismos servicios, autorización y formato de respuesta. Las rutas antiguas se conservan sin fecha de retirada; no se deben eliminar sin acordar una política de migración y aviso a consumidores. El backoffice actual continúa usando las rutas anteriores mediante sus rewrites.

## Conectar el backoffice

El backoffice es otra aplicación y se ejecuta por separado. En una terminal deja la API activa; en otra, desde `uis/backoffice`:

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>. El servidor Next.js reenvía las solicitudes `/api/incidents/*` y `/api/suppliers/*` a `http://127.0.0.1:8000`. Si la API está en otra dirección, define `TRACKFLOW_API_INTERNAL_URL` en el entorno del proceso Next.js. El endpoint protegido requiere sesión/token; este flujo de autenticación del backoffice sigue pendiente de integración.

## Diferencia con `docs/ARCHITECTURE_PROPOSAL.md`

La propuesta plantea una aplicación centralizada pero **modular y hexagonal**, con routers versionados (`/api/v1`), dominios de inventario/envíos/devoluciones y capas separadas de dominio, aplicación, puertos y adaptadores. La API ahora usa una fábrica `create_app` para componer servicios y dependencias, routers por módulo y un router versionado bajo `/api/v1`; las rutas antiguas se mantienen como alias compatibles. Proveedores, usuarios y análisis de incidencias ya separan rutas de servicios y adaptadores donde aplica. Los recursos de inventario, envíos y devoluciones e integraciones reales todavía no están implementados. TinyDB es persistencia local de prototipo, no la base de datos propuesta para producción.

La propuesta es una dirección arquitectónica, no una especificación ya satisfecha ni un bloqueo para ejecutar el prototipo actual. Para alinearlo gradualmente, antes de expandir los dominios conviene:

1. Seguir modularizando los dominios conforme se implementen; mantener la composición en `create_app()` y un solo despliegue mientras sea suficiente.
2. Usar `/api/v1` para los nuevos contratos y retirar rutas antiguas solo con una política de migración y aviso explícitos.
3. Extender puertos y adaptadores a los módulos futuros que necesiten persistencia o integraciones; usuarios y proveedores ya tienen contratos de repositorio y adaptadores TinyDB.
4. Implementar los dominios prioritarios de inventario, envíos y devoluciones según el alcance acordado, con contratos HTTP y pruebas por capa.
5. Elegir una persistencia productiva y diseñar migración, configuración, seguridad y operación antes de desplegar con datos reales.

No se deben afirmar como completados los routers versionados, los puertos/adaptadores, los workers, las integraciones WMS/ERP/transportistas ni los dominios de logística: aún no existen en el backend actual.
