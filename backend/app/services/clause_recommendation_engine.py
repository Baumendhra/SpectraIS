import logging
import uuid
from typing import List
from app.schemas.tender_analysis_schemas import ClauseRecommendation, TenderUnderstandingProfile

logger = logging.getLogger(__name__)


class ClauseRecommendationEngine:
    """Generates ready-to-use procurement clauses to fix detected gaps in tender documents."""

    @staticmethod
    def generate_clauses(understanding: TenderUnderstandingProfile) -> List[ClauseRecommendation]:
        product = understanding.product_category
        domain = understanding.domain

        clauses = [
            ClauseRecommendation(
                clause_id=f"CLS-{uuid.uuid4().hex[:6].upper()}",
                clause_title="Mandatory BIS Certification & CRS Registration Clause",
                clause_category="BIS Certification",
                clause_text=(
                    f"Clause 4.1 Mandatory BIS License: All supplied {product} and critical components "
                    f"(including LED drivers and modules) must hold a valid Bureau of Indian Standards (BIS) "
                    f"Registration License under the Compulsory Registration Scheme (CRS) in compliance with "
                    f"Ministry of Electronics & Information Technology / Ministry of Power Quality Control Orders (QCO). "
                    f"The bidder must submit valid BIS License copies with the technical bid."
                ),
                rationale="Prevents procurement of uncertified or non-compliant equipment in government tenders.",
                is_editable=True
            ),
            ClauseRecommendation(
                clause_id=f"CLS-{uuid.uuid4().hex[:6].upper()}",
                clause_title="NABL Accredited Laboratory Type-Test Clause",
                clause_category="NABL Testing",
                clause_text=(
                    f"Clause 5.2 Laboratory Testing: The bidder shall submit original Type-Test Reports issued by a "
                    f"National Accreditation Board for Testing and Calibration Laboratories (NABL) accredited laboratory "
                    f"for {product}. Test reports must cover Ingress Protection (minimum IP66 as per IS 12063) "
                    f"and High Voltage Surge Protection (minimum 10kV as per IS 16102 / IS 10322) conducted within 24 months."
                ),
                rationale="Ensures technical parameters meet IP66 weatherproofing and surge survival standards.",
                is_editable=True
            ),
            ClauseRecommendation(
                clause_id=f"CLS-{uuid.uuid4().hex[:6].upper()}",
                clause_title="Electrical Safety & Thermal Cutoff Protection Clause",
                clause_category="Safety",
                clause_text=(
                    f"Clause 6.1 Electrical Safety: All luminaires and electrical control gear shall conform strictly to "
                    f"IS 10322 (Part 5 / Sec 1) for Class II double-insulation safety. Drivers must feature auto-resetting "
                    f"thermal cutoff protection operating at temperatures exceeding 85°C to prevent fire hazards."
                ),
                rationale="Protects against electrical shock hazards and overheating in public installations.",
                is_editable=True
            ),
            ClauseRecommendation(
                clause_id=f"CLS-{uuid.uuid4().hex[:6].upper()}",
                clause_title="Joint Pre-Dispatch Factory Inspection (PDI) Clause",
                clause_category="Inspection",
                clause_text=(
                    f"Clause 7.3 Pre-Dispatch Inspection: Materials shall be dispatched only after issuance of a clean "
                    f"Pre-Dispatch Inspection (PDI) Certificate by a designated Government Quality Auditor / Purchasing "
                    f"Officer. Joint testing shall include routine high-voltage insulation tests and wattage verification."
                ),
                rationale="Guarantees batch quality verification prior to factory dispatch.",
                is_editable=True
            )
        ]

        return clauses
