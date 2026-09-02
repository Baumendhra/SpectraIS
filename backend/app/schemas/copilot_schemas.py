from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import uuid
from datetime import datetime


class StructuredRequirementSpec(BaseModel):
    product_category: str = Field(..., description="Target product category e.g. LED Street Lights, ICU Ventilator, CCTV Camera")
    domain: str = Field(..., description="Primary domain e.g. Electrical, Mechanical, Civil, Medical, IT, Telecom, Electronics, Infrastructure")
    application_context: str = Field(..., description="Intended application context e.g. Municipal outdoor lighting, Smart city surveillance")
    environment: str = Field(..., description="Operating environment e.g. Outdoor IP66, Indoor ICU, Heavy Industrial")
    technical_requirements: List[str] = Field(default_factory=list, description="Extracted technical parameters & constraints")
    certification_requirements: List[str] = Field(default_factory=list, description="Extracted compliance & certification expectations")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    # Government Procurement Extensions
    detected_is_citations: List[str] = Field(default_factory=list, description="Explicit Indian Standards citations found in spec (e.g. IS 10322)")
    operational_parameters: Dict[str, Any] = Field(default_factory=dict, description="Numerical thresholds & operating constraints (surge, voltage, IP rating)")
    make_in_india_percent: Optional[int] = Field(default=None, description="Make in India (MII) minimum local content percentage requirement")
    qco_mandated: bool = Field(default=False, description="Whether item falls under mandatory Quality Control Order (QCO)")
    nabl_test_required: bool = Field(default=False, description="Whether testing by NABL accredited laboratory is mandated")


class DomainClassificationResult(BaseModel):
    domain: str
    confidence_score: float
    reasoning: str
    secondary_domains: List[str] = Field(default_factory=list)
    sectional_committee: Optional[str] = Field(default=None, description="BIS Sectional Committee e.g. ETD 23, LITD 14, MED 04")
    suggested_hsn: Optional[str] = Field(default=None, description="Suggested 4-digit / 8-digit HSN/SAC code")
    gem_category: Optional[str] = Field(default=None, description="Corresponding Government e-Marketplace (GeM) product category")


class StandardCitation(BaseModel):
    is_number: str
    title: str
    clause_ref: str
    section_type: str
    snippet: str
    score: float = 0.0


class CategorizedStandards(BaseModel):
    primary_standards: List[Dict[str, Any]] = Field(default_factory=list)
    secondary_standards: List[Dict[str, Any]] = Field(default_factory=list)
    safety_standards: List[Dict[str, Any]] = Field(default_factory=list)
    testing_standards: List[Dict[str, Any]] = Field(default_factory=list)
    certification_requirements: List[Dict[str, Any]] = Field(default_factory=list)
    documentation_requirements: List[str] = Field(default_factory=list)


class ConfidenceScoreDetails(BaseModel):
    overall_confidence: str  # High, Medium, Low
    numeric_score: float
    vector_similarity_score: float
    classification_confidence: float
    metadata_match_score: float
    graph_topology_score: float
    scoring_breakdown: Dict[str, float]


class RecommendationItem(BaseModel):
    recommendation_id: str
    is_number: str
    standard_title: str
    clause_reference: str
    category_type: str  # Primary, Secondary, Safety, Testing, CRS, Mandatory QCO
    applicability_reason: str
    evidence_text: str
    source_sections: List[str]
    confidence_score: float
    risk_level: str
    related_standards: List[str] = Field(default_factory=list)
    # Government Procurement Enhancements
    is_qco_mandated: bool = Field(default=False, description="Flagged under mandatory Quality Control Order (QCO)")
    status: str = Field(default="ACTIVE", description="ACTIVE, REVISED, WITHDRAWN, SUPERSEDED")
    supersession_warning: Optional[str] = Field(default=None, description="Warning if cited standard has been superseded by newer edition")
    tender_boq_clause: Optional[str] = Field(default=None, description="Ready-to-use formal BOQ clause for GeM/CPPP tender schedule")
    nabl_testing_schedule: List[str] = Field(default_factory=list, description="Mandatory testing regimen: Type Test, Routine Test, Acceptance Test")


class ComplianceProfileResponse(BaseModel):
    profile_id: str
    procurement_title: str
    product_category: str
    domain: str
    overall_confidence: ConfidenceScoreDetails
    categorized_standards: CategorizedStandards
    recommendations: List[RecommendationItem]
    audit_summary: str
    review_status: str = "PENDING_REVIEW"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # Government Procurement Meta
    sectional_committee: Optional[str] = Field(default=None, description="Governing BIS Sectional Committee")
    suggested_hsn: Optional[str] = Field(default=None, description="Suggested HSN/SAC classification")
    qco_enforced: bool = Field(default=False, description="Whether statutory QCO compliance applies")
    statutory_disclaimer: Optional[str] = Field(default=None, description="Official legal compliance note under BIS Act 2016 and GFR 2017")


class OfficerReviewRequest(BaseModel):
    profile_id: str
    review_status: str  # APPROVED, REJECTED, MODIFIED
    officer_notes: Optional[str] = None
    modified_recommendations: Optional[List[Dict[str, Any]]] = None


class EvaluationRequest(BaseModel):
    test_suite_name: str = "bis_standard_procurement_benchmark_v1"
    run_full_eval: bool = True


class EvaluationMetricSummary(BaseModel):
    total_samples: int
    precision: float
    recall: float
    classification_accuracy: float
    citation_accuracy: float
    hallucination_rate: float
    passed_benchmark: bool
