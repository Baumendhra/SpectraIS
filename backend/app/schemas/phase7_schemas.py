from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class DataFabricCatalogItem(BaseModel):
    source_system: str  # GeM, CPPP, State_eProc, BIS, MCA, Udyam
    records_count: int
    data_lineage: str
    last_sync_timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str  # FEDERATED_ACTIVE


class DigitalTwinSimulationState(BaseModel):
    simulation_id: str
    active_entities_modeled: Dict[str, int]
    simulated_annual_spend_inr_crores: float
    simulated_compliance_index: float
    simulation_status: str


class NationalKnowledgeGraphNode(BaseModel):
    node_id: str
    node_type: str  # Standard, Product, Supplier, Organization, Tender, Certification, Amendment, Risk
    name: str
    connected_edges_count: int
    properties: Dict[str, Any]


class NationalRiskAlert(BaseModel):
    alert_id: str
    alert_type: str  # QCO_VIOLATION, OUTDATED_STANDARD_SPIKE, CERTIFICATE_FORGERY_RISK
    target_entity: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    mitigation_action: str


class CommandCenterMultiViewData(BaseModel):
    view_type: str  # MINISTRY, STATE, NATIONAL, REGULATOR
    title: str
    compliance_health_score: float
    active_tenders_monitored: int
    high_risk_alerts_count: int
    top_performing_entities: List[Dict[str, Any]]
    regional_heatmap_data: Dict[str, float]


class PolicyImpactSimulationResult(BaseModel):
    policy_id: str
    policy_title: str
    affected_industries: List[str]
    forecasted_pqi_change: float
    forecasted_cost_impact_pct: float
    readiness_assessment: str


class MarketplacePlugin(BaseModel):
    plugin_id: str
    name: str
    category: str  # Compliance, Analytics, Verification, Integration
    provider: str
    version: str
    rating: float
    is_installed: bool = True


class TenYearRoadmap(BaseModel):
    year_1_milestone: str
    year_3_milestone: str
    year_5_milestone: str
    year_10_vision: str
