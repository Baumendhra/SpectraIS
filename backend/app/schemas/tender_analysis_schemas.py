from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    file_type: str
    page_count: int
    char_count: int
    extracted_sections_count: int
    status: str


class DetectedStandardRef(BaseModel):
    is_number: str
    title: Optional[str] = None
    status_in_kb: str  # VALID, OUTDATED, WITHDRAWN, UNKNOWN
    recommended_version: Optional[str] = None
    context_snippet: str
    is_mandatory: bool = True


class TenderUnderstandingProfile(BaseModel):
    title: str
    department: str
    product_category: str
    domain: str
    scope_of_work: str
    technical_requirements: List[str] = Field(default_factory=list)
    compliance_requirements: List[str] = Field(default_factory=list)
    certification_requirements: List[str] = Field(default_factory=list)
    testing_requirements: List[str] = Field(default_factory=list)


class GapAnalysisItem(BaseModel):
    gap_id: str
    category: str  # Standard, Certification, Testing, Safety, Documentation
    description: str
    impact: str
    severity: str  # Critical, High, Medium, Low
    missing_requirement: str
    recommended_clause: str


class ComplianceScoreBreakdown(BaseModel):
    overall_score: float  # 0 to 100
    grade: str  # A+, A, B, C, F
    standards_score: float  # 30%
    certification_score: float  # 25%
    testing_score: float  # 20%
    safety_score: float  # 15%
    documentation_score: float  # 10%
    explainability: str


class RiskAssessmentItem(BaseModel):
    risk_id: str
    category: str  # Legal, Quality, Certification, Testing, Procurement
    title: str
    description: str
    severity: str  # Critical, High, Medium, Low
    mitigation_strategy: str


class ClauseRecommendation(BaseModel):
    clause_id: str
    clause_title: str
    clause_category: str  # BIS Certification, NABL Testing, Safety, Inspection
    clause_text: str
    rationale: str
    is_editable: bool = True


class ComparisonRow(BaseModel):
    parameter: str
    tender_specification: str
    ideal_bis_standard: str
    compliance_status: str  # COMPLIANT, NON_COMPLIANT, PARTIAL, MISSING
    risk_indicator: str  # LOW, MEDIUM, HIGH, CRITICAL


class TenderComparisonResult(BaseModel):
    tender_title: str
    product_category: str
    domain: str
    comparison_matrix: List[ComparisonRow]
    overall_gap_count: int


class TenderAnalysisSummary(BaseModel):
    tender_id: str
    reference_number: str
    title: str
    department: str
    status: str
    overall_score: ComplianceScoreBreakdown
    understanding: TenderUnderstandingProfile
    detected_standards: List[DetectedStandardRef]
    gaps: List[GapAnalysisItem]
    risks: List[RiskAssessmentItem]
    recommended_clauses: List[ClauseRecommendation]
    comparison: TenderComparisonResult
    report_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
