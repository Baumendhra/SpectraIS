"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, ShieldAlert, Award, Building2, Layers, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

export default function EnterpriseAnalyticsDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/phase5/analytics/executive-summary")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>Loading Enterprise Procurement Analytics Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            Executive Procurement Intelligence & Compliance Dashboard
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Enterprise analytics across departments, standards adoption trends, and AI recommendation acceptance metrics.
          </p>
        </div>
        <Badge variant="success" className="px-3 py-1.5 text-xs font-bold gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> Live Enterprise Sync Active
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel border-slate-800">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Tenders Analyzed</span>
            <p className="text-3xl font-black text-white mt-2">{data.total_tenders_analyzed}</p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" /> +18.4% this quarter
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-slate-800">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase">Avg Enterprise Compliance</span>
            <p className="text-3xl font-black text-emerald-400 mt-2">{data.average_compliance_score}%</p>
            <p className="text-[11px] text-slate-400 mt-1">Target: &ge; 80.0%</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-slate-800">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase">AI Recommendation Adoption</span>
            <p className="text-3xl font-black text-blue-400 mt-2">{data.ai_recommendation_acceptance_rate}%</p>
            <p className="text-[11px] text-blue-400 mt-1 font-medium">Officer Approval Rate</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-slate-800">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase">Participating Organizations</span>
            <p className="text-3xl font-black text-indigo-400 mt-2">{data.total_organizations}</p>
            <p className="text-[11px] text-slate-400 mt-1">Government Departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Top Gaps & Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Compliance Gaps */}
        <Card className="glass-panel border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              Most Frequent Procurement Compliance Gaps
            </CardTitle>
            <CardDescription className="text-xs">
              System-wide analysis of the top compliance deficiencies found across government tender specifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.top_compliance_gaps.map((gap: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-200">{gap.gap_category}</span>
                  <span className="text-amber-400 font-bold">{gap.frequency_percentage}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-rose-500 h-2 rounded-full"
                    style={{ width: `${gap.frequency_percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card className="glass-panel border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-400" />
              Departmental Compliance Performance Ranking
            </CardTitle>
            <CardDescription className="text-xs">
              Average compliance scores and tender analysis volume by ministry and municipal division.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.department_performance.map((dept: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white">{dept.department}</h4>
                  <p className="text-[11px] text-slate-400">{dept.tenders_count} Tenders Analyzed</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-emerald-400">{dept.avg_score}%</span>
                  <Badge variant="success" className="text-[10px]">
                    Grade {dept.grade}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
