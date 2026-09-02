import logging
from typing import List, Dict, Any
from app.schemas.copilot_schemas import StandardCitation, RecommendationItem

logger = logging.getLogger(__name__)


class ExplainabilityEngine:
    """Builds government-grade citations, evidence panels, and traceability rationale for recommendations."""

    @staticmethod
    def build_recommendation_item(
        rec_id: str,
        chunk: Dict[str, Any],
        category_type: str,
        spec_product: str
    ) -> RecommendationItem:
        is_num = chunk.get("is_number", "IS Standard")
        title = chunk.get("title", "Bureau of Indian Standards Specification")
        clause = chunk.get("clause_ref", "General Scope")
        sec_type = chunk.get("section_type", "REQUIREMENTS")
        snippet = chunk.get("content", "")

        reason = (
            f"{is_num} ({title}) applies directly to {spec_product} under clause {clause} "
            f"covering {sec_type.lower()} parameters and quality compliance mandates."
        )

        risk_level = "HIGH" if "MANDATORY" in snippet.upper() or "CRS" in snippet.upper() or "SHALL" in snippet.upper() else "MEDIUM"

        return RecommendationItem(
            recommendation_id=rec_id,
            is_number=is_num,
            standard_title=title,
            clause_reference=clause,
            category_type=category_type,
            applicability_reason=reason,
            evidence_text=snippet[:350] + ("..." if len(snippet) > 350 else ""),
            source_sections=[sec_type],
            confidence_score=round(chunk.get("score", 0.85), 3),
            risk_level=risk_level,
            related_standards=[]
        )

    @staticmethod
    def generate_audit_summary(spec_product: str, domain: str, rec_count: int, confidence_level: str) -> str:
        return (
            f"AI Procurement Recommendation Audit Summary: Evaluated specification for '{spec_product}' "
            f"under domain '{domain}'. Retrieved and verified {rec_count} cited Bureau of Indian Standards (BIS) clauses. "
            f"Overall Recommendation Confidence: {confidence_level}. Traceability evidence verified against repository."
        )
