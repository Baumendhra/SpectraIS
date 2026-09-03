import logging
from datetime import date
from typing import Dict, Any, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.standards import Standard, StandardStatus, CertificationRequirement
from app.services.bis_scraper import BISWebScraper
from app.services.chunking_service import BISChunkingService
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class StandardsSchedulerService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.scraper = BISWebScraper(delay_seconds=1.0)

    async def ingest_and_flag_revisions(self) -> Dict[str, Any]:
        """Runs the BIS scraper, upserts records, and flags revised or superseded standards."""
        logger.info("Starting scheduled BIS Standards ingestion and revision detection...")
        scraped_data = await self.scraper.scrape_crs_mandatory_standards()
        
        inserted_count = 0
        updated_count = 0
        revised_flagged_count = 0

        for item in scraped_data:
            is_num = item["is_number"]
            stmt = select(Standard).where(Standard.is_number == is_num)
            result = await self.session.execute(stmt)
            existing_std = result.scalar_one_or_none()

            cert_req = CertificationRequirement.CRS

            if existing_std is None:
                # Create new standard
                new_std = Standard(
                    is_number=is_num,
                    title=item["title"],
                    scope=item["scope"],
                    domain=item["domain"],
                    category=item["category"],
                    sector=item["sector"],
                    status=StandardStatus.ACTIVE,
                    certification_requirement=cert_req,
                    is_crs_mandated=True,
                    is_revised=item["is_revised"],
                    superseded_by=item["superseded_by"],
                    keywords=item["keywords"],
                    issuing_committee=item["issuing_committee"],
                    ic_code=item["ic_code"],
                    last_scraped_at=date.today()
                )
                self.session.add(new_std)
                await self.session.flush()
                inserted_count += 1
            else:
                # Update existing standard and check for revision flags
                existing_std.title = item["title"]
                existing_std.scope = item["scope"]
                existing_std.sector = item["sector"]
                existing_std.issuing_committee = item["issuing_committee"]
                existing_std.ic_code = item["ic_code"]
                existing_std.last_scraped_at = date.today()

                if item["superseded_by"] and not existing_std.superseded_by:
                    existing_std.superseded_by = item["superseded_by"]
                    existing_std.is_revised = True
                    existing_std.status = StandardStatus.REVISED
                    revised_flagged_count += 1
                
                await self.session.flush()
                updated_count += 1

        await self.session.commit()

        # After commit, embed any newly inserted standards into Qdrant
        embedded_count = 0
        if inserted_count > 0:
            # Re-query the standards we just inserted to get their IDs
            stmt = select(Standard).order_by(Standard.created_at.desc()).limit(inserted_count)
            result = await self.session.execute(stmt)
            new_standards = result.scalars().all()
            
            for std in new_standards:
                text = f"{std.is_number} - {std.title}\n\nScope: {std.scope or ''}\nCategory: {std.category or ''}\nKeywords: {', '.join(std.keywords or [])}"
                chunks = BISChunkingService.chunk_document(
                    parsed_doc={"is_number": std.is_number, "title": std.title, "sections": [{"section_type": "REQUIREMENTS", "content": text}]},
                    domain=std.domain or "General",
                    category=std.category or "Standards"
                )
                n = await EmbeddingService.index_chunks(chunks)
                embedded_count += n
        
        summary = {
            "total_scraped": len(scraped_data),
            "inserted": inserted_count,
            "updated": updated_count,
            "revised_flagged": revised_flagged_count,
            "vectors_embedded": embedded_count,
            "timestamp": date.today().isoformat()
        }
        logger.info(f"Ingestion job completed successfully: {summary}")
        return summary
