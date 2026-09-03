import argparse
import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.qdrant import init_qdrant_collections
from app.models.standards import Standard
from app.services.chunking_service import BISChunkingService
from app.services.embedding_service import EmbeddingService


async def seed_vectors(dry_run: bool = False):
    if not dry_run:
        init_qdrant_collections()

    total_standards = 0
    total_vectors = 0

    async with AsyncSessionLocal() as session:
        stmt = select(Standard).order_by(Standard.created_at)
        result = await session.execute(stmt)
        standards = result.scalars().all()

        print(f"Found {len(standards)} standards in database to process.")

        for std in standards:
            text = (
                f"{std.is_number} - {std.title}\n\n"
                f"Scope: {std.scope or ''}\n\n"
                f"Domain: {std.domain or ''}\n"
                f"Category: {std.category or ''}\n"
                f"Sector: {std.sector or ''}\n"
                f"Keywords: {', '.join(std.keywords or [])}"
            )
            parsed_doc = {
                "is_number": std.is_number,
                "title": std.title,
                "sections": [{"section_type": "REQUIREMENTS", "content": text}]
            }
            chunks = BISChunkingService.chunk_document(
                parsed_doc=parsed_doc,
                domain=std.domain or "General Engineering",
                category=std.category or "Standards Specifications"
            )

            if dry_run:
                n = len(chunks)
                print(f"[DRY-RUN] Would index {std.is_number} -> {n} chunks")
            else:
                n = await EmbeddingService.index_chunks(chunks)
                print(f"Indexed {std.is_number} -> {n} chunks")

            total_vectors += n
            total_standards += 1

    mode_label = "[DRY-RUN] " if dry_run else ""
    print(f"\n{mode_label}Vector Seeding Summary:")
    print(f"  Total Standards Processed: {total_standards}")
    print(f"  Total Vectors Upserted:   {total_vectors}")


def main():
    parser = argparse.ArgumentParser(description="Seed Qdrant vector database with BIS standards chunks and embeddings.")
    parser.add_argument("--dry-run", action="store_true", help="Print chunk counts without generating embeddings or calling Qdrant.")
    args = parser.parse_args()

    asyncio.run(seed_vectors(dry_run=args.dry_run))


if __name__ == "__main__":
    main()
