import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.guards import require_roles, get_optional_current_user
from app.models.auth import User
from app.models.rag import IngestionJob, IngestionStatus
from app.schemas.common import ResponseSchema
from app.services.pdf_parser import BISDocumentParser
from app.services.chunking_service import BISChunkingService
from app.services.embedding_service import EmbeddingService
from app.repositories.standards_repository import StandardsRepository

router = APIRouter(prefix="/ingestion", tags=["Document Ingestion & Indexing"])


class IngestionJobResponse(BaseModel):
    id: uuid.UUID
    filename: str
    is_number: Optional[str] = None
    status: IngestionStatus
    chunks_count: int
    vectors_count: int
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


@router.post("/upload", response_model=ResponseSchema[IngestionJobResponse], status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    domain: str = Form("General Engineering"),
    category: str = Form("Standards Specifications"),
    session: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Upload a BIS PDF document, parse sections, generate embeddings, and store in Qdrant."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF documents are supported.")

    content_bytes = await file.read()
    
    job = IngestionJob(
        filename=file.filename,
        status=IngestionStatus.PARSING,
        chunks_count=0,
        vectors_count=0
    )
    session.add(job)
    await session.flush()

    try:
        # 1. Parse PDF
        parsed_doc = BISDocumentParser.parse_pdf(content_bytes)
        job.is_number = parsed_doc["is_number"]
        job.status = IngestionStatus.CHUNKING

        # 2. Semantic Chunking
        chunks = BISChunkingService.chunk_document(
            parsed_doc=parsed_doc,
            domain=domain,
            category=category
        )
        job.chunks_count = len(chunks)
        job.status = IngestionStatus.EMBEDDING

        # 3. Vector Embedding & Qdrant Indexing
        indexed_count = await EmbeddingService.index_chunks(chunks)
        job.vectors_count = indexed_count
        job.status = IngestionStatus.COMPLETED

    except Exception as e:
        job.status = IngestionStatus.FAILED
        job.error_message = str(e)

    await session.commit()
    await session.refresh(job)

    return ResponseSchema(
        message="Document processed and indexed into Qdrant.",
        data=IngestionJobResponse.model_validate(job)
    )


@router.get("/jobs", response_model=ResponseSchema[List[IngestionJobResponse]])
async def list_ingestion_jobs(
    session: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """List recent document ingestion jobs."""
    stmt = select(IngestionJob).order_by(IngestionJob.created_at.desc()).limit(50)
    result = await session.execute(stmt)
    jobs = result.scalars().all()
    resp = [IngestionJobResponse.model_validate(j) for j in jobs]
    return ResponseSchema(data=resp)
