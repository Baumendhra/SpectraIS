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
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#6f4e37]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#3d2b1f] tracking-tight">
              National Procurement Operating System (Procurement OS)
            </h1>
          </div>
          <p className="text-xs text-[#6f4e37]/80 mt-0.5">
            Nationwide procurement intelligence infrastructure serving ministries, state governments, PSUs, regulators, and auditors.
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {["NATIONAL", "MINISTRY", "STATE", "REGULATOR"].map((v) => (
            <Button
              key={v}
              variant={activeView === v ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveView(v)}
              className={activeView === v ? "text-xs font-bold" : "text-xs border-[#c4a484] text-[#3d2b1f]"}
            >
              {v}
            </Button>
          ))}
        </div>
      </div>

      {/* Multi-View Command Center Card */}
      {commandData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <Card className="border-l-4 border-l-[#6f4e37]">
              <CardContent className="p-4">
                <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">View Mode</span>
                <p className="text-lg sm:text-xl font-bold text-[#3d2b1f] mt-1">{commandData.view_type}</p>
                <p className="text-[11px] text-[#6f4e37]/80 mt-0.5 font-medium truncate">{commandData.title}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#295030]">
              <CardContent className="p-4">
                <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Compliance Health Score</span>
                <p className="text-2xl sm:text-3xl font-bold text-[#295030] mt-1 font-mono">{commandData.compliance_health_score}%</p>
                <p className="text-[11px] text-[#295030] mt-0.5 font-semibold">Grade A Target Exceeded</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#c4a484]">
              <CardContent className="p-4">
                <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Active Monitored Tenders</span>
                <p className="text-2xl sm:text-3xl font-bold text-[#3d2b1f] mt-1 font-mono">{commandData.active_tenders_monitored.toLocaleString()}</p>
                <p className="text-[11px] text-[#6f4e37]/80 mt-0.5 font-medium">Live Federation</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#822424]">
              <CardContent className="p-4">
                <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">High-Risk Surveillance Alerts</span>
                <p className="text-2xl sm:text-3xl font-bold text-[#822424] mt-1 font-mono">{commandData.high_risk_alerts_count}</p>
                <p className="text-[11px] text-[#822424] mt-0.5 font-medium">Under Audit Review</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Digital Twin Simulation & Data Fabric Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Digital Twin Simulator */}
        <Card>
          <CardHeader className="border-b border-[#c4a484]/30 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-[#3d2b1f]">
                <Cpu className="h-4.5 w-4.5 text-[#6f4e37]" />
                Procurement Digital Twin Engine
              </CardTitle>
              <Button size="sm" onClick={handleRunDigitalTwin} disabled={isSimulating} className="gap-1.5 text-xs">
                {isSimulating ? <Activity className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                Run National Twin Simulation
              </Button>
            </div>
            <CardDescription className="text-xs">
              Simulates national procurement activity across organizations, suppliers, standards, and spend flows.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {simState ? (
              <div className="space-y-3 p-3.5 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#6f4e37]">Simulation ID: {simState.simulation_id}</span>
                  <Badge variant="success" className="text-[10px]">
                    {simState.simulation_status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[#6f4e37]/80">Annual Spend Modeled:</span>
                    <p className="font-bold text-[#3d2b1f] mt-0.5 font-mono">₹{simState.simulated_annual_spend_inr_crores.toLocaleString()} Crores</p>
                  </div>
                  <div>
                    <span className="text-[#6f4e37]/80">Compliance Index:</span>
                    <p className="font-bold text-[#295030] mt-0.5 font-mono">{simState.simulated_compliance_index}%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-[#6f4e37]/75 text-xs border border-dashed border-[#c4a484]/50 rounded-md bg-[#f8f5f0]/50">
                Click "Run National Twin Simulation" to model live procurement flows.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Fabric Catalog */}
        <Card>
          <CardHeader className="border-b border-[#c4a484]/30 pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-[#3d2b1f]">
              <Database className="h-4.5 w-4.5 text-[#6f4e37]" />
              National Procurement Data Fabric Catalog
            </CardTitle>
            <CardDescription className="text-xs">
              Federated data sources across GeM, CPPP, State Portals, BIS, MCA, and Udyam.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-4">
            {fabricCatalog.map((item, idx) => (
              <div key={idx} className="p-3 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-[#3d2b1f]">{item.source_system}</h4>
                  <p className="text-[11px] text-[#6f4e37]/80 truncate max-w-xs">{item.data_lineage}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#6f4e37]">{item.records_count.toLocaleString()} Records</span>
                  <p className="text-[10px] text-[#295030] font-semibold">{item.status}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 10-Year Vision Roadmap */}
      {roadmap && (
        <Card>
          <CardHeader className="border-b border-[#c4a484]/30 pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-[#3d2b1f]">
              <Award className="h-4.5 w-4.5 text-[#6f4e37]" />
              National Procurement Operating System Strategic Evolution Vision
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
              <div className="p-3.5 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 space-y-1">
                <Badge variant="info" className="text-[10px]">1-YEAR (PHASE 1-7)</Badge>
                <h4 className="font-bold text-[#3d2b1f] text-xs">Enterprise Platform & GeM Sync</h4>
                <p className="text-[#3d2b1f]/80 leading-relaxed text-[11px]">{roadmap.year_1_milestone}</p>
              </div>

              <div className="p-3.5 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 space-y-1">
                <Badge variant="warning" className="text-[10px]">3-YEAR (NATIONWIDE ROLLOUT)</Badge>
                <h4 className="font-bold text-[#3d2b1f] text-xs">28 States & ISO Mapping</h4>
                <p className="text-[#3d2b1f]/80 leading-relaxed text-[11px]">{roadmap.year_3_milestone}</p>
              </div>

              <div className="p-3.5 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 space-y-1">
                <Badge variant="success" className="text-[10px]">5-YEAR (FULL AUTONOMY)</Badge>
                <h4 className="font-bold text-[#3d2b1f] text-xs">Digital Twin Autonomous OS</h4>
                <p className="text-[#3d2b1f]/80 leading-relaxed text-[11px]">{roadmap.year_5_milestone}</p>
              </div>

              <div className="p-3.5 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 space-y-1">
                <Badge variant="neutral" className="text-[10px]">10-YEAR (GLOBAL NETWORK)</Badge>
                <h4 className="font-bold text-[#3d2b1f] text-xs">Global Trade Network</h4>
                <p className="text-[#3d2b1f]/80 leading-relaxed text-[11px]">{roadmap.year_10_vision}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
