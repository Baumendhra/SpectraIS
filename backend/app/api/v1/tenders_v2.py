import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.schemas.tender_analysis_schemas import TenderAnalysisSummary
from app.services.tender_analysis_pipeline_service import TenderAnalysisPipelineService
from app.services.compliance_report_generator import ComplianceReportGenerator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tenders-v2", tags=["Tender Analysis & Compliance Intelligence"])


class RawTenderTextInput(BaseModel):
    filename: str = "tender_spec.txt"
    tender_text: str = Field(..., example="Procurement of LED street lights for municipal highway lighting with 10kV surge protection.")


@router.post("/upload-and-analyze", response_model=TenderAnalysisSummary)
async def upload_and_analyze_tender(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Uploads a tender document (PDF, DOCX, TXT) and runs the end-to-end Compliance Analysis Pipeline."""
    try:
        content = await file.read()
        pipeline = TenderAnalysisPipelineService(db)
        return await pipeline.analyze_tender_document(file.filename, content)
    except Exception as e:
        logger.error(f"Failed to analyze uploaded tender document: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/analyze-text", response_model=TenderAnalysisSummary)
async def analyze_tender_text(
    input_data: RawTenderTextInput,
    db: AsyncSession = Depends(get_db)
):
    """Analyzes raw tender text and outputs a complete compliance score, gap analysis, and risk assessment."""
    try:
        pipeline = TenderAnalysisPipelineService(db)
        return await pipeline.analyze_tender_document(input_data.filename, input_data.tender_text.encode("utf-8"))
    except Exception as e:
        logger.error(f"Failed to analyze tender text: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/report/html", response_class=HTMLResponse)
async def generate_report_html(analysis: TenderAnalysisSummary):
    """Generates a publication-ready HTML compliance report for PDF conversion or printing."""
    try:
        return ComplianceReportGenerator.generate_html_report(analysis)
    except Exception as e:
        logger.error(f"Failed to generate HTML report: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
