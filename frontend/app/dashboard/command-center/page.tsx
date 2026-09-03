"use client";

import React, { useState, useEffect } from "react";
import { Cpu, ShieldCheck, Activity, Award, Zap, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

export default function ProcurementCommandCenterPage() {
  const [overview, setOverview] = useState<any>(null);
  const [autonomousPackage, setAutonomousPackage] = useState<any>(null);
  const [isRunningReview, setIsRunningReview] = useState(false);

  useEffect(() => {
    api.get("/phase6/command-center/overview")
      .then((res) => setOverview(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleRunAutonomousReview = async () => {
    setIsRunningReview(true);
    try {
      const res = await api.post("/phase6/agent-system/autonomous-review", {
        filename: "LED_Street_Light_Tender.pdf",
        tender_text: "Procurement of LED street luminaires referencing IS 10322:1982 with 10kV surge protection.",
      });
      setAutonomousPackage(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunningReview(false);
    }
  };

  if (!overview) {
    return (
      <div className="p-12 text-center text-[#6f4e37]/70">
        <p>Loading Procurement Command Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#6f4e37]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#3d2b1f] tracking-tight">
              National AI Procurement Command Center
            </h1>
          </div>
          <p className="text-xs text-[#6f4e37]/80 mt-0.5">
            Unified Multi-Agent Decision-Support Ecosystem, Autonomous Tender Review, and Predictive Compliance Intelligence.
          </p>
        </div>
        <Button
          onClick={handleRunAutonomousReview}
          disabled={isRunningReview}
          className="gap-2 self-start md:self-auto"
        >
          {isRunningReview ? <Activity className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Trigger 9-Agent Autonomous Review
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="border-l-4 border-l-[#295030]">
          <CardContent className="p-4">
            <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">National Avg PQI</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#295030] mt-1 font-mono">{overview.national_avg_pqi}/100</p>
            <p className="text-[11px] text-[#295030] mt-0.5 font-medium">Grade A Procurement Quality</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#6f4e37]">
          <CardContent className="p-4">
            <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Active Multi-Agent Tasks</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#6f4e37] mt-1 font-mono">{overview.active_multi_agent_tasks}</p>
            <p className="text-[11px] text-[#6f4e37]/80 mt-0.5 font-medium">9 Agents Operating</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#c4a484]">
          <CardContent className="p-4">
            <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">AIOps Precision</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#3d2b1f] mt-1 font-mono">{Math.round(overview.aiops_precision * 100)}%</p>
            <p className="text-[11px] text-[#295030] mt-0.5 font-semibold">Zero Hallucination Rate</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#822424]">
          <CardContent className="p-4">
            <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Flagged Risk Tenders</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#822424] mt-1 font-mono">{overview.high_risk_tenders_flagged}</p>
            <p className="text-[11px] text-[#822424] mt-0.5 font-medium">Action Required</p>
          </CardContent>
        </Card>
      </div>

      {/* Autonomous Multi-Agent Execution Results */}
      {autonomousPackage && (
        <Card>
          <CardHeader className="border-b border-[#c4a484]/30 pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Zap className="h-4.5 w-4.5 text-[#6f4e37]" />
              9-Agent Multi-Agent Autonomous Review Execution
            </CardTitle>
            <CardDescription className="text-xs">
              Autonomous review package generated for '{autonomousPackage.tender_title}'
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="p-3.5 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#6f4e37] uppercase font-mono">
                  Review ID: {autonomousPackage.review_id}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#3d2b1f] mt-0.5">
                  {autonomousPackage.review_summary}
                </p>
              </div>
              <Badge variant="success" className="px-2.5 py-1 text-xs font-mono">
                PQI {autonomousPackage.overall_pqi_score}/100
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {autonomousPackage.agent_logs.map((agent: any, idx: number) => (
                <div key={idx} className="p-3 rounded-md bg-[#ebe5d8] border border-[#c4a484]/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#6f4e37]">{agent.agent_name}</span>
                    <Badge variant="success" className="text-[9px] py-0">
                      {agent.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#3d2b1f]/85 leading-normal">{agent.output_summary}</p>
                  <span className="text-[10px] text-[#6f4e37]/75 font-mono block pt-0.5">{agent.execution_time_ms}ms</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Procurement Roadmap Overview */}
      <Card>
        <CardHeader className="border-b border-[#c4a484]/30 pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-[#6f4e37]" />
            National AI Procurement Strategic Roadmap (1-Year / 3-Year / 5-Year)
          </CardTitle>
          <CardDescription className="text-xs">
            Multi-phase roadmap for national government compliance automation and procurement transformation.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            <div className="p-4 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 space-y-1.5">
              <Badge variant="info" className="text-[10px]">YEAR 1 (CURRENT)</Badge>
              <h4 className="font-bold text-[#3d2b1f] text-xs sm:text-sm">Multi-Agent Intelligence & GeM Sync</h4>
              <p className="text-[#3d2b1f]/80 leading-relaxed text-[11px]">
                Autonomous 9-agent tender review, PQI scoring, BIS Gazette amendment tracking, and GeM/CPPP portal integration adapters.
              </p>
            </div>

            <div className="p-4 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 space-y-1.5">
              <Badge variant="warning" className="text-[10px]">YEAR 3 (MEDIUM-TERM)</Badge>
              <h4 className="font-bold text-[#3d2b1f] text-xs sm:text-sm">Predictive Vendor Risk & ISO Mapping</h4>
              <p className="text-[#3d2b1f]/80 leading-relaxed text-[11px]">
                ML-driven supplier risk forecasting, ISO-to-BIS cross-reference mapping, mobile applications, and API Marketplace.
              </p>
            </div>

            <div className="p-4 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 space-y-1.5">
              <Badge variant="success" className="text-[10px]">YEAR 5 (VISION)</Badge>
              <h4 className="font-bold text-[#3d2b1f] text-xs sm:text-sm">National Autonomous Procurement Network</h4>
              <p className="text-[#3d2b1f]/80 leading-relaxed text-[11px]">
                Nationwide autonomous compliance monitoring, predictive public budget allocation, and self-healing tender specifications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
