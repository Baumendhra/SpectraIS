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

        qco_count = 0

        for idx, chunk in enumerate(retrieved_chunks, 1):
            rec_id = f"REC-{uuid.uuid4().hex[:8].upper()}"
            sec_type = chunk.get("section_type", "REQUIREMENTS").upper()
            content_lower = chunk.get("content", "").lower()
            is_crs = chunk.get("is_crs_mandated", False) or spec.qco_mandated

            if is_crs:
                qco_count += 1

            # Categorization Logic
            if is_crs:
                category = "Mandatory QCO"
                cert_reqs.append(chunk)
            elif sec_type in ["SCOPE", "DEFINITIONS"] or idx == 1:
                category = "Primary Product Standard"
                primary.append(chunk)
            elif "safety" in content_lower or "electric shock" in content_lower or "fire" in content_lower:
                category = "Safety & Ingress Protection"
                safety.append(chunk)
            elif sec_type == "TESTING" or "test" in content_lower or "ingress" in content_lower:
                category = "Testing & Verification"
                testing.append(chunk)
            else:
                category = "Complementary Specification"
                secondary.append(chunk)

            rec_item = ExplainabilityEngine.build_recommendation_item(
                rec_id=rec_id,
                chunk=chunk,
                category_type=category,
                spec_product=spec.product_category,
                qco_mandated=is_crs
            )
            recommendations.append(rec_item)

        # Government Documentation Checklist
        doc_requirements = [
            "Valid Bureau of Indian Standards (BIS) License / Certificate with Standard Mark",
            "Complete Type Test Report from a NABL Accredited / BIS Recognized Laboratory (within 180 days)",
            "OEM Authorization & Manufacturer Guarantee / Warranty Commitment Certificate",
            "Factory Quality Control & Routine Test Inspection Protocol Records",
        ]
        if spec.make_in_india_percent:
            doc_requirements.append(
                f"Statutory Make in India (MII) Local Content Declaration (>= {spec.make_in_india_percent}%)"
            )
        if spec.qco_mandated or qco_count > 0:
            doc_requirements.append(
                "Central Government Quality Control Order (QCO) Gazette Compliance Certificate"
            )

        categorized = CategorizedStandards(
            primary_standards=primary,
            secondary_standards=secondary,
            safety_standards=safety,
            testing_standards=testing,
            certification_requirements=cert_reqs,
            documentation_requirements=doc_requirements
        )

        audit_summary = ExplainabilityEngine.generate_audit_summary(
            spec_product=spec.product_category,
            domain=classification.domain,
            committee=classification.sectional_committee,
            rec_count=len(recommendations),
            confidence_level=confidence.overall_confidence,
            qco_count=qco_count
        )
        profile_id = f"PROF-{uuid.uuid4().hex[:8].upper()}"

        disclaimer = (
            "STATUTORY COMPLIANCE NOTICE: Pursuant to the Bureau of Indian Standards Act 2016 and "
            "Rule 144(xi) of the General Financial Rules (GFR) 2017, all government procurement items "
            "notified under Compulsory Registration Scheme (CRS) or Quality Control Orders (QCO) must strictly "
            "bear the valid BIS Standard Mark. Bids submitted with invalid or expired licenses shall be summarily "
            "rejected as technically non-responsive without clarification."
        )

        return ComplianceProfileResponse(
            profile_id=profile_id,
            procurement_title=f"{spec.product_category} Compliance Specification Profile",
            product_category=spec.product_category,
            domain=classification.domain,
            overall_confidence=confidence,
            categorized_standards=categorized,
            recommendations=recommendations,
            audit_summary=audit_summary,
            review_status="PENDING_REVIEW",
            sectional_committee=classification.sectional_committee,
            suggested_hsn=classification.suggested_hsn,
            qco_enforced=spec.qco_mandated or qco_count > 0,
            statutory_disclaimer=disclaimer,
            needs_clarification=spec.needs_clarification,
            missing_parameters=spec.missing_parameters,
            clarification_questions=spec.clarification_questions
        )
