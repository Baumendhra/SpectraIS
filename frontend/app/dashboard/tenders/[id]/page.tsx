"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Layers,
  ShieldCheck,
  Printer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { ComplianceGauge } from "@/components/tenders/ComplianceGauge";
import { RiskMatrix } from "@/components/tenders/RiskMatrix";
import { SideBySideComparison } from "@/components/tenders/SideBySideComparison";
import { ClauseViewer } from "@/components/tenders/ClauseViewer";

export default function TenderAnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenderId = params?.id as string;

  const [analysis, setAnalysis] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    // Read from sessionStorage or API
    const cached = sessionStorage.getItem(`tender_analysis_${tenderId}`);
    if (cached) {
      setAnalysis(JSON.parse(cached));
    } else {
      // Fallback analysis data for direct navigation
      api.post("/tenders-v2/analyze-text", {
        filename: "LED_Street_Light_Tender.pdf",
        tender_text: "Procurement of LED street lights for municipal highway lighting with 10kV surge protection referencing IS 10322:1982.",
      })
        .then((res) => setAnalysis(res.data))
        .catch((err) => console.error(err));
    }
  }, [tenderId]);

  const handleDownloadHtmlReport = async () => {
    if (!analysis) return;
    setIsGeneratingReport(true);
    try {
      const res = await api.post("/tenders-v2/report/html", analysis, {
        headers: { "Content-Type": "application/json" },
      });
      const htmlStr = res.data;
      const blob = new Blob([htmlStr], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SpectraIS_Compliance_Report_${analysis.reference_number}.html`;
      a.click();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (!analysis) {
    return (
      <div className="p-12 text-center text-[#6f4e37]/70">
        <p>Loading Tender Compliance Analysis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card">
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/tenders")}
              className="text-[#6f4e37] hover:text-[#3d2b1f] p-0 h-auto"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-base sm:text-xl font-bold text-[#3d2b1f] tracking-tight">{analysis.title}</h1>
          </div>
          <p className="text-[#6f4e37]/80 text-xs mt-1">
            Ref: <span className="font-mono text-[#6f4e37] font-semibold">{analysis.reference_number}</span> • Department: {analysis.department}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadHtmlReport}
            disabled={isGeneratingReport}
            className="gap-2 border-[#c4a484] hover:bg-[#dfd5c3] text-[#3d2b1f]"
          >
            <Printer className="h-4 w-4 text-[#6f4e37]" />
            Export Compliance Report
          </Button>
        </div>
      </div>

      {/* Compliance Score Gauge */}
      <ComplianceGauge
        score={analysis.overall_score?.overall_score || 0}
        grade={analysis.overall_score?.grade || "N/A"}
        explainability={analysis.overall_score?.explainability || ""}
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Product Category</span>
          <p className="text-xs sm:text-sm font-bold text-[#3d2b1f] mt-1">{analysis.understanding?.product_category}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Domain Classification</span>
          <p className="text-xs sm:text-sm font-bold text-[#6f4e37] mt-1">{analysis.understanding?.domain}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Total Compliance Gaps</span>
          <p className="text-xs sm:text-sm font-bold text-[#822424] mt-1 font-mono">
            {analysis.gaps?.length || 0} Gaps Identified
          </p>
        </Card>
      </div>

      {/* Risk Assessment Matrix */}
      <RiskMatrix risks={analysis.risks} />

      {/* Side-by-Side Comparison Matrix */}
      <SideBySideComparison matrix={analysis.comparison?.comparison_matrix || []} />

      {/* Ready-to-Use Procurement Clauses */}
      <ClauseViewer clauses={analysis.recommended_clauses || []} />
    </div>
  );
}
