"use client";

import React, { useState, useEffect } from "react";
import { Cpu, ShieldCheck, Activity, Award, Network, Zap, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
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
      <div className="p-12 text-center text-slate-400">
        <p>Loading Procurement Command Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="h-6 w-6 text-blue-400" />
            National AI Procurement Command Center
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Unified Multi-Agent Decision-Support Ecosystem, Autonomous Tender Review, and Predictive Compliance Intelligence.
          </p>
        </div>
        <Button onClick={handleRunAutonomousReview} disabled={isRunningReview} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
          {isRunningReview ? <Activity className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Trigger 9-Agent Autonomous Review
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel border-slate-800">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">National Avg PQI</span>
            <p className="text-3xl font-black text-emerald-400 mt-1">{overview.national_avg_pqi}/100</p>
            <p className="text-[11px] text-slate-400 mt-1">Grade A Procurement Quality</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-slate-800">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Multi-Agent Tasks</span>
            <p className="text-3xl font-black text-blue-400 mt-1">{overview.active_multi_agent_tasks}</p>
            <p className="text-[11px] text-blue-400 mt-1">9 Agents Operating</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-slate-800">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">AIOps Precision</span>
            <p className="text-3xl font-black text-indigo-400 mt-1">{Math.round(overview.aiops_precision * 100)}%</p>
            <p className="text-[11px] text-emerald-400 mt-1 font-semibold">Zero Hallucination Rate</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-slate-800">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">Flagged Risk Tenders</span>
            <p className="text-3xl font-black text-rose-400 mt-1">{overview.high_risk_tenders_flagged}</p>
            <p className="text-[11px] text-slate-400 mt-1">Action Required</p>
          </CardContent>
        </Card>
      </div>

      {/* Autonomous Multi-Agent Execution Results */}
      {autonomousPackage && (
        <Card className="glass-panel border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              9-Agent Multi-Agent Autonomous Review Execution
            </CardTitle>
            <CardDescription className="text-xs">
              Autonomous review package generated for '{autonomousPackage.tender_title}'
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Review ID: {autonomousPackage.review_id}</span>
                <p className="text-sm font-bold text-white mt-0.5">{autonomousPackage.review_summary}</p>
              </div>
              <Badge variant="success" className="px-3 py-1 text-xs">
                PQI {autonomousPackage.overall_pqi_score}/100
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {autonomousPackage.agent_logs.map((agent: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-400">{agent.agent_name}</span>
                    <Badge variant="success" className="text-[9px]">
                      {agent.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">{agent.output_summary}</p>
                  <span className="text-[10px] text-slate-500 font-mono">{agent.execution_time_ms}ms</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Procurement Roadmap Overview */}
      <Card className="glass-panel border-slate-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-400" />
            National AI Procurement Strategic Roadmap (1-Year / 3-Year / 5-Year)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <Badge variant="info" className="text-[10px]">YEAR 1 (CURRENT)</Badge>
              <h4 className="font-bold text-white text-sm">Multi-Agent Intelligence & GeM Sync</h4>
              <p className="text-slate-400 leading-relaxed">
                Autonomous 9-agent tender review, PQI scoring, BIS Gazette amendment tracking, and GeM/CPPP portal integration adapters.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <Badge variant="warning" className="text-[10px]">YEAR 3 (MEDIUM-TERM)</Badge>
              <h4 className="font-bold text-white text-sm">Predictive Vendor Risk & ISO Mapping</h4>
              <p className="text-slate-400 leading-relaxed">
                ML-driven supplier risk forecasting, ISO-to-BIS cross-reference mapping, mobile applications, and API Marketplace.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <Badge variant="success" className="text-[10px]">YEAR 5 (VISION)</Badge>
              <h4 className="font-bold text-white text-sm">National Autonomous Procurement Network</h4>
              <p className="text-slate-400 leading-relaxed">
                Nationwide autonomous compliance monitoring, predictive public budget allocation, and self-healing tender specifications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
