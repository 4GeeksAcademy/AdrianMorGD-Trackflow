# TrackFlow backoffice

Internal operations entry point for TrackFlow teams. This is intentionally separate from `uis/website` and provides a dashboard shell plus an incident CSV analysis workflow.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Incident analysis

The `/incidents` page uploads an incidents CSV to the FastAPI endpoint and displays
aggregate quality and operational metrics. Start the API separately from the repository
root with `uv run --project . uvicorn services.api.main:app --reload --host 0.0.0.0 --port 8000`.
The Next.js server proxies `/api/incidents/*` to `http://127.0.0.1:8000`, so browser
requests use the backoffice origin and do not depend on browser access to the API port.
Set `TRACKFLOW_API_INTERNAL_URL` in the backoffice server environment if the API is at
a different address. The API's `TRACKFLOW_CORS_ORIGINS` can still be configured for
other direct browser clients.
