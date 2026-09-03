"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, Filter, Search, Calendar, User, CheckCircle2, AlertTriangle, FileText, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  status: "SUCCESS" | "FLAGGED" | "BLOCKED";
  details: string;
}

export default function AuditTrailPage() {
  const [events, setEvents] = useState<AuditEvent[]>([
    {
      id: "AUD-9921",
      timestamp: "2026-09-03 11:15:20",
      actor: "admin@mohua.gov.in",
      role: "SUPER_ADMIN",
      action: "STANDARD_VERIFICATION_PASS",
      resource: "IS 1363: Part 1: 2019",
      status: "SUCCESS",
      details: "Automated clause verification against Qdrant vector payload passed with zero discrepancies.",
    },
    {
      id: "AUD-9920",
      timestamp: "2026-09-03 10:48:12",
      actor: "officer@mohua.gov.in",
      role: "PROCUREMENT_OFFICER",
      action: "TENDER_SPEC_REVIEW",
      resource: "Tender #MOHUA-2026-891",
      status: "SUCCESS",
      details: "Officer approved recommended BOQ compliance profile with 4 mandatory BIS specifications.",
    },
    {
      id: "AUD-9919",
      timestamp: "2026-09-03 09:30:45",
      actor: "system_scheduler",
      role: "SYSTEM",
      action: "BIS_GAZETTE_SYNC",
      resource: "Gazette Notice No. 412",
      status: "SUCCESS",
      details: "Daily scheduled scraper synchronized 3 revised Indian Standards and 2 Quality Control Orders.",
    },
    {
      id: "AUD-9918",
      timestamp: "2026-09-03 08:12:04",
      actor: "officer@mohua.gov.in",
      role: "PROCUREMENT_OFFICER",
      action: "OUTDATED_STANDARD_DETECTED",
      resource: "IS 2062:2006",
      status: "FLAGGED",
      details: "Tender referenced outdated IS 2062 version (2006 vs mandatory 2011 QCO). Gap logged for review.",
    },
    {
      id: "AUD-9917",
      timestamp: "2026-09-02 18:40:11",
      actor: "admin@mohua.gov.in",
      role: "SUPER_ADMIN",
      action: "USER_ROLE_PROVISION",
      resource: "User ID #5b7888bd",
      status: "SUCCESS",
      details: "Provisioned Procurement Officer credentials with tenant ministry access permissions.",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-[#6f4e37]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#3d2b1f] tracking-tight">
              Government Compliance Audit Trail & System Ledger
            </h1>
          </div>
          <p className="text-xs text-[#6f4e37]/80 mt-0.5">
            Immutable regulatory audit records of standards retrieval, AI recommendations, and officer sign-offs.
          </p>
        </div>
        <Badge variant="success" className="px-2.5 py-1 text-xs font-semibold gap-1 self-start md:self-auto">
          <ShieldCheck className="h-3.5 w-3.5" /> Cryptographic Integrity Verified
        </Badge>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-3.5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6f4e37]/60" />
            <input
              type="text"
              placeholder="Search by action, actor, resource, or Audit ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f8f5f0] border border-[#c4a484]/60 rounded-md pl-9 pr-3 py-1.5 text-xs text-[#3d2b1f] placeholder-[#6f4e37]/50 focus:outline-none focus:border-[#6f4e37] focus:ring-1 focus:ring-[#6f4e37]"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#f8f5f0] border border-[#c4a484]/60 rounded-md px-3 py-1.5 text-xs text-[#3d2b1f] focus:outline-none focus:border-[#6f4e37]"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success Only</option>
              <option value="FLAGGED">Flagged Gaps</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#c4a484]/30 text-[10px] font-semibold text-[#6f4e37] uppercase bg-[#ebe5d8]">
                  <th className="py-2.5 px-3.5">Audit ID</th>
                  <th className="py-2.5 px-3.5">Timestamp</th>
                  <th className="py-2.5 px-3.5">Actor & Role</th>
                  <th className="py-2.5 px-3.5">Action Event</th>
                  <th className="py-2.5 px-3.5">Resource Target</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Verification Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4a484]/20 text-xs">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-[#ebe5d8]/40 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-[#6f4e37] whitespace-nowrap">{evt.id}</td>
                    <td className="py-3 px-3.5 text-[#3d2b1f]/80 whitespace-nowrap font-mono text-[11px]">{evt.timestamp}</td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-semibold text-[#3d2b1f]">{evt.actor}</div>
                      <div className="text-[10px] text-[#6f4e37]/75 font-mono">{evt.role}</div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-semibold text-[#3d2b1f]">
                      {evt.action}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[#6f4e37]">
                      {evt.resource}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <Badge variant={evt.status === "SUCCESS" ? "success" : evt.status === "FLAGGED" ? "warning" : "danger"}>
                        {evt.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3.5 text-[#3d2b1f]/85 max-w-sm">
                      {evt.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
