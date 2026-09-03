"use client";

import React, { useState, useEffect } from "react";
import { Network, RefreshCw, CheckCircle2, ShieldCheck, Cpu, Zap, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

export default function IntegrationsWorkspacePage() {
  const [adapters, setAdapters] = useState<any[]>([]);
  const [syncingSystem, setSyncingSystem] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<Record<string, any>>({});

  useEffect(() => {
    api.get("/phase5/gov-integrations/adapters")
      .then((res) => setAdapters(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleSync = async (systemName: string) => {
    setSyncingSystem(systemName);
    try {
      const res = await api.post(`/phase5/gov-integrations/sync?system_name=${systemName}`);
      setSyncResults((prev) => ({ ...prev, [systemName]: res.data }));
    } catch (err: any) {
      console.error(err);
    } finally {
      setSyncingSystem(null);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-[#6f4e37]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#3d2b1f] tracking-tight">
              Government System Integrations & BIS Amendment Intelligence
            </h1>
          </div>
          <p className="text-xs text-[#6f4e37]/80 mt-0.5">
            Pluggable adapter framework for GeM, CPPP, NIC eProcurement, BIS Gazette Notices, and MCA APIs.
          </p>
        </div>
      </div>

      {/* Grid of Government Adapters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adapters.map((adapter) => (
          <Card key={adapter.system_name} className="flex flex-col justify-between">
            <CardHeader className="border-b border-[#c4a484]/30 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 text-[#3d2b1f]">
                  <Zap className="h-3.5 w-3.5 text-[#6f4e37]" />
                  {adapter.system_name}
                </CardTitle>
                <Badge variant={adapter.is_active ? "success" : "neutral"} className="text-[10px]">
                  {adapter.is_active ? "CONNECTED" : "INACTIVE"}
                </Badge>
              </div>
              <CardDescription className="text-[11px] font-mono truncate mt-0.5 text-[#6f4e37]/80">
                {adapter.api_endpoint}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-3">
              <div className="flex justify-between text-xs text-[#6f4e37]/85 font-medium">
                <span>Auth: <b className="text-[#3d2b1f]">{adapter.auth_type}</b></span>
                <span>Rate Limit: <b className="text-[#3d2b1f]">{adapter.rate_limit_per_min}/min</b></span>
              </div>

              {syncResults[adapter.system_name] && (
                <div className="p-2.5 rounded-md bg-[#eef3ee] border border-[#295030]/25 text-xs text-[#295030] space-y-0.5">
                  <p className="font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Sync Complete
                  </p>
                  <p className="text-[10px] text-[#295030]/90 font-mono">
                    {syncResults[adapter.system_name].message} ({syncResults[adapter.system_name].latency_ms}ms)
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync(adapter.system_name)}
                disabled={syncingSystem === adapter.system_name}
                className="w-full gap-1.5 text-xs h-8 border-[#c4a484] hover:bg-[#ebe5d8] text-[#3d2b1f]"
              >
                {syncingSystem === adapter.system_name ? (
                  <>
                    <Activity className="h-3.5 w-3.5 animate-spin" /> Synchronizing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" /> Sync Portal Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Guide & Air-Gapped Gazette Upload Banner */}
      <Card className="bg-[#ebe5d8] border-[#c4a484]/50">
        <CardHeader className="border-b border-[#c4a484]/30 pb-2.5">
          <CardTitle className="text-sm sm:text-base text-[#3d2b1f] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#6f4e37]" />
            Government Security Architecture & Offline Gazette Sync Engine
          </CardTitle>
          <CardDescription className="text-xs text-[#6f4e37]/90 leading-relaxed">
            SpectraIS supports dual operational modes for staying up-to-date with Bureau of Indian Standards (BIS) revisions:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3 rounded-md bg-white border border-[#c4a484]/40 space-y-1">
              <span className="font-semibold text-[#295030] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Mode 1: Live Scraping & Web Sync (Active)
              </span>
              <p className="text-[#3d2b1f]/80 text-[11px] leading-relaxed">
                The built-in scraper crawls <code className="text-[#6f4e37]">crsbis.in</code> and <code className="text-[#6f4e37]">bis.gov.in</code> to detect newly published IS revisions, amendments, and Quality Control Orders (QCOs).
              </p>
            </div>
            <div className="p-3 rounded-md bg-white border border-[#c4a484]/40 space-y-1">
              <span className="font-semibold text-[#6f4e37] flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" /> Mode 2: Air-Gapped Monthly Gazette Upload
              </span>
              <p className="text-[#3d2b1f]/80 text-[11px] leading-relaxed">
                For secure, air-gapped government networks without internet access, procurement officers can upload official monthly BIS Gazette manifest JSON/PDF files to refresh the knowledge base offline.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
