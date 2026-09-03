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
      date: "2026-09-01",
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
      date: "2026-08-28",
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
      date: "2026-08-25",
    },
  ]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-[#6f4e37]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#3d2b1f] tracking-tight">
              Tender Analysis & Compliance Intelligence Platform
            </h1>
          </div>
          <p className="text-xs text-[#6f4e37]/80 mt-0.5">
            Automated Tender Document Extraction, BIS Gap Analysis, Compliance Scoring, and Risk Intelligence.
          </p>
        </div>

        <Link href="/dashboard/tenders/upload">
          <Button className="gap-1.5 self-start sm:self-auto">
            <UploadCloud className="h-4 w-4" /> Upload & Analyze Tender
          </Button>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#6f4e37]">
          <CardContent className="p-4">
            <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Total Analyzed Tenders</span>
            <p className="text-2xl font-bold text-[#3d2b1f] mt-1">{tenders.length}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#295030]">
          <CardContent className="p-4">
            <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Avg Compliance Score</span>
            <p className="text-2xl font-bold text-[#295030] mt-1 font-mono">82.7%</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#7d5017]">
          <CardContent className="p-4">
            <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Detected Compliance Gaps</span>
            <p className="text-2xl font-bold text-[#7d5017] mt-1 font-mono">6 Active Gaps</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#3d2b1f]">
          <CardContent className="p-4">
            <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Government Auditability</span>
            <p className="text-2xl font-bold text-[#3d2b1f] mt-1">100% Traceable</p>
          </CardContent>
        </Card>
      </div>

      {/* Tender List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#3d2b1f]">Analyzed Procurement Tenders</h3>

        <div className="overflow-x-auto rounded-lg border border-[#c4a484]/40 bg-white shadow-card">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#ebe5d8] text-[10px] font-bold uppercase text-[#6f4e37] border-b border-[#c4a484]/40">
                <th className="p-3">Reference / Title</th>
                <th className="p-3">Department</th>
                <th className="p-3">Domain</th>
                <th className="p-3 text-center">Score / Grade</th>
                <th className="p-3 text-center">Gaps</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4a484]/20 text-xs">
              {tenders.map((t) => (
                <tr key={t.id} className="hover:bg-[#ebe5d8]/40 transition-colors">
                  <td className="p-3">
                    <p className="font-semibold text-[#3d2b1f]">{t.title}</p>
                    <span className="font-mono text-[11px] text-[#6f4e37]">{t.ref}</span>
                  </td>
                  <td className="p-3 text-[#3d2b1f]/80">{t.department}</td>
                  <td className="p-3">
                    <Badge variant="neutral" className="text-[10px]">
                      {t.domain}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-bold text-[#295030] font-mono">{t.score}%</span>{" "}
                    <Badge variant="success" className="text-[10px] ml-1">
                      {t.grade}
                    </Badge>
                  </td>
                  <td className="p-3 text-center font-bold text-[#7d5017] font-mono">{t.gaps} Gaps</td>
                  <td className="p-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/tenders/${t.id}`)}
                      className="text-xs gap-1 h-7 border-[#c4a484] hover:bg-[#ebe5d8] text-[#3d2b1f]"
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
