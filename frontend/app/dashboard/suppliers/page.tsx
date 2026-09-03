"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Award, CheckCircle2, AlertTriangle, Building2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

export default function SupplierIntelligencePage() {
  const [supplier, setSupplier] = useState<any>(null);

  useEffect(() => {
    api.get("/phase6/suppliers/SUP-88910")
      .then((res) => setSupplier(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!supplier) {
    return (
      <div className="p-12 text-center text-[#6f4e37]/70">
        <p>Loading Supplier Intelligence Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#6f4e37]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#3d2b1f] tracking-tight">
              Supplier Compliance & Risk Intelligence Platform
            </h1>
          </div>
          <p className="text-xs text-[#6f4e37]/80 mt-0.5">
            Automated verification of vendor BIS CRS registration licenses, historical compliance scores, and risk ratings.
          </p>
        </div>
      </div>

      {/* Supplier Profile Card */}
      <Card>
        <CardHeader className="border-b border-[#c4a484]/30 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#3d2b1f]">{supplier.company_name}</CardTitle>
              <CardDescription className="text-xs font-mono text-[#6f4e37] mt-0.5">
                BIS CRS License: {supplier.bis_crs_license_number}
              </CardDescription>
            </div>
            <Badge variant="success" className="px-2.5 py-1 text-xs">
              LICENSE {supplier.license_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40">
              <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Compliance Rating</span>
              <p className="text-2xl font-bold text-[#295030] mt-1 font-mono">{supplier.compliance_score}%</p>
            </div>

            <div className="p-3.5 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40">
              <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Risk Exposure</span>
              <p className="text-2xl font-bold text-[#6f4e37] mt-1 font-mono">{supplier.risk_score}% Low Risk</p>
            </div>

            <div className="p-3.5 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40">
              <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Past Tenders Supplied</span>
              <p className="text-2xl font-bold text-[#3d2b1f] mt-1 font-mono">{supplier.past_tenders_supplied} Tenders</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#6f4e37] uppercase mb-2">Certified Product Categories</h4>
            <div className="flex flex-wrap gap-2">
              {supplier.categories_covered.map((cat: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs border-[#c4a484]">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
