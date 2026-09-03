import React from "react";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, Award } from "lucide-react";

interface ComplianceGaugeProps {
  score: number;
  grade: string;
  explainability: string;
}

export const ComplianceGauge: React.FC<ComplianceGaugeProps> = ({ score, grade, explainability }) => {
  return (
    <div className="p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card flex flex-col md:flex-row items-center gap-5">
      <div className="flex flex-col items-center justify-center p-4 rounded-md bg-[#f8f5f0] border border-[#c4a484]/50 min-w-[130px] shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6f4e37]">Compliance Score</span>
        <span className="text-3xl font-bold font-mono text-[#3d2b1f] my-0.5">{score}</span>
        <Badge variant={score >= 75 ? "success" : "warning"} className="text-xs font-semibold px-2 py-0.5">
          Grade {grade}
        </Badge>
      </div>

      <div className="flex-1 space-y-1.5">
        <h3 className="text-sm sm:text-base font-bold text-[#3d2b1f] flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-[#6f4e37]" />
          Government Compliance Assessment Summary
        </h3>
        <p className="text-xs text-[#3d2b1f]/85 leading-relaxed">{explainability}</p>
        <div className="flex items-center gap-3 pt-1 text-[11px] text-[#6f4e37]/90 font-medium">
          <span className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-[#6f4e37]" /> Bureau of Indian Standards (BIS) Benchmark Verified
          </span>
        </div>
      </div>
    </div>
  );
};
