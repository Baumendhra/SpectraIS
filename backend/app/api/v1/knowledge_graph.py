from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.guards import get_current_user
from app.models.auth import User
from app.models.standards import Standard
from app.models.rag import StandardRelation
from app.schemas.common import ResponseSchema

router = APIRouter(prefix="/knowledge-graph", tags=["Knowledge Graph Foundation"])


@router.get("/graph", response_model=ResponseSchema[Dict[str, Any]])
async def get_knowledge_graph(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve graph nodes (Standards, Categories) and edges (Relations) for visualization."""
    # Fetch nodes
    stmt_std = select(Standard).where(Standard.is_active == True)
    res_std = await session.execute(stmt_std)
    standards = res_std.scalars().all()

    nodes = [
        {
            "id": str(std.id),
            "label": std.is_number,
            "title": std.title,
            "group": std.domain,
            "category": std.category,
            "status": std.status
        }
        for std in standards
    ]

    # Fetch edges
    stmt_rel = select(StandardRelation)
    res_rel = await session.execute(stmt_rel)
    relations = res_rel.scalars().all()

    edges = [
        {
            "id": str(rel.id),
            "from": str(rel.source_standard_id),
            "to": str(rel.target_standard_id),
            "type": rel.relation_type,
            "label": rel.relation_type
        }
        for rel in relations
    ]

    return ResponseSchema(data={"nodes": nodes, "edges": edges})
