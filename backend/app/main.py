from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.redis import close_redis
from app.core.qdrant import init_qdrant_collections
from app.api.v1.router import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables if missing
    from app.core.database import engine, Base
    import app.models
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Initialize Qdrant vector collections & indexes
    init_qdrant_collections()
    yield
    # Shutdown tasks
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
        allow_methods=["*"],
        allow_headers=["*"],
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
