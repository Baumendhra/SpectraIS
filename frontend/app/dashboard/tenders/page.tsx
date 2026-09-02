"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileCheck2, UploadCloud, Plus, Search, ShieldCheck, AlertCircle, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function TendersDashboardPage() {
  const router = useRouter();

  const [tenders] = useState([
    {
      id: "TND-89F12A",
      ref: "REF-40A182",
      title: "Procurement of LED Street Lights for Municipal Highway",
      department: "Public Works Department",
      category: "LED Street Luminaires",
      domain: "Electrical",
      score: 72.5,
      grade: "B",
      gaps: 3,
      status: "COMPLETED",
      date: "2026-09-01"
    },
    {
      id: "TND-77B31C",
      ref: "REF-19B441",
      title: "ICU Hospital Ventilators & Patient Support Systems",
      department: "Ministry of Health & Family Welfare",
      category: "Medical Ventilator",
      domain: "Medical",
      score: 91.0,
      grade: "A+",
      gaps: 1,
      status: "COMPLETED",
      date: "2026-08-28"
    },
    {
      id: "TND-55C19E",
      ref: "REF-33C902",
      title: "CCTV Camera Surveillance System for Smart City",
      department: "Smart City Infrastructure Division",
      category: "CCTV Camera System",
      domain: "IT",
      score: 84.5,
      grade: "A",
      gaps: 2,
      status: "COMPLETED",
      date: "2026-08-25"
    }
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="h-6 w-6 text-blue-400" />
            Tender Analysis & Compliance Intelligence Platform
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Automated Tender Document Extraction, BIS Gap Analysis, Compliance Scoring, and Risk Intelligence.
          </p>
        </div>

        <Link href="/dashboard/tenders/upload">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
            <UploadCloud className="h-4 w-4" /> Upload & Analyze Tender
          </Button>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel border-slate-800">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Analyzed Tenders</span>
            <p className="text-2xl font-black text-white mt-1">{tenders.length}</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-slate-800">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">Avg Compliance Score</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">82.7%</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-slate-800">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">Detected Compliance Gaps</span>
            <p className="text-2xl font-black text-amber-400 mt-1">6 Active Gaps</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-slate-800">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">Government Auditability</span>
            <p className="text-2xl font-black text-blue-400 mt-1">100% Traceable</p>
          </CardContent>
        </Card>
      </div>

      {/* Tender List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Analyzed Procurement Tenders</h3>

        <div className="overflow-x-auto rounded-xl border border-slate-800 glass-panel">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-800">
                <th className="p-3.5">Reference / Title</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Domain</th>
                <th className="p-3.5 text-center">Score / Grade</th>
                <th className="p-3.5 text-center">Gaps</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {tenders.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-white">{t.title}</p>
                    <span className="font-mono text-[11px] text-blue-400">{t.ref}</span>
                  </td>
                  <td className="p-3.5 text-slate-300">{t.department}</td>
                  <td className="p-3.5">
                    <Badge variant="outline" className="text-[10px] border-slate-700">
                      {t.domain}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="font-bold text-emerald-400">{t.score}%</span>{" "}
                    <Badge variant="success" className="text-[10px] ml-1">
                      {t.grade}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-center font-bold text-amber-400">{t.gaps} Gaps</td>
                  <td className="p-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/tenders/${t.id}`)}
                      className="text-xs gap-1 h-8 border-slate-700 hover:text-blue-400"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Analysis
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
