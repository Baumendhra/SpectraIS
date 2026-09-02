from typing import List, Dict, Any, Optional
import logging
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
try:
    import qdrant_client.models as qmodels  # type: ignore
except (ImportError, ModuleNotFoundError):
    qmodels = None  # type: ignore

from app.core.config import settings
from app.core.qdrant import get_qdrant_client
from app.services.embedding_service import EmbeddingService
from app.models.standards import Standard

logger = logging.getLogger(__name__)


class RetrievalService:
    """Hybrid Retrieval Service (Dense Vector + Keyword BM25 + Reciprocal Rank Fusion)."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def hybrid_retrieve(
        self,
        query: str,
        domain: Optional[str] = None,
        category: Optional[str] = None,
        is_number: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        # Stage 1 & 2: Qdrant Dense Vector Search (Filtered)
        vector_results = await self._vector_search(query, domain, category, is_number, top_k=top_k * 2)

        # Stage 2: PostgreSQL Keyword Search
        keyword_results = await self._keyword_search(query, domain, category, is_number, top_k=top_k * 2)

        # Stage 3: Knowledge Graph Expansion for Related Standards
        is_numbers = list(set([r["is_number"] for r in vector_results + keyword_results if r.get("is_number")]))
        graph_results = await self._graph_expand_search(is_numbers, top_k=top_k)

        # Stage 4: Reciprocal Rank Fusion (RRF) Reranking across all streams
        fused_results = self._reciprocal_rank_fusion(vector_results, keyword_results + graph_results, top_k=top_k)

        return fused_results

    async def _graph_expand_search(self, is_numbers: List[str], top_k: int) -> List[Dict[str, Any]]:
        """Queries StandardRelation edges to discover complementary, amending, or referenced standards."""
        if not is_numbers:
            return []
        try:
            from app.models.standards import Standard
            from app.models.rag import StandardRelation

            stmt = (
                select(Standard)
                .join(StandardRelation, StandardRelation.target_standard_id == Standard.id)
                .where(Standard.is_number.in_(is_numbers))
                .limit(top_k)
            )
            res = await self.session.execute(stmt)
            related = res.scalars().all()
            return [
                {
                    "id": str(std.id),
                    "is_number": std.is_number,
                    "title": std.title,
                    "domain": std.domain,
                    "category": std.category,
                    "clause_ref": "Graph Connected Standard",
                    "section_type": "COMPLIANCE",
                    "content": f"Graph Connected Standard: {std.title} - Scope: {std.scope}",
                    "score": 0.75,
                    "source": "knowledge_graph"
                }
                for std in related
            ]
        except Exception as e:
            logger.warning(f"Knowledge graph expansion failed ({str(e)}), skipping stage 3.")
            return []

    async def _vector_search(
        self,
        query: str,
        domain: Optional[str],
        category: Optional[str],
        is_number: Optional[str],
        top_k: int
    ) -> List[Dict[str, Any]]:
        client = get_qdrant_client()
        if client is None or qmodels is None:
            logger.warning("Qdrant client or models unavailable; returning empty vector search results.")
            return []
        query_vector = EmbeddingService.generate_embedding(query)

        filter_conditions = []
        if domain:
            filter_conditions.append(qmodels.FieldCondition(key="domain", match=qmodels.MatchValue(value=domain)))
        if category:
            filter_conditions.append(qmodels.FieldCondition(key="category", match=qmodels.MatchValue(value=category)))
        if is_number:
            filter_conditions.append(qmodels.FieldCondition(key="is_number", match=qmodels.MatchValue(value=is_number)))

        qdrant_filter = qmodels.Filter(must=filter_conditions) if filter_conditions else None

        try:
            hits = client.search(
                collection_name=settings.QDRANT_COLLECTION_NAME,
                query_vector=query_vector,
                query_filter=qdrant_filter,
                limit=top_k
            )

            results = []
            for hit in hits:
                payload = hit.payload or {}
                results.append({
                    "id": str(hit.id),
                    "is_number": payload.get("is_number"),
                    "title": payload.get("title"),
                    "domain": payload.get("domain"),
                    "category": payload.get("category"),
                    "clause_ref": payload.get("clause_ref"),
                    "section_type": payload.get("section_type"),
                    "content": payload.get("content"),
                    "score": hit.score,
                    "source": "vector"
                })
            return results
        except Exception as e:
            logger.warning(f"Qdrant vector search failed ({str(e)}), falling back to keyword search.")
            return []

    async def _keyword_search(
        self,
        query: str,
        domain: Optional[str],
        category: Optional[str],
        is_number: Optional[str],
        top_k: int
    ) -> List[Dict[str, Any]]:
        pattern = f"%{query}%"
        stmt = select(Standard).where(
            or_(
                Standard.is_number.ilike(pattern),
                Standard.title.ilike(pattern),
                Standard.scope.ilike(pattern)
            )
        )
        if domain:
            stmt = stmt.where(Standard.domain == domain)
        if category:
            stmt = stmt.where(Standard.category == category)
        if is_number:
            stmt = stmt.where(Standard.is_number == is_number)

        stmt = stmt.limit(top_k)
        result = await self.session.execute(stmt)
        standards = result.scalars().all()

        results = []
        for std in standards:
            results.append({
                "id": str(std.id),
                "is_number": std.is_number,
                "title": std.title,
                "domain": std.domain,
                "category": std.category,
                "clause_ref": "Scope / General",
                "section_type": "SCOPE",
                "content": f"{std.title} - {std.scope}",
                "score": 0.8,
                "source": "keyword"
            })
        return results

    def _reciprocal_rank_fusion(
        self,
        vector_results: List[Dict[str, Any]],
        keyword_results: List[Dict[str, Any]],
        k: int = 60,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        scores: Dict[str, float] = {}
        doc_map: Dict[str, Dict[str, Any]] = {}

        for rank, doc in enumerate(vector_results):
            doc_id = doc["id"]
            scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank + 1))
            doc_map[doc_id] = doc

        for rank, doc in enumerate(keyword_results):
            doc_id = doc["id"]
            scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank + 1))
            if doc_id not in doc_map:
                doc_map[doc_id] = doc

        sorted_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
        
        final_results = []
        for doc_id in sorted_ids[:top_k]:
            item = doc_map[doc_id]
            item["rrf_score"] = scores[doc_id]
            final_results.append(item)

        return final_results

    @staticmethod
    def build_context_snippet(retrieved_chunks: List[Dict[str, Any]]) -> str:
        """Formats retrieved chunks into a clean, cited context string for LLM prompting."""
        if not retrieved_chunks:
            return "No relevant Bureau of Indian Standards (BIS) clauses were found in the knowledge repository."

        context_str = "RETRIEVED BIS STANDARDS CONTEXT:\n\n"
        for idx, chunk in enumerate(retrieved_chunks, 1):
            context_str += (
                f"--- [CITATION {idx}]: {chunk['is_number']} | {chunk['clause_ref']} ---\n"
                f"Standard: {chunk['title']}\n"
                f"Section: {chunk['section_type']} | Domain: {chunk['domain']}\n"
                f"Content: {chunk['content']}\n\n"
            )
        return context_str
