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
      <div className="p-12 text-center text-[#6f4e37]/70">
        <p>Loading Enterprise Procurement Analytics Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#6f4e37]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#3d2b1f] tracking-tight">
              Executive Procurement Intelligence & Compliance Dashboard
            </h1>
          </div>
          <p className="text-xs text-[#6f4e37]/80 mt-0.5">
            Enterprise analytics across departments, standards adoption trends, and AI recommendation acceptance metrics.
          </p>
        </div>
        <Badge variant="success" className="px-2.5 py-1 text-xs font-semibold gap-1 self-start md:self-auto">
          <CheckCircle2 className="h-3.5 w-3.5" /> Live Enterprise Sync Active
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#6f4e37]">
          <CardContent className="p-4">
            <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Total Tenders Analyzed</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#3d2b1f] mt-1 font-mono">{data.total_tenders_analyzed}</p>
            <p className="text-[11px] text-[#295030] mt-0.5 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" /> +18.4% this quarter
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#295030]">
          <CardContent className="p-4">
            <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Avg Enterprise Compliance</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#295030] mt-1 font-mono">{data.average_compliance_score}%</p>
            <p className="text-[11px] text-[#6f4e37]/80 mt-0.5">Target: &ge; 80.0%</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#7d5017]">
          <CardContent className="p-4">
            <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">AI Recommendation Adoption</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#6f4e37] mt-1 font-mono">{data.ai_recommendation_acceptance_rate}%</p>
            <p className="text-[11px] text-[#6f4e37] mt-0.5 font-medium">Officer Approval Rate</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#3d2b1f]">
          <CardContent className="p-4">
            <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Participating Organizations</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#3d2b1f] mt-1 font-mono">{data.total_organizations}</p>
            <p className="text-[11px] text-[#6f4e37]/80 mt-0.5">Government Departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Top Gaps & Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 5 Compliance Gaps */}
        <Card>
          <CardHeader className="border-b border-[#c4a484]/30 pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#7d5017]" />
              Most Frequent Procurement Compliance Gaps
            </CardTitle>
            <CardDescription className="text-xs">
              System-wide analysis of the top compliance deficiencies found across government tender specifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-4">
            {data.top_compliance_gaps.map((gap: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#3d2b1f]">{gap.gap_category}</span>
                  <span className="text-[#7d5017] font-bold font-mono">{gap.frequency_percentage}%</span>
                </div>
                <div className="w-full bg-[#ebe5d8] rounded-full h-2 overflow-hidden border border-[#c4a484]/40">
                  <div
                    className="bg-[#6f4e37] h-2 rounded-full"
                    style={{ width: `${gap.frequency_percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card>
          <CardHeader className="border-b border-[#c4a484]/30 pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#6f4e37]" />
              Departmental Compliance Performance Ranking
            </CardTitle>
            <CardDescription className="text-xs">
              Average compliance scores and tender analysis volume by ministry and municipal division.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-4">
            {data.department_performance.map((dept: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-xs text-[#3d2b1f]">{dept.department}</h4>
                  <p className="text-[11px] text-[#6f4e37]/80">{dept.tenders_count} Tenders Analyzed</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-[#295030] font-mono">{dept.avg_score}%</span>
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
