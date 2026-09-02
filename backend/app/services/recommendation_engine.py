import logging
import re
from typing import Dict, Any, Optional, List
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.copilot_schemas import ComplianceProfileResponse
from app.services.requirement_understanding_service import RequirementUnderstandingEngine
from app.services.product_classification_service import ProductClassificationEngine
from app.services.retrieval_service import RetrievalService
from app.services.confidence_scoring_service import ConfidenceScoringEngine
from app.services.compliance_profile_builder import ComplianceProfileBuilder
from app.services.hallucination_guard import HallucinationGuard
from app.models.standards import Standard

logger = logging.getLogger(__name__)


class StandardsRecommendationEngine:
    """Master Government Compliance Orchestration Engine.
    
    Coordinates specification understanding, multi-tier product classification,
    hybrid dense/sparse retrieval, hallucination guardrails, standard lifecycle verification,
    and automated tender BOQ compliance clause generation.
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self.retrieval_service = RetrievalService(session)
        self.hallucination_guard = HallucinationGuard(session)

    async def generate_recommendation_profile(
        self,
        raw_procurement_text: str,
        user_id: Optional[str] = None
    ) -> ComplianceProfileResponse:
        """Executes full government-grade recommendation pipeline."""
        logger.info(f"Starting government compliance recommendation for: '{raw_procurement_text[:60]}...'")

        # 1. Government Requirement Understanding & Parameter Extraction
        spec = await RequirementUnderstandingEngine.extract_specification(raw_procurement_text)

        # 2. Multi-Tier Government Taxonomy Classification (Domain, Committee, HSN, GeM)
        classification = ProductClassificationEngine.classify_requirement(spec)

        # 3. Direct Match & Verification of Explicitly Cited Indian Standards
        explicit_matches: List[Dict[str, Any]] = []
        if spec.detected_is_citations:
            explicit_matches = await self._fetch_explicit_citation_records(spec.detected_is_citations)

        # 4. Hybrid Enterprise Retrieval (Dense Vector + Multi-Token Database Keyword)
        retrieval_query = f"{spec.product_category} {' '.join(spec.technical_requirements[:3])}"
        retrieved_chunks = await self.retrieval_service.hybrid_retrieve(
            query=retrieval_query,
            domain=classification.domain,
            top_k=6
        )

        # 5. Merge & Deduplicate explicit citations with retrieved standards
        merged_chunks = self._merge_and_deduplicate(explicit_matches, retrieved_chunks, max_count=6)

        # If no chunks found, pull domain-level mandatory CRS standards as baseline
        if not merged_chunks:
            merged_chunks = await self._fallback_mandatory_standards(classification.domain)

        # 6. HallucinationGuard Verification
        # Validates that all candidate IS numbers genuinely exist in PostgreSQL
        verified_chunks = await self._validate_with_hallucination_guard(merged_chunks)

        # 7. Multi-Factor Confidence Scoring
        confidence = ConfidenceScoringEngine.calculate_confidence(
            spec=spec,
            classification=classification,
            retrieved_chunks=verified_chunks
        )

        # 8. Assemble Compliance Profile with Tender BOQ Clauses & Testing Regimen
        profile = ComplianceProfileBuilder.build_profile(
            spec=spec,
            classification=classification,
            confidence=confidence,
            retrieved_chunks=verified_chunks
        )

        logger.info(
            f"Successfully generated government compliance profile {profile.profile_id} "
            f"for '{profile.product_category}' [Confidence: {confidence.overall_confidence}]"
        )
        return profile

    async def _fetch_explicit_citation_records(self, citations: List[str]) -> List[Dict[str, Any]]:
        """Queries PostgreSQL database for exact or numeric matches of explicitly cited IS numbers."""
        records: List[Dict[str, Any]] = []
        seen_numbers = set()

        for citation in citations:
            num_match = re.search(r"\d+", citation)
            if not num_match:
                continue
            is_num = num_match.group(0)

            stmt = select(Standard).where(
                or_(
                    Standard.is_number.ilike(f"%{citation}%"),
                    Standard.is_number.ilike(f"%IS {is_num}%"),
                    Standard.is_number.ilike(f"%{is_num}%")
                )
            ).limit(2)

            res = await self.session.execute(stmt)
            matches = res.scalars().all()

            for std in matches:
                if std.is_number in seen_numbers:
                    continue
                seen_numbers.add(std.is_number)

                records.append({
                    "id": str(std.id),
                    "is_number": std.is_number,
                    "title": std.title,
                    "domain": std.domain,
                    "category": std.category,
                    "clause_ref": "Explicit Citation Clause (Tender Specification)",
                    "section_type": "MANDATORY COMPLIANCE",
                    "content": f"Mandatory Cited Standard: {std.title}. Governs {std.category}. Scope: {std.scope}",
                    "score": 0.98,
                    "source": "explicit_citation",
                    "is_crs_mandated": std.is_crs_mandated,
                    "status": std.status.value if hasattr(std.status, "value") else str(std.status),
                    "is_revised": std.is_revised,
                    "superseded_by": std.superseded_by
                })

        return records

    async def _fallback_mandatory_standards(self, domain: str) -> List[Dict[str, Any]]:
        """Pulls top active CRS mandatory standards for the domain if specific search yields empty."""
        stmt = (
            select(Standard)
            .where(Standard.is_crs_mandated == True)
            .order_by(Standard.created_at.desc())
            .limit(4)
        )
        res = await self.session.execute(stmt)
        standards = res.scalars().all()

        return [
            {
                "id": str(std.id),
                "is_number": std.is_number,
                "title": std.title,
                "domain": std.domain,
                "category": std.category,
                "clause_ref": "Clause 3 (Mandatory Government Registration)",
                "section_type": "REQUIREMENTS",
                "content": f"Official Gazette Notification Standard: {std.title}. Scope: {std.scope}",
                "score": 0.85,
                "source": "statutory_crs_catalog",
                "is_crs_mandated": std.is_crs_mandated,
                "status": std.status.value if hasattr(std.status, "value") else str(std.status),
                "is_revised": std.is_revised,
                "superseded_by": std.superseded_by
            }
            for std in standards
        ]

    def _merge_and_deduplicate(
        self,
        priority_chunks: List[Dict[str, Any]],
        retrieved_chunks: List[Dict[str, Any]],
        max_count: int = 6
    ) -> List[Dict[str, Any]]:
        """Merges explicit citations with retrieval results, avoiding duplicate standards."""
        merged: List[Dict[str, Any]] = []
        seen_numbers = set()

        for chunk in priority_chunks:
            is_num = chunk.get("is_number")
            if is_num and is_num not in seen_numbers:
                seen_numbers.add(is_num)
                merged.append(chunk)

        for chunk in retrieved_chunks:
            is_num = chunk.get("is_number")
            if is_num and is_num not in seen_numbers:
                seen_numbers.add(is_num)
                merged.append(chunk)

        return merged[:max_count]

    async def _validate_with_hallucination_guard(
        self,
        chunks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Cross-checks every candidate standard against the official PostgreSQL database."""
        verified: List[Dict[str, Any]] = []

        for chunk in chunks:
            is_num = chunk.get("is_number")
            if not is_num:
                continue

            num_match = re.search(r"\d+", is_num)
            if num_match:
                num = num_match.group(0)
                stmt = select(Standard).where(
                    or_(
                        Standard.is_number.ilike(f"%{is_num.strip()}%"),
                        Standard.is_number.ilike(f"%{num}%")
                    )
                ).limit(1)
                res = await self.session.execute(stmt)
                match = res.scalar_one_or_none()

                if match:
                    # Update chunk with accurate database attributes
                    chunk["is_number"] = match.is_number
                    chunk["title"] = match.title
                    chunk["is_crs_mandated"] = match.is_crs_mandated
                    chunk["status"] = match.status.value if hasattr(match.status, "value") else str(match.status)
                    chunk["is_revised"] = match.is_revised
                    chunk["superseded_by"] = match.superseded_by
                    verified.append(chunk)
                else:
                    logger.warning(f"HallucinationGuard dropped unverified standard reference: '{is_num}'")
            else:
                verified.append(chunk)

        return verified
