from fastapi import APIRouter
from app.schemas.common import ResponseSchema

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    """System health check endpoint."""
    vector_count = 0
    qdrant_status = "unavailable"
    try:
        from app.core.qdrant import get_qdrant_client
        from app.core.config import settings
        client = get_qdrant_client()
        if client:
            info = client.get_collection(settings.QDRANT_COLLECTION_NAME)
            vector_count = info.points_count or 0
            qdrant_status = "ready" if vector_count > 0 else "empty — run seed_vectors.py"
    except Exception:
        pass

    health_data = {
        "status": "ok",
        "service": "spectrais-backend",
        "version": "1.0.0",
        "vector_store": qdrant_status,
        "vector_count": vector_count,
        "semantic_search": "enabled" if vector_count > 0 else "disabled",
    }

    return {
        **health_data,
        "success": True,
        "data": health_data
    }
