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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Network className="h-6 w-6 text-blue-400" />
            Government System Integrations & BIS Amendment Intelligence
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Pluggable adapter framework for GeM, CPPP, NIC eProcurement, BIS Gazette Notices, and MCA APIs.
          </p>
        </div>
      </div>

      {/* Grid of Government Adapters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adapters.map((adapter) => (
          <Card key={adapter.system_name} className="glass-panel border-slate-800 flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <Zap className="h-4 w-4 text-blue-400" />
                  {adapter.system_name}
                </CardTitle>
                <Badge variant={adapter.is_active ? "success" : "secondary"} className="text-[10px]">
                  {adapter.is_active ? "CONNECTED" : "INACTIVE"}
                </Badge>
              </div>
              <CardDescription className="text-xs font-mono truncate mt-1">
                {adapter.api_endpoint}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Auth Protocol: <b className="text-slate-200">{adapter.auth_type}</b></span>
                <span>Limit: <b className="text-slate-200">{adapter.rate_limit_per_min}/min</b></span>
              </div>

              {syncResults[adapter.system_name] && (
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Sync Complete
                  </p>
                  <p className="text-[11px] text-emerald-400 font-mono">
                    {syncResults[adapter.system_name].message} ({syncResults[adapter.system_name].latency_ms}ms)
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync(adapter.system_name)}
                disabled={syncingSystem === adapter.system_name}
                className="w-full gap-2 text-xs border-slate-700 hover:bg-blue-600/10 hover:text-blue-400"
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
    </div>
  );
}
