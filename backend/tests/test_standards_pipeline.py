import pytest
import asyncio
from datetime import date
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.database import Base
from app.models.standards import Standard, StandardStatus, CertificationRequirement
from app.services.bis_scraper import BISWebScraper
from app.services.standards_scheduler import StandardsSchedulerService
from app.services.standards_service import StandardsService
from app.schemas.standards import StandardFilterParams


import pytest_asyncio

@pytest_asyncio.fixture
async def async_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session
    
    await engine.dispose()


@pytest.mark.asyncio
async def test_bis_scraper_sectors_and_committees():
    scraper = BISWebScraper(delay_seconds=0.1)
    
    # Test sector classification
    laptop_sectors = scraper.derive_sectors("Laptop/Notebook/Tablet", "IS 13252(Part 1):2010")
    assert "laptops" in laptop_sectors
    assert "computers" in laptop_sectors

    phone_sectors = scraper.derive_sectors("Mobile Phones", "IS 13252(Part 1):2010")
    assert "phones" in phone_sectors

    # Test committee lookup
    committee_name, ic_code = scraper.derive_committee("IS 13252(Part 1):2010")
    assert "LITD 14" in committee_name
    assert ic_code == "LITD14"


@pytest.mark.asyncio
async def test_standards_scheduler_ingestion_and_revision(async_session: AsyncSession):
    scheduler = StandardsSchedulerService(async_session)
    result = await scheduler.ingest_and_flag_revisions()

    assert result["total_scraped"] > 0
    assert result["inserted"] > 0

    # Verify standard exists in DB
    service = StandardsService(async_session)
    std = await service.get_by_is_number("IS 13252(Part 1):2010")
    assert std is not None
    assert std.certification_requirement == CertificationRequirement.CRS
    assert std.is_crs_mandated is True


@pytest.mark.asyncio
async def test_standards_service_search_and_sector_filter(async_session: AsyncSession):
    scheduler = StandardsSchedulerService(async_session)
    await scheduler.ingest_and_flag_revisions()

    service = StandardsService(async_session)

    # Search query
    search_res = await service.list_standards(StandardFilterParams(query="mobile", page=1, size=10))
    assert search_res.total >= 1

    # Sector filter
    sector_res = await service.get_by_sector("computers")
    assert len(sector_res) >= 1
    assert any(s.is_number is not None for s in sector_res)
