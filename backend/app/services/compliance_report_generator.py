import logging
from typing import Dict, Any
from app.schemas.tender_analysis_schemas import TenderAnalysisSummary

logger = logging.getLogger(__name__)


class ComplianceReportGenerator:
    """Generates publication-ready HTML/PDF and structured JSON compliance reports for government audit."""

    @staticmethod
    def generate_html_report(analysis: TenderAnalysisSummary) -> str:
        score = analysis.overall_score
        gaps_html = "".join([
            f"<tr><td style='padding:8px;border:1px solid #334155;color:#f8fafc;'><b>{g.category}</b></td>"
            f"<td style='padding:8px;border:1px solid #334155;color:#94a3b8;'>{g.description}</td>"
            f"<td style='padding:8px;border:1px solid #334155;color:#f43f5e;'><b>{g.severity}</b></td>"
            f"<td style='padding:8px;border:1px solid #334155;color:#38bdf8;'>{g.recommended_clause}</td></tr>"
            for g in analysis.gaps
        ])

        clauses_html = "".join([
            f"<div style='background:#0f172a;border:1px solid #1e293b;padding:12px;margin-bottom:12px;border-radius:8px;'>"
            f"<h4 style='color:#38bdf8;margin:0 0 4px 0;'>{c.clause_title} ({c.clause_category})</h4>"
            f"<p style='color:#e2e8f0;font-family:monospace;font-size:12px;margin:0 0 4px 0;'>{c.clause_text}</p>"
            f"<p style='color:#94a3b8;font-size:11px;margin:0;'><b>Rationale:</b> {c.rationale}</p></div>"
            for c in analysis.recommended_clauses
        ])

        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SpectraIS Tender Compliance Audit Report - {analysis.reference_number}</title>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #020617; color: #f8fafc; padding: 24px; line-height: 1.5; }}
        .header {{ border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }}
        .score-box {{ background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; text-align: center; width: 200px; }}
        .score-val {{ font-size: 42px; font-weight: 900; color: #38bdf8; margin: 0; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1 style="color:#ffffff;margin:0;">SpectraIS Government Procurement Compliance Audit Report</h1>
        <p style="color:#94a3b8;margin:4px 0 0 0;">Tender Ref: {analysis.reference_number} | Department: {analysis.department}</p>
    </div>

    <div style="display:flex;gap:24px;margin-bottom:24px;">
        <div class="score-box">
            <p style="color:#94a3b8;font-size:12px;margin:0;text-transform:uppercase;">Compliance Score</p>
            <p class="score-val">{score.overall_score}</p>
            <p style="color:#34d399;font-weight:bold;margin:4px 0 0 0;">Grade {score.grade}</p>
        </div>
        <div style="flex:1;background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px;">
            <h3 style="color:#38bdf8;margin:0 0 8px 0;">Executive Summary</h3>
            <p style="color:#cbd5e1;font-size:13px;margin:0;">{score.explainability}</p>
        </div>
    </div>

    <h2 style="color:#ffffff;border-bottom:1px solid #1e293b;padding-bottom:8px;">1. Identified Compliance Gaps ({len(analysis.gaps)})</h2>
    <table>
        <thead>
            <tr style="background:#1e293b;color:#f8fafc;text-align:left;">
                <th style="padding:8px;">Category</th>
                <th style="padding:8px;">Gap Description</th>
                <th style="padding:8px;">Severity</th>
                <th style="padding:8px;">Recommended Action</th>
            </tr>
        </thead>
        <tbody>
            {gaps_html}
        </tbody>
    </table>

    <h2 style="color:#ffffff;border-bottom:1px solid #1e293b;padding-bottom:8px;margin-top:32px;">2. Ready-to-Use Procurement Clauses</h2>
    {clauses_html}

    <div style="margin-top:40px;border-top:1px solid #1e293b;padding-top:16px;color:#64748b;font-size:11px;text-align:center;">
        Generated automatically by SpectraIS Compliance Intelligence Engine v2.0 under Bureau of Indian Standards (BIS) Guidelines.
    </div>
</body>
</html>"""
        return html_content
