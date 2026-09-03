from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.redis import close_redis
from app.core.qdrant import init_qdrant_collections
from app.api.v1.router import api_v1_router


import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.database import AsyncSessionLocal
from app.services.standards_scheduler import StandardsSchedulerService

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables if missing
    from app.core.database import engine, Base
    import app.models
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Initialize Qdrant vector collections & indexes
    init_qdrant_collections()

    # Warn loudly if running with mock credentials
    if settings.GEMINI_API_KEY.startswith("MOCK"):
        logger.warning(
            "⚠️  GEMINI_API_KEY is set to a mock value. "
            "Semantic search is DISABLED. Set a real key in .env to enable embeddings."
        )
    if settings.SECRET_KEY.startswith("SUPER_SECRET"):
        raise RuntimeError(
            "SECRET_KEY must be changed from the default before running in any environment. "
            "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
        )

    # Background scheduler for daily BIS Gazette scraping & refresh
    scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")

    async def scheduled_scrape():
        async with AsyncSessionLocal() as session:
            svc = StandardsSchedulerService(session)
            summary = await svc.ingest_and_flag_revisions()
            logger.info(f"Scheduled BIS refresh: {summary}")

    scheduler.add_job(scheduled_scrape, "cron", hour=2, minute=0)  # 2 AM IST daily
    scheduler.start()

    yield

    # Shutdown tasks
    try:
        scheduler.shutdown()
    except Exception:
        pass
    await close_redis()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-Grade AI-Powered Procurement Standards & Compliance Copilot API for Government Procurement",
    version="2.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS Configuration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept", "X-Request-ID"],
    )

# Include API v1 routes
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "title": settings.PROJECT_NAME,
        "version": "2.0.0",
        "status": "online",
        "docs": f"{settings.API_V1_STR}/docs"
    }
