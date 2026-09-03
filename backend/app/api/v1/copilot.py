from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.guards import get_current_user, get_optional_current_user
from app.models.auth import User
from app.schemas.common import ResponseSchema
from app.services.rag_copilot_service import RAGCopilotService

router = APIRouter(prefix="/copilot", tags=["AI Copilot & Retrieval"])


class CopilotQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, example="What are mandatory certification requirements for structural bolts under IS 1363?")
    domain: Optional[str] = Field(None, example="Mechanical Engineering & Fasteners")
    category: Optional[str] = Field(None, example="Fasteners & Industrial Hardware")


class CitationSource(BaseModel):
    is_number: str
    title: str
    clause_ref: str
    section_type: str
    snippet: str


class CopilotQueryResponse(BaseModel):
    query: str
    answer: str
    hallucination_detected: bool
    verified_citations: List[str]
    retrieved_sources: List[CitationSource]


@router.post("/query", response_model=ResponseSchema[CopilotQueryResponse])
async def query_copilot(
    req: CopilotQueryRequest,
    session: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Query the AI Procurement Standards Copilot for grounded compliance recommendations."""
    service = RAGCopilotService(session)
    user_id = str(current_user.id) if current_user else None
    res = await service.answer_procurement_query(
        user_query=req.query,
        domain=req.domain,
        category=req.category,
        user_id=user_id
    )
    return ResponseSchema(data=res)


rag_router = APIRouter(prefix="/rag", tags=["AI Copilot & Retrieval (RAG)"])


@rag_router.post("/ask")
async def ask_rag(
    req: CopilotQueryRequest,
    session: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Alias for Copilot RAG query."""
    service = RAGCopilotService(session)
    user_id = str(current_user.id) if current_user else None
    res = await service.answer_procurement_query(
        user_query=req.query,
        domain=req.domain,
        category=req.category,
        user_id=user_id
    )
    return {
        "success": True,
        **res,
        "data": res
    }
