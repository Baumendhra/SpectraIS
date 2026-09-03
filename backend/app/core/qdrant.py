import os
import logging
from typing import Optional, Any

try:
    from qdrant_client import QdrantClient  # type: ignore
    import qdrant_client.models as qmodels  # type: ignore
except (ImportError, ModuleNotFoundError):
    QdrantClient = None  # type: ignore
    qmodels = None  # type: ignore

from app.core.config import settings

logger = logging.getLogger(__name__)

qdrant_client: Optional[Any] = None


def get_qdrant_client() -> Optional[Any]:
    global qdrant_client
    if QdrantClient is None:
        logger.warning("qdrant-client module is not installed or available.")
        return None

    if qdrant_client is None:
        # First attempt connecting to network Qdrant instance (e.g. Docker localhost:6333)
        try:
            client = QdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT,
                timeout=2.0
            )
            # Test connectivity
            client.get_collections()
            qdrant_client = client
            logger.info(f"Connected to remote Qdrant at {settings.QDRANT_HOST}:{settings.QDRANT_PORT}")
            return qdrant_client
        except Exception:
            logger.info("Remote Qdrant unavailable; initializing embedded local disk storage for zero-dependency RAG.")

        # Fallback: Embedded local disk vector store
        try:
            storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "data", "qdrant_storage")
            os.makedirs(storage_dir, exist_ok=True)
            qdrant_client = QdrantClient(path=storage_dir)
            logger.info(f"Initialized embedded local Qdrant vector database at: {storage_dir}")
        except Exception as e:
            logger.error(f"Failed to initialize embedded QdrantClient: {str(e)}")
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
            for field in ["is_number", "domain", "category", "section_type"]:
                try:
                    client.create_payload_index(
                        collection_name=collection_name,
                        field_name=field,
                        field_schema=qmodels.PayloadSchemaType.KEYWORD
                    )
                except Exception:
                    pass
            logger.info(f"Successfully initialized collection '{collection_name}' with payload indexes.")
    except Exception as e:
        logger.warning(f"Qdrant vector DB initialization check: {str(e)}")
