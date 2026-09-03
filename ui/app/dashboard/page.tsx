"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpenCheck,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Database
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { Standard } from "@/types";

export default function DashboardOverviewPage() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/standards?size=5")
      .then((res) => {
        setStandards(res.data.data.items || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8">
      {/* Top Banner / Hero */}
      <div className="p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#6f4e37]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#3d2b1f] tracking-tight">
              Procurement Compliance Command Center
            </h1>
          </div>
          <p className="text-xs text-[#6f4e37]/80 mt-1 max-w-2xl">
            Real-time Bureau of Indian Standards (BIS) mapping, AI tender audit, and compliance monitoring.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/dashboard/standards")}
            className="border-[#c4a484] hover:bg-[#dfd5c3] text-[#3d2b1f]"
          >
            Browse BIS Repository
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => (window.location.href = "/dashboard/tenders")}
          >
            + Upload Tender Document
          </Button>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#6f4e37]">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardDescription className="text-[11px] font-semibold uppercase text-[#6f4e37]">
              Total BIS Standards
            </CardDescription>
            <div className="p-1.5 rounded-md bg-[#ebe5d8] text-[#6f4e37]">
              <Database className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#3d2b1f]">4,820</div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#295030] mt-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+12 added this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#295030]">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardDescription className="text-[11px] font-semibold uppercase text-[#6f4e37]">
              Active Tenders Audited
            </CardDescription>
            <div className="p-1.5 rounded-md bg-[#eef3ee] text-[#295030]">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#3d2b1f]">128</div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#295030] mt-1 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>94.2% Compliance Rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#7d5017]">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardDescription className="text-[11px] font-semibold uppercase text-[#6f4e37]">
              Compliance Gaps
            </CardDescription>
            <div className="p-1.5 rounded-md bg-[#faf3e8] text-[#7d5017]">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#3d2b1f]">14</div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#7d5017] mt-1 font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>Requires Officer Review</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#3d2b1f]">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardDescription className="text-[11px] font-semibold uppercase text-[#6f4e37]">
              Mandatory Certifications
            </CardDescription>
            <div className="p-1.5 rounded-md bg-[#ebe5d8] text-[#3d2b1f]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#3d2b1f]">1,240</div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#6f4e37] mt-1 font-medium">
              <span>QCO Regulated Standards</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Recent Standards + Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Recent Standards Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#c4a484]/30 pb-3">
              <div>
                <CardTitle className="text-sm sm:text-base">Featured BIS Standards</CardTitle>
                <CardDescription>Recently indexed Indian Standards in active procurement specifications</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = "/dashboard/standards")}
                className="text-xs h-7 text-[#6f4e37]"
              >
                View All <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-[#6f4e37]/70">
                  Loading BIS Standards...
                </div>
              ) : standards.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6f4e37]/70">
                  No standards records found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#ebe5d8] text-[10px] font-semibold text-[#6f4e37] uppercase border-b border-[#c4a484]/30">
                        <th className="py-2.5 px-3">IS Number</th>
                        <th className="py-2.5 px-3">Title & Scope</th>
                        <th className="py-2.5 px-3">Domain</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c4a484]/20 text-xs">
                      {standards.map((std) => (
                        <tr key={std.id} className="hover:bg-[#ebe5d8]/40 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-[#6f4e37] font-mono whitespace-nowrap">
                            {std.is_number}
                          </td>
                          <td className="py-2.5 px-3 max-w-sm">
                            <div className="font-medium text-[#3d2b1f] line-clamp-1">{std.title}</div>
                            <div className="text-[11px] text-[#6f4e37]/80 line-clamp-1">{std.scope}</div>
                          </td>
                          <td className="py-2.5 px-3 text-[#3d2b1f]/80 whitespace-nowrap text-[11px]">
                            {std.domain}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-right">
                            <Badge variant={std.status === "ACTIVE" ? "success" : "warning"}>
                              {std.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Compliance Audit Stream */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b border-[#c4a484]/30 pb-3">
              <CardTitle className="text-sm sm:text-base">Compliance Audit Stream</CardTitle>
              <CardDescription>Live automated verification activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-3 text-xs">
              <div className="p-3 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#3d2b1f]">Tender #MOHUA-2026-891</span>
                  <Badge variant="success">PASSED</Badge>
                </div>
                <p className="text-[#3d2b1f]/80 text-[11px]">Matched IS 1363: Part 1 for Grade C Hexagon Bolts.</p>
                <div className="text-[10px] text-[#6f4e37]/70">10 mins ago • Audited by System</div>
              </div>

              <div className="p-3 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#3d2b1f]">Tender #PWD-DELHI-402</span>
                  <Badge variant="warning">GAP DETECTED</Badge>
                </div>
                <p className="text-[#3d2b1f]/80 text-[11px]">Outdated IS 2062 version (2006 vs 2011) referenced in Clause 3.1.</p>
                <div className="text-[10px] text-[#6f4e37]/70">32 mins ago • Audited by Officer</div>
              </div>

              <div className="p-3 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#3d2b1f]">Standard IS 694 Updated</span>
                  <Badge variant="info">SYSTEM</Badge>
                </div>
                <p className="text-[#3d2b1f]/80 text-[11px]">Amendment 2 registered for PVC Insulated Cables.</p>
                <div className="text-[10px] text-[#6f4e37]/70">2 hours ago • BIS Sync</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
