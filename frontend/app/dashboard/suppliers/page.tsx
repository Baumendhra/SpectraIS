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
      <div className="p-12 text-center text-slate-400">
        <p>Loading Supplier Intelligence Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-blue-400" />
            Supplier Compliance & Risk Intelligence Platform
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Automated verification of vendor BIS CRS registration licenses, historical compliance scores, and risk ratings.
          </p>
        </div>
      </div>

      {/* Supplier Profile Card */}
      <Card className="glass-panel border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-white">{supplier.company_name}</CardTitle>
              <CardDescription className="text-xs font-mono text-blue-400 mt-1">
                BIS CRS License: {supplier.bis_crs_license_number}
              </CardDescription>
            </div>
            <Badge variant="success" className="px-3 py-1 text-xs">
              LICENSE {supplier.license_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Compliance Rating</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{supplier.compliance_score}%</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Risk Exposure</span>
              <p className="text-2xl font-black text-blue-400 mt-1">{supplier.risk_score}% Low Risk</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Past Tenders Supplied</span>
              <p className="text-2xl font-black text-white mt-1">{supplier.past_tenders_supplied} Tenders</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">Certified Product Categories</h4>
            <div className="flex flex-wrap gap-2">
              {supplier.categories_covered.map((cat: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs border-slate-700">
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
