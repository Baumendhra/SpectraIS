"use client";

import React, { useState, useEffect } from "react";
import { Network, Database, Cpu, ShieldCheck, Layers, Play, CheckCircle2, Award, Activity, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

export default function NationalProcurementOSPage() {
  const [activeView, setActiveView] = useState<string>("NATIONAL");
  const [commandData, setCommandData] = useState<any>(null);
  const [fabricCatalog, setFabricCatalog] = useState<any[]>([]);
  const [simState, setSimState] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);

  useEffect(() => {
    fetchCommandView(activeView);
    api.get("/phase7/data-fabric/catalog").then((res) => setFabricCatalog(res.data)).catch(console.error);
    api.get("/phase7/roadmap").then((res) => setRoadmap(res.data)).catch(console.error);
  }, [activeView]);

  const fetchCommandView = (view: string) => {
    api.get(`/phase7/command-center/view?view_type=${view}`)
      .then((res) => setCommandData(res.data))
      .catch(console.error);
  };

  const handleRunDigitalTwin = async () => {
    setIsSimulating(true);
    try {
      const res = await api.post("/phase7/digital-twin/simulate?scenario=National%20BIS%20Mandate%20Enforcement");
      setSimState(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Globe className="h-6 w-6 text-blue-400" />
            National Procurement Operating System (Procurement OS)
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Nationwide procurement intelligence infrastructure serving ministries, state governments, PSUs, regulators, and auditors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["NATIONAL", "MINISTRY", "STATE", "REGULATOR"].map((v) => (
            <Button
              key={v}
              variant={activeView === v ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView(v)}
              className={activeView === v ? "bg-blue-600 text-white text-xs font-bold" : "text-xs border-slate-800 text-slate-300"}
            >
              {v}
            </Button>
          ))}
        </div>
      </div>

      {/* Multi-View Command Center Card */}
      {commandData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-panel border-slate-800">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-400 uppercase">View Mode</span>
                <p className="text-xl font-black text-blue-400 mt-1">{commandData.view_type}</p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">{commandData.title}</p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-slate-800">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-400 uppercase">Compliance Health Score</span>
                <p className="text-3xl font-black text-emerald-400 mt-1">{commandData.compliance_health_score}%</p>
                <p className="text-[11px] text-emerald-400 mt-1 font-semibold">Grade A Target Exceeded</p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-slate-800">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-400 uppercase">Active Monitored Tenders</span>
                <p className="text-3xl font-black text-white mt-1">{commandData.active_tenders_monitored.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400 mt-1">Live Federation</p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-slate-800">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-400 uppercase">High-Risk Surveillance Alerts</span>
                <p className="text-3xl font-black text-rose-400 mt-1">{commandData.high_risk_alerts_count}</p>
                <p className="text-[11px] text-rose-400 mt-1 font-medium">Under Audit Review</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Digital Twin Simulation & Data Fabric Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Digital Twin Simulator */}
        <Card className="glass-panel border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <Cpu className="h-5 w-5 text-indigo-400" />
                Procurement Digital Twin Engine
              </CardTitle>
              <Button size="sm" onClick={handleRunDigitalTwin} disabled={isSimulating} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 text-xs">
                {isSimulating ? <Activity className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                Run National Twin Simulation
              </Button>
            </div>
            <CardDescription className="text-xs">
              Simulates national procurement activity across organizations, suppliers, standards, and spend flows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {simState ? (
              <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-400">Simulation ID: {simState.simulation_id}</span>
                  <Badge variant="success" className="text-[10px]">
                    {simState.simulation_status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-400">Annual Spend Modeled:</span>
                    <p className="font-bold text-white mt-0.5">&Prime;{simState.simulated_annual_spend_inr_crores.toLocaleString()} Crores</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Compliance Index:</span>
                    <p className="font-bold text-emerald-400 mt-0.5">{simState.simulated_compliance_index}%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                Click "Run National Twin Simulation" to model live procurement flows.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Fabric Catalog */}
        <Card className="glass-panel border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Database className="h-5 w-5 text-blue-400" />
              National Procurement Data Fabric Catalog
            </CardTitle>
            <CardDescription className="text-xs">
              Federated data sources across GeM, CPPP, State Portals, BIS, MCA, and Udyam.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {fabricCatalog.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">{item.source_system}</h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-xs">{item.data_lineage}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-blue-400">{item.records_count.toLocaleString()} Records</span>
                  <p className="text-[10px] text-emerald-400 font-semibold">{item.status}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 10-Year Vision Roadmap */}
      {roadmap && (
        <Card className="glass-panel border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Award className="h-5 w-5 text-amber-400" />
              National Procurement Operating System 10-Year Strategic Evolution Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <Badge variant="info" className="text-[10px]">1-YEAR (PHASE 1-7)</Badge>
                <h4 className="font-bold text-white text-sm">Enterprise Platform & GeM Sync</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">{roadmap.year_1_milestone}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <Badge variant="warning" className="text-[10px]">3-YEAR (NATIONWIDE ROLLOUT)</Badge>
                <h4 className="font-bold text-white text-sm">28 States & ISO Mapping</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">{roadmap.year_3_milestone}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <Badge variant="success" className="text-[10px]">5-YEAR (FULL AUTONOMY)</Badge>
                <h4 className="font-bold text-white text-sm">Digital Twin Autonomous OS</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">{roadmap.year_5_milestone}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <Badge variant="secondary" className="text-[10px]">10-YEAR (GLOBAL NETWORK)</Badge>
                <h4 className="font-bold text-white text-sm">Global Trade Network</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">{roadmap.year_10_vision}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
