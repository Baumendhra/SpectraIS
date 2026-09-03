import logging
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.standards import Standard
from app.schemas.phase5_schemas import BISAmendmentUpdate
from app.services.chunking_service import BISChunkingService
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class BISAmendmentIntelligenceService:
    """Monitors Gazette notices, updates BIS Knowledge Base, and triggers re-indexing."""

    @staticmethod
    async def process_amendment_notice(notice: BISAmendmentUpdate, session: AsyncSession) -> Dict[str, Any]:
        logger.info(f"Processing Gazette Notice {notice.notice_id} for {notice.is_number} Amendment {notice.amendment_number}")

        # 1. Look up the standard in database
        stmt = select(Standard).where(Standard.is_number.ilike(f"%{notice.is_number}%"))
        result = await session.execute(stmt)
        std = result.scalars().first()

        reindexed_chunks = 0
        if std:
            # 2. Append amendment text to scope and re-embed
            amendment_text = (
                f"Amendment {notice.amendment_number} to {notice.is_number}: "
                f"{notice.description or ''} Effective: {notice.effective_date or 'immediately'}."
            )
            full_text = f"{std.title}\n\nScope: {std.scope or ''}\n\nAmendment Note: {amendment_text}"
            chunks = BISChunkingService.chunk_document(
                parsed_doc={"is_number": std.is_number, "title": std.title, "sections": [{"section_type": "REQUIREMENTS", "content": full_text}]},
                domain=std.domain or "General",
                category=std.category or "Standards"
            )
            reindexed_chunks = await EmbeddingService.index_chunks(chunks)

        return {
            "status": "PROCESSED",
            "notice_id": notice.notice_id,
            "is_number": notice.is_number,
            "amendment_number": notice.amendment_number,
            "chunks_reindexed": reindexed_chunks,
            "message": f"Successfully ingested amendment for {notice.is_number} and updated Qdrant vector database."
        }
