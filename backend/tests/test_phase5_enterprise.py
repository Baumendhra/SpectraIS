import pytest
from app.schemas.phase5_schemas import BISAmendmentUpdate, SubscriptionPreference, AuditExportRequest
from app.services.gov_integration_framework import GovernmentIntegrationFramework
from app.services.bis_amendment_intelligence_service import BISAmendmentIntelligenceService
from app.services.amendment_impact_analysis_engine import AmendmentImpactAnalysisEngine
from app.services.subscription_alert_service import SubscriptionAlertService
from app.services.enterprise_analytics_service import EnterpriseAnalyticsService
from app.services.rti_audit_governance_service import RTIAuditGovernanceService
from app.services.security_hardening_service import SecurityHardeningService
from app.services.aiops_monitoring_service import AIOpsMonitoringService


def test_gov_integration_adapters():
    adapters = GovernmentIntegrationFramework.get_registered_adapters()
    assert len(adapters) >= 5
    gem_adapter = [a for a in adapters if a.system_name == "GeM"][0]
    assert gem_adapter.rate_limit_per_min == 300


@pytest.mark.asyncio
async def test_gov_portal_sync():
    result = await GovernmentIntegrationFramework.sync_portal("GeM")
    assert result["status"] == "SUCCESS"
    assert result["system_name"] == "GeM"


@pytest.mark.asyncio
async def test_bis_amendment_and_impact_engine():
    notice = BISAmendmentUpdate(
        notice_id="GAZ-2026-1049",
        is_number="IS 10322 : Part 5 / Sec 1 : 2012",
        amendment_number=3,
        release_date="2026-08-15",
        title="Luminaires for Street Lighting - Amendment 3 Mandatory Protection",
        summary_of_changes="Mandating thermal cutoff protection and 10kV surge withstand capability.",
        affected_domains=["Electrical", "Infrastructure"]
    )
    
    ingest_result = await BISAmendmentIntelligenceService.process_amendment_notice(notice)
    assert ingest_result["status"] == "PROCESSED"
    
    impact = AmendmentImpactAnalysisEngine.analyze_impact(notice)
    assert impact.is_number == "IS 10322 : Part 5 / Sec 1 : 2012"
    assert impact.risk_level in ["CRITICAL", "HIGH", "MEDIUM"]
    assert impact.affected_tenders_count >= 1


def test_enterprise_analytics_and_rti_audit():
    analytics = EnterpriseAnalyticsService.get_executive_summary()
    assert analytics.total_tenders_analyzed > 1000
    assert analytics.average_compliance_score > 70.0
    assert len(analytics.top_compliance_gaps) >= 3
    
    audit_req = AuditExportRequest(reason="Right to Information Act Section 6(1) compliance review", case_reference="RTI-2026-9912")
    rti_package = RTIAuditGovernanceService.export_rti_package(audit_req)
    assert rti_package["status"] == "SUCCESS"
    assert len(rti_package["checksum_sha256"]) == 64


def test_security_and_aiops():
    sec_status = SecurityHardeningService.get_security_status()
    assert sec_status["oauth_sso_status"] == "ACTIVE_MFA_ENFORCED"
    
    aiops = AIOpsMonitoringService.run_health_benchmark()
    assert aiops.retrieval_precision >= 0.85
    assert aiops.hallucination_rate == 0.0
    assert aiops.system_health == "OPTIMAL"
