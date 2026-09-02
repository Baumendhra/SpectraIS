import pytest
from app.services.data_fabric_service import DataFabricService
from app.services.procurement_digital_twin_service import ProcurementDigitalTwinService
from app.services.national_knowledge_graph_service import NationalKnowledgeGraphService
from app.services.national_command_center_service import NationalCommandCenterService
from app.services.policy_intelligence_simulation_service import PolicyIntelligenceSimulationService
from app.services.procurement_marketplace_service import ProcurementMarketplaceService
from app.services.zero_trust_security_service import ZeroTrustSecurityService


def test_data_fabric_and_digital_twin():
    catalog = DataFabricService.get_catalog()
    assert len(catalog) >= 5
    gem_item = [item for item in catalog if "GeM" in item.source_system][0]
    assert gem_item.records_count > 10000000

    sim = ProcurementDigitalTwinService.run_simulation("Test Scenario")
    assert sim.simulation_status == "SIMULATION_COMPLETED"
    assert sim.simulated_annual_spend_inr_crores > 100000.0


def test_national_knowledge_graph_and_command_center():
    nodes = NationalKnowledgeGraphService.get_nodes()
    assert len(nodes) >= 6
    types = set(n.node_type for n in nodes)
    assert "Standard" in types and "Supplier" in types and "Tender" in types

    nat_view = NationalCommandCenterService.get_command_view("NATIONAL")
    assert nat_view.view_type == "NATIONAL"
    assert nat_view.compliance_health_score > 80.0

    state_view = NationalCommandCenterService.get_command_view("STATE")
    assert state_view.view_type == "STATE"
    assert len(state_view.regional_heatmap_data) >= 4


def test_policy_simulation_marketplace_and_roadmap():
    pol_sim = PolicyIntelligenceSimulationService.simulate_policy("Mandatory Surge Protection")
    assert pol_sim.forecasted_pqi_change > 0
    assert "HIGH_READINESS" in pol_sim.readiness_assessment

    plugins = ProcurementMarketplaceService.get_plugins()
    assert len(plugins) >= 3

    roadmap = ZeroTrustSecurityService.get_ten_year_roadmap()
    assert "Phase 1-6" in roadmap.year_1_milestone
    assert "10" in roadmap.year_10_vision or "Global" in roadmap.year_10_vision
