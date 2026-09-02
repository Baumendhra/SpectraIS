import logging
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.rag_copilot_service import RAGCopilotService

logger = logging.getLogger(__name__)


class ProcurementResearchAssistant:
    """Source-grounded AI Research Assistant for deep Indian Standards & Gazette inquiries."""

    def __init__(self, session: AsyncSession):
        self.copilot_service = RAGCopilotService(session)

    async def execute_research(self, query: str) -> Dict[str, Any]:
        result = await self.copilot_service.answer_procurement_query(query)
        result["research_assistant_mode"] = "GROUNDED_BIS_KNOWLEDGE_GRAPH"
        return result
