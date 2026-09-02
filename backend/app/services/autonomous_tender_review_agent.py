import logging
import uuid
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.phase6_schemas import MultiAgentReviewPackage
from app.services.multi_agent_orchestrator import MultiAgentOrchestrator
from app.services.tender_analysis_pipeline_service import TenderAnalysisPipelineService

logger = logging.getLogger(__name__)


class AutonomousTenderReviewAgent:
    """Autonomous AI Agent executing independent tender review and review package assembly."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.pipeline_service = TenderAnalysisPipelineService(session)

    async def review_tender_autonomously(self, filename: str, tender_text: str) -> MultiAgentReviewPackage:
        review_id = f"REV-{uuid.uuid4().hex[:8].upper()}"

        # 1. Run 9-Agent Pipeline Orchestrator
        agent_logs = await MultiAgentOrchestrator.execute_multi_agent_pipeline(tender_text)

        # 2. Run Analysis Pipeline
        analysis = await self.pipeline_service.analyze_tender_document(filename, tender_text.encode("utf-8"))

        summary = (
            f"Autonomous Multi-Agent Review complete for '{analysis.title}'. "
            f"Evaluated by 9 specialized AI agents. Achieved a Procurement Quality Index (PQI) of {analysis.overall_score.overall_score}/100. "
            f"Detected {len(analysis.gaps)} compliance gaps and {len(analysis.risks)} risk factors requiring officer review."
        )

        return MultiAgentReviewPackage(
            review_id=review_id,
            tender_title=analysis.title,
            product_category=analysis.understanding.product_category,
            domain=analysis.understanding.domain,
            agent_logs=agent_logs,
            overall_pqi_score=analysis.overall_score.overall_score,
            gaps_count=len(analysis.gaps),
            risks_count=len(analysis.risks),
            suggested_improvements_count=len(analysis.recommended_clauses),
            review_summary=summary
        )
