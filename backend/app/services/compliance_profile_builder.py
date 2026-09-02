import logging
import uuid
from typing import List, Dict, Any
from app.schemas.copilot_schemas import (
    CategorizedStandards,
    ComplianceProfileResponse,
    StructuredRequirementSpec,
    DomainClassificationResult,
    ConfidenceScoreDetails
)
from app.services.explainability_service import ExplainabilityEngine

logger = logging.getLogger(__name__)


class ComplianceProfileBuilder:
    """Builds structured, categorized compliance profiles from multi-stage retrieval results."""

    @staticmethod
    def build_profile(
        spec: StructuredRequirementSpec,
        classification: DomainClassificationResult,
        confidence: ConfidenceScoreDetails,
        retrieved_chunks: List[Dict[str, Any]]
    ) -> ComplianceProfileResponse:
        primary = []
        secondary = []
        safety = []
        testing = []
        cert_reqs = []
        recommendations = []

        for idx, chunk in enumerate(retrieved_chunks, 1):
            rec_id = f"REC-{uuid.uuid4().hex[:8].upper()}"
            sec_type = chunk.get("section_type", "REQUIREMENTS").upper()
            content_lower = chunk.get("content", "").lower()
            is_num = chunk.get("is_number", "IS Standard")

            # Categorization Logic
            if sec_type in ["SCOPE", "DEFINITIONS"] or idx == 1:
                category = "Primary"
                primary.append(chunk)
            elif "safety" in content_lower or "electric shock" in content_lower or "fire" in content_lower:
                category = "Safety"
                safety.append(chunk)
            elif sec_type == "TESTING" or "test" in content_lower or "ingress" in content_lower:
                category = "Testing"
                testing.append(chunk)
            elif "crs" in content_lower or "certification" in content_lower or "license" in content_lower:
                category = "Certification"
                cert_reqs.append(chunk)
            else:
                category = "Secondary"
                secondary.append(chunk)

            rec_item = ExplainabilityEngine.build_recommendation_item(
                rec_id=rec_id,
                chunk=chunk,
                category_type=category,
                spec_product=spec.product_category
            )
            recommendations.append(rec_item)

        categorized = CategorizedStandards(
            primary_standards=primary,
            secondary_standards=secondary,
            safety_standards=safety,
            testing_standards=testing,
            certification_requirements=cert_reqs,
            documentation_requirements=[
                "Mandatory BIS License / CRS Registration Certificate",
                "NABL Accredited Laboratory Test Reports (Type Test & Routine Test)",
                "Manufacturer Guarantee / Warranty Compliance Certificate",
                "Factory Inspection & Quality Assurance Audit Record"
            ]
        )

        audit_summary = ExplainabilityEngine.generate_audit_summary(
            spec_product=spec.product_category,
            domain=classification.domain,
            rec_count=len(recommendations),
            confidence_level=confidence.overall_confidence
        )

        profile_id = f"PROF-{uuid.uuid4().hex[:8].upper()}"

        return ComplianceProfileResponse(
            profile_id=profile_id,
            procurement_title=spec.product_category,
            product_category=spec.product_category,
            domain=classification.domain,
            overall_confidence=confidence,
            categorized_standards=categorized,
            recommendations=recommendations,
            audit_summary=audit_summary,
            review_status="PENDING_REVIEW"
        )
