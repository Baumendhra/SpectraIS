import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.schemas.copilot_schemas import (
    StructuredRequirementSpec,
    DomainClassificationResult,
    ComplianceProfileResponse,
    OfficerReviewRequest,
    EvaluationMetricSummary
)
from app.services.requirement_understanding_service import RequirementUnderstandingEngine
from app.services.product_classification_service import ProductClassificationEngine
from app.services.recommendation_engine import StandardsRecommendationEngine
from app.services.recommendation_workflow_service import RecommendationWorkflowService
from app.services.evaluation_service import EvaluationFramework

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/copilot", tags=["AI Procurement Copilot"])


class RawRequirementInput(BaseModel):
    procurement_text: str = Field(..., example="Procurement of LED street lights for municipal roads.")


@router.post("/understand-requirement", response_model=StructuredRequirementSpec)
async def understand_requirement(input_data: RawRequirementInput):
    """Parses raw procurement text into a structured specification profile."""
    try:
        return await RequirementUnderstandingEngine.extract_specification(input_data.procurement_text)
    except Exception as e:
        logger.error(f"Error extracting requirement: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/classify-domain", response_model=DomainClassificationResult)
async def classify_domain(spec: StructuredRequirementSpec):
    """Classifies structured specification into one of the 8 core engineering domains."""
    try:
        return ProductClassificationEngine.classify_requirement(spec)
    except Exception as e:
        logger.error(f"Error classifying domain: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/recommend-standards", response_model=ComplianceProfileResponse)
async def recommend_standards(
    input_data: RawRequirementInput,
    db: AsyncSession = Depends(get_db)
):
    """Executes end-to-end multi-stage retrieval, scoring, and recommendation pipeline."""
    try:
        engine = StandardsRecommendationEngine(db)
        return await engine.generate_recommendation_profile(input_data.procurement_text)
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/review-recommendation")
async def review_recommendation(
    review_req: OfficerReviewRequest,
    db: AsyncSession = Depends(get_db)
):
    """Records Procurement Officer review decision (APPROVED, REJECTED, MODIFIED) in audit log."""
    try:
        workflow = RecommendationWorkflowService(db)
        return await workflow.process_officer_review(review_req, officer_id="00000000-0000-0000-0000-000000000001")
    except Exception as e:
        logger.error(f"Error saving officer review: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/evaluate", response_model=EvaluationMetricSummary)
async def evaluate_copilot():
    """Runs evaluation framework benchmark on recommendation precision, recall, and hallucination rate."""
    try:
        return EvaluationFramework.run_benchmark_eval()
    except Exception as e:
        logger.error(f"Error running evaluation: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
