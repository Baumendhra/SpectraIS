import React from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2, ShieldX } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface RiskItem {
  risk_id: string;
  category: string;
  title: string;
  description: str;
  severity: string; // Critical, High, Medium, Low
  mitigation_strategy: string;
}

interface RiskMatrixProps {
  risks: RiskItem[];
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({ risks }) => {
  if (!risks || risks.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-400" />
        Procurement Risk Assessment Matrix ({risks.length} Risk Factors)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {risks.map((risk) => (
          <div
            key={risk.risk_id}
            className="p-4 rounded-xl glass-panel border border-slate-800 space-y-3 hover:border-amber-500/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{risk.category}</span>
              <Badge
                variant={risk.severity === "Critical" || risk.severity === "High" ? "danger" : "warning"}
                className="text-[10px] uppercase font-bold"
              >
                {risk.severity} Severity
              </Badge>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">{risk.title}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{risk.description}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Mitigation Strategy</span>
              <p className="text-xs text-slate-300 font-medium leading-normal">{risk.mitigation_strategy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
