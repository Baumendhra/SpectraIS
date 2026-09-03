import React from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface RiskItem {
  risk_id: string;
  category: string;
  title: string;
  description: string;
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
      <h3 className="text-xs sm:text-sm font-bold text-[#3d2b1f] flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-[#6f4e37]" />
        Procurement Risk Assessment Matrix ({risks.length} Risk Factors)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {risks.map((risk) => (
          <div
            key={risk.risk_id}
            className="p-4 rounded-lg bg-white border border-[#c4a484]/40 shadow-card space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#6f4e37] uppercase tracking-wider">{risk.category}</span>
              <Badge
                variant={risk.severity === "Critical" || risk.severity === "High" ? "danger" : "warning"}
                className="text-[10px] uppercase font-semibold"
              >
                {risk.severity} Severity
              </Badge>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#3d2b1f]">{risk.title}</h4>
              <p className="text-xs text-[#3d2b1f]/85 mt-0.5 leading-relaxed">{risk.description}</p>
            </div>

            <div className="p-2.5 rounded-md bg-[#eef3ee] border border-[#295030]/25 space-y-0.5">
              <span className="text-[10px] font-bold text-[#295030] uppercase tracking-wider">Mitigation Strategy</span>
              <p className="text-[11px] text-[#295030] font-medium leading-normal">{risk.mitigation_strategy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
