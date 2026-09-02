import os
from typing import List, Union
from pydantic import AnyHttpUrl, PostgresDsn, RedisDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Procurement Standards & Compliance Copilot"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "SUPER_SECRET_KEY_CHANGE_IN_PRODUCTION_MIN_32_CHARS_LONG_12345"
    REFRESH_SECRET_KEY: str = "SUPER_SECRET_REFRESH_KEY_CHANGE_IN_PRODUCTION_MIN_32_CHARS_67890"
    ALGORITHM: str = "HS256"
    
    # Token expiration times
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "spectrais_db"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str | None = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str | None, info) -> str:
        if isinstance(v, str) and v:
            return v
        values = info.data
        if os.getenv("USE_POSTGRES", "false").lower() == "true":
            user = values.get("POSTGRES_USER")
            password = values.get("POSTGRES_PASSWORD")
            host = values.get("POSTGRES_SERVER")
            port = values.get("POSTGRES_PORT")
            db = values.get("POSTGRES_DB")
            return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{db}"
        return "sqlite+aiosqlite:///./spectrais.db"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str | None = None

    @field_validator("REDIS_URL", mode="before")
    @classmethod
    def assemble_redis_connection(cls, v: str | None, info) -> str:
        if isinstance(v, str) and v:
            return v
        values = info.data
        host = values.get("REDIS_HOST")
        port = values.get("REDIS_PORT")
        return f"redis://{host}:{port}/0"

    # Qdrant Vector DB
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION_NAME: str = "bis_standards_chunks"
    VECTOR_SIZE: int = 768  # Vertex AI text-embedding-004 vector dimension

    # Gemini & Vertex AI
    GEMINI_API_KEY: str = "MOCK_GEMINI_API_KEY_FOR_LOCAL_DEV"
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_PRO_MODEL: str = "gemini-2.5-pro"

    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
