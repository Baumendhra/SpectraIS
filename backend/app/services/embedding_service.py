import math
import hashlib
import logging
import asyncio
from typing import List, Dict, Any
try:
    import qdrant_client.models as qmodels  # type: ignore
except (ImportError, ModuleNotFoundError):
    qmodels = None  # type: ignore

from app.core.config import settings
from app.core.qdrant import get_qdrant_client

genai: Any = None
try:
    from google import genai  # type: ignore
except (ImportError, ModuleNotFoundError):
    try:
        import google.generativeai as genai  # type: ignore
    except (ImportError, ModuleNotFoundError):
        genai = None

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Embedding & Vector DB Ingestion Service for BIS Standards."""

    @staticmethod
    def generate_embedding(text: str) -> List[float]:
        """Generates 768-dim dense embedding for input text.
        
        Uses deterministic semantic hashing fallback if API key is in mock mode.
        """
        if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("MOCK") and genai is not None:
            try:
                if hasattr(genai, "Client"):
                    client = genai.Client(api_key=settings.GEMINI_API_KEY)
                    res = client.models.embed_content(
                        model="text-embedding-004",
                        contents=text
                    )
                    if hasattr(res, "embeddings") and res.embeddings:
                        return [float(v) for v in res.embeddings[0].values]
                elif hasattr(genai, "configure"):
                    genai.configure(api_key=settings.GEMINI_API_KEY)
                    res = genai.embed_content(
                        model="models/text-embedding-004",
                        content=text,
                        task_type="retrieval_document"
                    )
                    return res['embedding']
            except Exception as e:
                logger.warning(f"Gemini embedding API call failed ({str(e)}), using deterministic vector fallback.")

        # Deterministic fallback vector generation for local dev & testing
        vector = []
        for i in range(settings.VECTOR_SIZE):
            hash_input = f"{text}:{i}".encode('utf-8')
            val = int(hashlib.md5(hash_input).hexdigest(), 16) % 10000 / 10000.0
            vector.append((val * 2) - 1)
            
        # Normalize vector to unit length (Cosine similarity requirement)
        norm = math.sqrt(sum(x * x for x in vector))
        return [x / norm for x in vector]

    @staticmethod
    async def index_chunks(chunks: List[Dict[str, Any]]) -> int:
        """Upserts a batch of chunks with embeddings into Qdrant vector database."""
        client = get_qdrant_client()
        if client is None or qmodels is None:
            logger.warning("Qdrant client or models unavailable; skipping chunk indexing.")
            return 0

        points = []

        for chunk in chunks:
            vector = EmbeddingService.generate_embedding(chunk["content"])
            point = qmodels.PointStruct(
                id=chunk["chunk_id"],
                vector=vector,
                payload={
                    "is_number": chunk["is_number"],
                    "title": chunk["title"],
                    "domain": chunk["domain"],
                    "category": chunk["category"],
                    "section_type": chunk["section_type"],
                    "clause_ref": chunk["clause_ref"],
                    "content": chunk["content"]
                }
            )
            points.append(point)

        if points:
            try:
                client.upsert(
                    collection_name=settings.QDRANT_COLLECTION_NAME,
                    points=points
                )
                logger.info(f"Successfully upserted {len(points)} points to Qdrant.")
                return len(points)
            except Exception as e:
                logger.error(f"Failed to upsert points to Qdrant: {str(e)}")
                return 0
        return 0
