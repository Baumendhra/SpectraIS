import pytest
from app.schemas.phase6_schemas import FeedbackSubmission
from app.services.multi_agent_orchestrator import MultiAgentOrchestrator
from app.services.autonomous_tender_review_agent import AutonomousTenderReviewAgent
from app.services.procurement_quality_index_service import ProcurementQualityIndexService
from app.services.predictive_compliance_engine import PredictiveComplianceEngine
from app.services.supplier_intelligence_service import SupplierIntelligenceService
from app.services.tender_improvement_ai_service import TenderImprovementAIService
from app.services.feedback_learning_service import FeedbackLearningService


@pytest.mark.asyncio
async def test_multi_agent_orchestrator():
    text = "Procurement of LED street luminaires referencing IS 10322:1982 with IP66 ingress protection."
    agent_logs = await MultiAgentOrchestrator.execute_multi_agent_pipeline(text)
    
    assert len(agent_logs) == 9
    assert agent_logs[0].agent_name == "Procurement Understanding Agent"
    assert agent_logs[8].agent_name == "Report Generation Agent"
    assert all(log.status == "SUCCESS" for log in agent_logs)


def test_procurement_quality_index():
    pqi = ProcurementQualityIndexService.calculate_pqi(
        spec_completeness=95.0,
        standards_coverage=90.0,
        cert_coverage=85.0,
        testing_coverage=80.0,
        safety_coverage=90.0
    )
    assert pqi.pqi_score >= 85.0
    assert pqi.grade in ["A+", "A"]
    assert "benchmark" in pqi.benchmark_comparison.lower()


def test_predictive_compliance_and_supplier_intelligence():
    pred = PredictiveComplianceEngine.predict_revisions("IS 10322 : Part 5 / Sec 1 : 2012")
    assert pred.revision_probability > 0.5
    assert len(pred.predicted_changes) >= 2
    
    supplier = SupplierIntelligenceService.get_supplier_profile("SUP-88910")
    assert supplier.license_status == "VALID"
    assert supplier.compliance_score > 90.0


def test_tender_improvement_and_feedback():
    opt = TenderImprovementAIService.optimize_tender(
        "Procurement of LED Street Lights",
        ["120W Luminaire", "Surge Protection Included"]
    )
    assert len(opt.improved_specifications) > 2
    assert opt.added_clauses_count == 3
    
    feedback = FeedbackSubmission(
        recommendation_id="REC-9912",
        officer_action="APPROVED",
        feedback_notes="Approved mandatory BIS CRS clause insertion."
    )
    feedback_res = FeedbackLearningService.record_feedback(feedback)
    assert feedback_res["status"] == "RECORDED"
    assert feedback_res["learning_loop_updated"] is True
