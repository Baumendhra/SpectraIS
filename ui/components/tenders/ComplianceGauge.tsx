import React from "react";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, Award } from "lucide-react";

interface ComplianceGaugeProps {
  score: number;
  grade: string;
  explainability: string;
}

export const ComplianceGauge: React.FC<ComplianceGaugeProps> = ({ score, grade, explainability }) => {
  const getScoreBadgeVariant = () => {
    if (score >= 75) return "success";
    if (score >= 55) return "warning";
    return "danger";
  };

  return (
    <div className="p-5 rounded-lg bg-white border border-[#c4a484]/40 shadow-card flex flex-col md:flex-row items-center gap-5 text-[#3d2b1f]">
      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#ebe5d8]/70 border border-[#c4a484]/50 min-w-[130px] shrink-0 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6f4e37]">
          Compliance Score
        </span>
        <span className="text-3xl sm:text-4xl font-black tracking-tight my-1 text-[#3d2b1f]">
          {score}
        </span>
        <Badge variant={getScoreBadgeVariant()} className="text-xs font-semibold px-2 py-0.5">
          Grade {grade}
        </Badge>
      </div>

      <div className="flex-1 space-y-1.5 text-center md:text-left">
        <h3 className="text-sm sm:text-base font-semibold text-[#3d2b1f] flex items-center justify-center md:justify-start gap-2">
          <ShieldCheck className="h-4 w-4 text-[#6f4e37]" />
          Government Compliance Assessment Summary
        </h3>
        <p className="text-xs text-[#3d2b1f]/85 leading-relaxed">
          {explainability}
        </p>
        <div className="flex items-center justify-center md:justify-start gap-2 pt-1 text-[11px] text-[#6f4e37] font-medium">
          <Award className="h-3.5 w-3.5" />
          <span>Bureau of Indian Standards (BIS) Benchmark Verified</span>
        </div>
      </div>
    </div>
  );
};
