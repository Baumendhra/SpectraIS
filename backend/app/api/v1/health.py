from fastapi import APIRouter
from app.schemas.common import ResponseSchema

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=ResponseSchema[dict])
async def health_check():
    """System health check endpoint."""
    return ResponseSchema(
        message="System operational",
        data={"status": "healthy", "service": "spectrais-backend", "version": "1.0.0"}
    )
