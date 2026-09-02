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


class DomainClassificationResult(BaseModel):
    domain: str
    confidence_score: float
    reasoning: str
    secondary_domains: List[str] = Field(default_factory=list)


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
    category_type: str  # Primary, Secondary, Safety, Testing, CRS
    applicability_reason: str
    evidence_text: str
    source_sections: List[str]
    confidence_score: float
    risk_level: str
    related_standards: List[str] = Field(default_factory=list)


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
