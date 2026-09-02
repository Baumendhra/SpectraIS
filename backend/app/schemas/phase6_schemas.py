from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class AgentExecutionLog(BaseModel):
    agent_name: str
    role: str
    status: str  # SUCCESS, WARNING, RUNNING
    output_summary: str
    execution_time_ms: float


class MultiAgentReviewPackage(BaseModel):
    review_id: str
    tender_title: str
    product_category: str
    domain: str
    agent_logs: List[AgentExecutionLog]
    overall_pqi_score: float
    gaps_count: int
    risks_count: int
    suggested_improvements_count: int
    review_summary: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DecisionSupportMetrics(BaseModel):
    procurement_readiness_score: float  # 0-100
    specification_quality_score: float  # 0-100
    vendor_qualification_index: float  # 0-100
    certification_coverage_pct: float
    risk_exposure_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    verdict: str


class PredictiveComplianceResult(BaseModel):
    is_number: str
    predicted_revision_timeframe: str  # e.g., "6-12 Months"
    revision_probability: float  # 0-1
    predicted_changes: List[str]
    impact_level: str


class SupplierProfile(BaseModel):
    supplier_id: str
    company_name: str
    bis_crs_license_number: str
    license_status: str  # VALID, EXPIRED, UNDER_RENEWAL
    compliance_score: float
    risk_score: float
    categories_covered: List[str]
    past_tenders_supplied: int


class ProcurementQualityIndex(BaseModel):
    pqi_score: float  # 0-100
    grade: str  # A+, A, B, C, F
    specification_completeness: float
    standards_coverage: float
    certification_coverage: float
    testing_coverage: float
    safety_coverage: float
    benchmark_comparison: str


class TenderOptimizationResult(BaseModel):
    original_title: str
    improved_title: str
    improved_specifications: List[str]
    added_clauses_count: int
    pqi_score_improvement: float


class FeedbackSubmission(BaseModel):
    recommendation_id: str
    officer_action: str  # APPROVED, REJECTED, MODIFIED
    feedback_notes: Optional[str] = None
    adjusted_weights: Optional[Dict[str, float]] = None


class CommandCenterOverview(BaseModel):
    system_status: str
    active_multi_agent_tasks: int
    national_avg_pqi: float
    high_risk_tenders_flagged: int
    active_amendment_notices: int
    aiops_precision: float
    aiops_hallucination_rate: float
