from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class GovAdapterConfig(BaseModel):
    system_name: str  # GeM, CPPP, NIC_eProcurement, BIS_Portal, MCA, Udyam
    api_endpoint: str
    auth_type: str  # OAuth2, APIKey, mTLS
    is_active: bool = True
    rate_limit_per_min: int = 120


class BISAmendmentUpdate(BaseModel):
    notice_id: str
    is_number: str
    amendment_number: int
    release_date: str
    title: str
    summary_of_changes: str
    supersedes_version: Optional[str] = None
    affected_domains: List[str] = Field(default_factory=list)


class ImpactAnalysisResult(BaseModel):
    impact_id: str
    amendment_notice_id: str
    is_number: str
    affected_profiles_count: int
    affected_tenders_count: int
    risk_level: str  # CRITICAL, HIGH, MEDIUM, LOW
    recommended_action: str
    affected_tender_ids: List[str] = Field(default_factory=list)


class SubscriptionPreference(BaseModel):
    user_id: str
    subscribed_domains: List[str] = Field(default_factory=list)
    subscribed_is_numbers: List[str] = Field(default_factory=list)
    email_alerts: bool = True
    in_app_alerts: bool = True
    frequency: str = "REALTIME"  # REALTIME, DAILY_DIGEST, WEEKLY_DIGEST


class EnterpriseAnalyticsSummary(BaseModel):
    total_organizations: int
    total_tenders_analyzed: int
    average_compliance_score: float
    top_compliance_gaps: List[Dict[str, Any]]
    department_performance: List[Dict[str, Any]]
    ai_recommendation_acceptance_rate: float
    standards_adoption_metrics: Dict[str, int]


class AuditExportRequest(BaseModel):
    reason: str
    case_reference: Optional[str] = None
    include_raw_logs: bool = True


class AIOpsBenchmarkResult(BaseModel):
    evaluation_time: datetime = Field(default_factory=datetime.utcnow)
    retrieval_precision: float
    retrieval_recall: float
    hallucination_rate: float
    p95_latency_ms: float
    total_queries_evaluated: int
    system_health: str


class DeploymentStatus(BaseModel):
    environment: str = "Production-Government-Cloud"
    k8s_cluster: str = "spectrais-gov-cluster-01"
    active_nodes: int = 6
    hpa_min_replicas: int = 3
    hpa_max_replicas: int = 30
    uptime_percentage: float = 99.98
