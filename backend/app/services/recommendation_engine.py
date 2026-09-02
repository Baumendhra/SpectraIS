import logging
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.copilot_schemas import ComplianceProfileResponse
from app.services.requirement_understanding_service import RequirementUnderstandingEngine
from app.services.product_classification_service import ProductClassificationEngine
from app.services.retrieval_service import RetrievalService
from app.services.confidence_scoring_service import ConfidenceScoringEngine
from app.services.compliance_profile_builder import ComplianceProfileBuilder
from app.services.hallucination_guard import HallucinationGuard

logger = logging.getLogger(__name__)


class StandardsRecommendationEngine:
    """Master Orchestration Engine for Phase 3 AI Procurement Copilot."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.retrieval_service = RetrievalService(session)
        self.hallucination_guard = HallucinationGuard(session)

    async def generate_recommendation_profile(
        self,
        raw_procurement_text: str,
        user_id: Optional[str] = None
    ) -> ComplianceProfileResponse:
        """Executes full pipeline: Understanding -> Classification -> Retrieval -> Confidence -> Profile Assembly."""
        logger.info(f"Starting recommendation generation for: '{raw_procurement_text[:60]}...'")

        # 1. Requirement Understanding
        spec = await RequirementUnderstandingEngine.extract_specification(raw_procurement_text)

        # 2. Product Classification
        classification = ProductClassificationEngine.classify_requirement(spec)

        # 3. Multi-Stage Enterprise Retrieval
        retrieved_chunks = await self.retrieval_service.hybrid_retrieve(
            query=f"{spec.product_category} {' '.join(spec.technical_requirements)}",
            domain=classification.domain,
            top_k=6
        )

        # 4. Multi-Factor Confidence Scoring
        confidence = ConfidenceScoringEngine.calculate_confidence(
            spec=spec,
            classification=classification,
            retrieved_chunks=retrieved_chunks
        )

        # 5. Compliance Profile Assembly
        profile = ComplianceProfileBuilder.build_profile(
            spec=spec,
            classification=classification,
            confidence=confidence,
            retrieved_chunks=retrieved_chunks
        )

        logger.info(f"Generated profile {profile.profile_id} with confidence {confidence.overall_confidence}")
        return profile
