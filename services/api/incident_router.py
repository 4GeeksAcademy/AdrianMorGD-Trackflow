"""HTTP routes for incident analysis and aggregate export."""

from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, Request, Response, UploadFile

from services.api.auth import CurrentUser
from services.api.incident_service import (
    IncidentAnalysisError,
    IncidentService,
    NoIncidentAnalysisError,
)

router = APIRouter()

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {
    "text/csv",
    "application/vnd.ms-excel",
    "application/octet-stream",
}


def get_incident_service(request: Request) -> IncidentService:
    """Resolve incident use cases from the composed FastAPI application."""
    return request.app.state.incident_service


IncidentServiceDependency = Annotated[
    IncidentService, Depends(get_incident_service)
]


@router.post("/incidents/analyze")
async def analyze_incidents(
    current_user: CurrentUser,
    incident_service: IncidentServiceDependency,
    file: UploadFile = File(...),
) -> dict[str, object]:
    """Analyze an uploaded CSV without returning personally identifiable data."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Upload a CSV file using multipart/form-data.",
        )

    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail="CSV exceeds the 10 mebibyte upload limit.",
        )

    try:
        return incident_service.analyze(content)
    except IncidentAnalysisError as error:
        raise HTTPException(status_code=400, detail=str(error)) from None


@router.get("/incidents/results/export")
async def export_last_analysis(
    current_user: CurrentUser,
    incident_service: IncidentServiceDependency,
) -> Response:
    """Download aggregate metrics from the latest analysis as CSV."""
    try:
        csv_content = incident_service.export_last_analysis()
    except NoIncidentAnalysisError:
        raise HTTPException(
            status_code=404,
            detail="No analysis is available. Upload a CSV to /api/incidents/analyze first.",
        ) from None

    return Response(
        content=csv_content,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="incident-analysis.csv"'},
    )