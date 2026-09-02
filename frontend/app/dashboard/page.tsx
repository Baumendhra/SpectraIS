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
  XCircle,
  Clock
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
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-indigo-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Procurement Compliance Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Bureau of Indian Standards (BIS) mapping, AI tender audit, and compliance monitoring.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/dashboard/standards"}>
            Browse BIS Repository
          </Button>
          <Button variant="primary" size="sm">
            + Upload New Tender Document
          </Button>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-400">Total BIS Standards</CardDescription>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <BookOpenCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4,820</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+12 added this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-400">Active Tenders Audited</CardDescription>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">128</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>94.2% Compliance Rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-400">Compliance Gaps</CardDescription>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">14</div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-1 font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>Requires Officer Review</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-400">Mandatory Certifications</CardDescription>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,240</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
              <span>QCO Regulated Standards</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Recent Standards + Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Standards Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Featured BIS Standards</CardTitle>
                <CardDescription>Recently indexed Indian Standards in active procurement specifications</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = "/dashboard/standards"}>
                View All <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-xs text-slate-400 animate-pulse">Loading BIS Standards...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                        <th className="py-2.5 px-3">IS Number</th>
                        <th className="py-2.5 px-3">Title & Scope</th>
                        <th className="py-2.5 px-3">Domain</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {standards.map((std) => (
                        <tr key={std.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-semibold text-blue-400 whitespace-nowrap">{std.is_number}</td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-200 line-clamp-1">{std.title}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{std.scope}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-300 whitespace-nowrap">{std.domain}</td>
                          <td className="py-3 px-3 whitespace-nowrap">
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

        {/* Right Column: Compliance Feed */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance Audit Stream</CardTitle>
              <CardDescription>Live automated verification activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Tender #MOHUA-2026-891</span>
                  <Badge variant="success">PASSED</Badge>
                </div>
                <p className="text-slate-400 text-[11px]">Matched IS 1363: Part 1 for Grade C Hexagon Bolts.</p>
                <div className="text-[10px] text-slate-500">10 mins ago • Audited by System</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Tender #PWD-DELHI-402</span>
                  <Badge variant="warning">GAP DETECTED</Badge>
                </div>
                <p className="text-slate-400 text-[11px]">Outdated IS 2062 version (2006 vs 2011) referenced in Clause 3.1.</p>
                <div className="text-[10px] text-slate-500">32 mins ago • Audited by Officer</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Standard IS 694 Updated</span>
                  <Badge variant="info">SYSTEM</Badge>
                </div>
                <p className="text-slate-400 text-[11px]">Amendment 2 registered for PVC Insulated Cables.</p>
                <div className="text-[10px] text-slate-500">2 hours ago • BIS Sync</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
