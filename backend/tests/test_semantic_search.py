import pytest
import asyncio
import os
from app.core.config import settings

# Skip if no real Gemini key
pytestmark = pytest.mark.skipif(
    settings.GEMINI_API_KEY.startswith("MOCK") and os.getenv("GEMINI_API_KEY", "MOCK").startswith("MOCK"),
    reason="Requires real GEMINI_API_KEY"
)

@pytest.mark.asyncio
async def test_embedding_is_semantic():
    """Verify that real Gemini embeddings produce semantically meaningful vectors."""
    from app.services.embedding_service import EmbeddingService
    import math

    def cosine(a, b):
        return sum(x*y for x,y in zip(a,b))

    led_1 = EmbeddingService.generate_embedding("LED street luminaire outdoor lighting IS 10322")
    led_2 = EmbeddingService.generate_embedding("LED lamp road lighting fixture outdoor")
    unrelated = EmbeddingService.generate_embedding("hospital ICU medical ventilator oxygen")

    sim_similar = cosine(led_1, led_2)
    sim_different = cosine(led_1, unrelated)

    assert sim_similar > 0.7, f"Semantically similar texts scored too low: {sim_similar}"
    assert sim_similar > sim_different + 0.3, (
        f"Similar pair ({sim_similar:.3f}) not clearly higher than unrelated pair ({sim_different:.3f})"
    )

@pytest.mark.asyncio
async def test_vector_search_returns_results():
    """Verify Qdrant returns results for a real procurement query."""
    from app.core.qdrant import get_qdrant_client
    from app.core.config import settings
    from app.services.embedding_service import EmbeddingService

    client = get_qdrant_client()
    assert client is not None, "Qdrant client not available"

    info = client.get_collection(settings.QDRANT_COLLECTION_NAME)
    assert (info.points_count or 0) > 0, (
        "Qdrant collection is empty. Run: python scripts/seed_vectors.py"
    )

    query_vec = EmbeddingService.generate_embedding("LED street lights procurement IS 10322")
    if hasattr(client, "search"):
        hits = client.search(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            query_vector=query_vec,
            limit=3
        )
    else:
        response = client.query_points(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            query=query_vec,
            limit=3
        )
        hits = response.points

    assert len(hits) > 0, "Vector search returned no results"
    assert hits[0].score > 0.5, f"Top hit score too low: {hits[0].score}"

@pytest.mark.asyncio
async def test_hallucination_guard_rejects_invented_standard():
    """Verify hallucination guard flags IS numbers not in the database."""
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.core.database import AsyncSessionLocal
    from app.services.hallucination_guard import HallucinationGuard

    async with AsyncSessionLocal() as session:
        guard = HallucinationGuard(session)
        result = await guard.validate_response(
            llm_response_text="This product must comply with IS 99999:2099 safety specification.",
            retrieved_chunks=[]
        )
        assert result["hallucination_detected"] is True
        assert "IS 99999" in result["unverified_citations"][0]
