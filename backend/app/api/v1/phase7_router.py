import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.schemas.phase7_schemas import (
    DataFabricCatalogItem,
    DigitalTwinSimulationState,
    NationalKnowledgeGraphNode,
    CommandCenterMultiViewData,
    PolicyImpactSimulationResult,
    MarketplacePlugin,
    TenYearRoadmap
)
from app.services.data_fabric_service import DataFabricService
from app.services.procurement_digital_twin_service import ProcurementDigitalTwinService
from app.services.national_knowledge_graph_service import NationalKnowledgeGraphService
from app.services.national_command_center_service import NationalCommandCenterService
from app.services.policy_intelligence_simulation_service import PolicyIntelligenceSimulationService
from app.services.procurement_marketplace_service import ProcurementMarketplaceService
from app.services.zero_trust_security_service import ZeroTrustSecurityService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/phase7", tags=["Phase 7 National Procurement OS"])


class PolicySimulationInput(BaseModel):
    policy_title: str = Field(..., example="Mandatory Class II Electrical Insulation for All Municipal Outdoor Luminaires")


@router.get("/data-fabric/catalog", response_model=List[DataFabricCatalogItem])
async def get_data_fabric_catalog():
    """Returns National Procurement Data Fabric catalog and metadata lineage."""
    return DataFabricService.get_catalog()


@router.post("/digital-twin/simulate", response_model=DigitalTwinSimulationState)
async def simulate_digital_twin(scenario: str = "National BIS Mandate Enforcement"):
    """Runs Procurement Digital Twin simulation across organizations, suppliers, and spend flows."""
    return ProcurementDigitalTwinService.run_simulation(scenario)


@router.get("/knowledge-graph/nodes", response_model=List[NationalKnowledgeGraphNode])
async def get_knowledge_graph_nodes():
    """Queries the National Procurement Knowledge Graph 2.0 (8 Node Types)."""
    return NationalKnowledgeGraphService.get_nodes()


@router.get("/command-center/view", response_model=CommandCenterMultiViewData)
async def get_command_center_view(view_type: str = "NATIONAL"):
    """Fetches Strategic Command Center data for specified view (MINISTRY, STATE, NATIONAL, REGULATOR)."""
    return NationalCommandCenterService.get_command_view(view_type)


@router.post("/policy/simulate", response_model=PolicyImpactSimulationResult)
async def simulate_policy_impact(input_data: PolicySimulationInput):
    """Simulates proposed policy, standards, and certification changes to forecast market impact."""
    return PolicyIntelligenceSimulationService.simulate_policy(input_data.policy_title)


@router.get("/marketplace/plugins", response_model=List[MarketplacePlugin])
async def get_marketplace_plugins():
    """Lists registered developer API marketplace extensions and compliance plugins."""
    return ProcurementMarketplaceService.get_plugins()


@router.get("/roadmap", response_model=TenYearRoadmap)
async def get_ten_year_roadmap():
    """Fetches National Procurement Operating System 10-Year Strategic Evolution Roadmap."""
    return ZeroTrustSecurityService.get_ten_year_roadmap()
