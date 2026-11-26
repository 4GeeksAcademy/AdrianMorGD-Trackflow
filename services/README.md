# TrackFlow backend

A **prototype FastAPI API** currently lives in `services/api/main.py`. It includes user authentication, profiles, suppliers, and CSV incident analysis/export. It is not yet the operational central API described by the architecture proposal.

## Requirements

- Python **3.14**, specified by `.python-version` and required by `pyproject.toml`.
- [uv](https://docs.astral.sh/uv/) to create/manage the environment and install dependencies.

You do not need to create or activate a `venv` manually: `uv sync` creates the project environment in `.venv`, and `uv run` executes commands inside it.

## Local setup

From the repository root:

```bash
uv sync
cp .env.example .env
```

Edit `.env` and replace `TRACKFLOW_JWT_SECRET` with a private random secret. Generate one with:

```bash
uv run python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Paste the output directly into your local `.env`; do not share it or commit it. `.env.example` is a template containing example values only.

## Environment variables

For local development the API loads the root `.env` file. You may also define these variables in the process environment:

| Variable | Purpose | Default |
| --- | --- | --- |
| `TRACKFLOW_JWT_SECRET` | Sign/verify JWTs. Must be private; there is no fallback key. Needed to log in and access protected routes. | Required for authentication |
| `ACCESS_TOKEN_EXPIRES_MINUTES` | JWT lifetime in minutes; must be a positive integer. | `30` |
| `TRACKFLOW_USERS_DB_PATH` | TinyDB file for users and profiles. | `data/users.json` |
| `TRACKFLOW_SUPPLIERS_DB_PATH` | TinyDB file for suppliers. | `data/suppliers.json` |
| `TRACKFLOW_CORS_ORIGINS` | Comma-separated list of allowed browser origins. | `http://localhost:3000,http://127.0.0.1:3000` |

All backend processes that issue or validate tokens must use the same `TRACKFLOW_JWT_SECRET`. Never put a real secret in frontend code or a `NEXT_PUBLIC_*` variable.

## Run the backend

From the repository root, after configuring `.env`:

```bash
uv run uvicorn services.api.main:app --env-file .env --reload --host 0.0.0.0 --port 8000
```

- API: <http://localhost:8000>
- Interactive OpenAPI docs: <http://localhost:8000/docs>
- Health check: <http://localhost:8000/>

`--reload` is for development only and should not be used in production.

Run backend tests with:

```bash
uv run python -m unittest services.api.test_main services.api.test_suppliers services.api.test_users
```

## API routes and compatibility

New routes should be published under `/api/v1`. Historical paths remain mounted so existing clients are not broken:

| Resource | Preferred versioned path | Compatible legacy path |
| --- | --- | --- |
| Suppliers | `/api/v1/suppliers` | `/suppliers` |
| Users and profiles | `/api/v1/users`, `/api/v1/profiles/me`, `/api/v1/auth/*` | `/users`, `/profiles/me`, `/auth/*` |
| Incident analysis and export | `/api/v1/incidents/analyze`, `/api/v1/incidents/results/export` | `/api/incidents/analyze`, `/api/incidents/results/export` |

Both paths for each resource use the same services, authorization, and response formats. Legacy paths have no removal date; do not remove them without an agreed migration and consumer-notification policy. The current backoffice still uses the legacy paths through its rewrites.

## Connect the backoffice

The backoffice is a separate app and must be run separately. Keep the API running in one terminal, then in another terminal run from `uis/backoffice`:

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The Next.js server rewrites `/api/incidents/*` and `/api/suppliers/*` to `http://127.0.0.1:8000`. If the API runs elsewhere, set `TRACKFLOW_API_INTERNAL_URL` in the Next.js process environment. Protected API routes require authentication; wiring the backoffice user/session flow to that token is still pending.

## Gap from `docs/ARCHITECTURE_PROPOSAL.md`

The proposal describes a centralized but **modular, hexagonal application**, with versioned routers (`/api/v1`), inventory/shipments/returns domains, and separate domain, application, port, and adapter layers. The API now uses a `create_app` factory to compose services and dependencies, module-level routers, and a versioned router under `/api/v1`; legacy paths remain mounted as compatibility aliases. Suppliers, users, and incident analysis separate routes from services and adapters where applicable. Inventory, shipments, returns, and real integrations are not implemented. TinyDB is local prototype persistence, not a production database decision.

The proposal is an architectural direction, not a claim about the current implementation or a prerequisite to run this prototype. A gradual alignment plan before expanding the domains is:

1. Continue modularizing domains as they are implemented; keep composition in `create_app()` and one deployable application while that remains sufficient.
2. Use `/api/v1` for new contracts and remove legacy routes only with an explicit migration and deprecation policy.
3. Extend ports and adapters to future modules that need persistence or integrations; users and suppliers already have repository contracts and TinyDB adapters.
4. Implement the agreed priority domains (inventory, shipments, returns) with HTTP contracts and layer-specific tests.
5. Select production persistence and design migration, configuration, and operational/security controls before using real data.

Do not describe versioned routers, ports/adapters, workers, WMS/ERP/carrier integrations, or logistics domains as completed: they are not present in the current backend.
