from typing import Optional, List, Dict, Any
import logging

try:
    from qdrant_client import QdrantClient  # type: ignore
    import qdrant_client.models as qmodels  # type: ignore
except (ImportError, ModuleNotFoundError):
    QdrantClient = None  # type: ignore
    qmodels = None  # type: ignore

try:
    from qdrant_client.http.exceptions import UnexpectedResponse  # type: ignore
except (ImportError, ModuleNotFoundError):
    try:
        from qdrant_client.exceptions import UnexpectedResponse  # type: ignore
    except (ImportError, ModuleNotFoundError):
        UnexpectedResponse = Exception  # type: ignore

from app.core.config import settings

logger = logging.getLogger(__name__)

qdrant_client: Optional[Any] = None


def get_qdrant_client() -> Optional[Any]:
    global qdrant_client
    if QdrantClient is None:
        logger.warning("qdrant-client module is not installed or available.")
        return None

    if qdrant_client is None:
        try:
            qdrant_client = QdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT,
                timeout=10.0
            )
        except Exception as e:
            logger.error(f"Failed to initialize QdrantClient: {str(e)}")
            return None
    return qdrant_client


def init_qdrant_collections():
    """Ensures Qdrant collection for BIS Standards exists with optimal payload indexes."""
    if QdrantClient is None or qmodels is None:
        logger.warning("Qdrant client library not available; skipping collection initialization.")
        return

    client = get_qdrant_client()
    if client is None:
        logger.warning("Qdrant client connection unavailable; skipping collection initialization.")
        return

    collection_name = settings.QDRANT_COLLECTION_NAME

    try:
        collections = client.get_collections().collections
        exists = any(c.name == collection_name for c in collections)

        if not exists:
            logger.info(f"Creating Qdrant collection '{collection_name}'...")
            client.create_collection(
                collection_name=collection_name,
                vectors_config=qmodels.VectorParams(
                    size=settings.VECTOR_SIZE,
                    distance=qmodels.Distance.COSINE
                ),
                hnsw_config=qmodels.HnswConfigDiff(
                    m=16,
                    ef_construct=100
                )
            )

            # Create payload indexes for fast filtered vector searches
            client.create_payload_index(
                collection_name=collection_name,
                field_name="is_number",
                field_schema=qmodels.PayloadSchemaType.KEYWORD
            )
            client.create_payload_index(
                collection_name=collection_name,
                field_name="domain",
                field_schema=qmodels.PayloadSchemaType.KEYWORD
            )
            client.create_payload_index(
                collection_name=collection_name,
                field_name="category",
                field_schema=qmodels.PayloadSchemaType.KEYWORD
            )
            client.create_payload_index(
                collection_name=collection_name,
                field_name="section_type",
                field_schema=qmodels.PayloadSchemaType.KEYWORD
            )
            logger.info(f"Successfully initialized collection '{collection_name}' with payload indexes.")
    except Exception as e:
        logger.warning(f"Qdrant vector DB initialization check skipped or failed: {str(e)}")
