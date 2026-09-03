import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select, func
from app.core.database import AsyncSessionLocal
from app.models.standards import Standard
from app.services.standards_scheduler import StandardsSchedulerService


async def run_check_and_ingest():
    async with AsyncSessionLocal() as session:
        scheduler = StandardsSchedulerService(session)
        print("[INGESTING] Starting live BIS scraper ingestion...")
        results = await scheduler.ingest_and_flag_revisions()
        print(f"[RESULTS] Ingestion complete: {results}")

        res = await session.execute(select(func.count(Standard.id)))
        total_count = res.scalar()
        print(f"[DATABASE] TOTAL STANDARDS IN DB = {total_count}")


if __name__ == "__main__":
    asyncio.run(run_check_and_ingest())
