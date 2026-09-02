import pytest
from app.services.document_intelligence_service import DocumentIntelligencePipeline
from app.services.standards_reference_detector import StandardsReferenceDetector
from app.services.gap_analysis_engine import GapAnalysisEngine
from app.services.compliance_scoring_framework import ComplianceScoringFramework
from app.services.risk_assessment_engine import RiskAssessmentEngine
from app.services.clause_recommendation_engine import ClauseRecommendationEngine
from app.services.tender_comparison_engine import TenderComparisonEngine
from app.services.tender_understanding_service import TenderUnderstandingEngine


def test_document_intelligence_pipeline():
    raw_txt = "TENDER SPECIFICATION: Supply of LED street luminaires referencing IS 10322:1982."
    result = DocumentIntelligencePipeline.process_document("sample_tender.txt", raw_txt.encode("utf-8"))
    
    assert result["filename"] == "sample_tender.txt"
    assert result["char_count"] > 10
    assert len(result["sections"]) >= 1


@pytest.mark.asyncio
async def test_standards_reference_detector():
    text = "Procurement specification referring to outdated IS 10322:1982 and IS 456:1978 standards."
    detector = StandardsReferenceDetector(None)
    detected = await detector.detect_references(text)
    
    assert len(detected) >= 2
    outdated = [s for s in detected if s.status_in_kb == "OUTDATED"]
    assert len(outdated) >= 1
    assert "2012" in outdated[0].recommended_version or "2000" in outdated[0].recommended_version


@pytest.mark.asyncio
async def test_gap_analysis_and_scoring():
    sample_text = "Procurement of LED street lights referencing IS 10322:1982 without CRS certification."
    doc_summary = DocumentIntelligencePipeline.process_document("tender.txt", sample_text.encode("utf-8"))
    understanding = await TenderUnderstandingEngine.analyze_tender(doc_summary)
    
    detector = StandardsReferenceDetector(None)
    detected = await detector.detect_references(sample_text)
    
    gaps = GapAnalysisEngine.analyze_gaps(understanding, detected)
    assert len(gaps) >= 1
    
    score = ComplianceScoringFramework.calculate_score(gaps)
    assert 0.0 <= score.overall_score <= 100.0
    assert score.grade in ["A+", "A", "B", "C", "F"]


def test_risk_and_clause_generation():
    doc_summary = {"raw_text": "Sample LED street light tender text", "filename": "tender.txt"}
    understanding = TenderUnderstandingEngine._fallback_understanding("tender.txt", doc_summary["raw_text"])
    
    clauses = ClauseRecommendationEngine.generate_clauses(understanding)
    assert len(clauses) == 4
    assert "BIS License" in clauses[0].clause_text or "Mandatory" in clauses[0].clause_text
    
    comparison = TenderComparisonEngine.compare_tender(understanding, [])
    assert len(comparison.comparison_matrix) >= 5
