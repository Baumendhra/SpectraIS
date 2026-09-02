import React from "react";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, Award } from "lucide-react";

interface ComplianceGaugeProps {
  score: number;
  grade: string;
  explainability: string;
}

export const ComplianceGauge: React.FC<ComplianceGaugeProps> = ({ score, grade, explainability }) => {
  const getScoreColor = () => {
    if (score >= 85) return "text-emerald-400 border-emerald-500/40 bg-emerald-950/20";
    if (score >= 70) return "text-blue-400 border-blue-500/40 bg-blue-950/20";
    if (score >= 55) return "text-amber-400 border-amber-500/40 bg-amber-950/20";
    return "text-rose-400 border-rose-500/40 bg-rose-950/20";
  };

  return (
    <div className={`p-6 rounded-2xl glass-panel border flex flex-col md:flex-row items-center gap-6 ${getScoreColor()}`}>
      <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[140px]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Compliance Score</span>
        <span className="text-4xl font-black tracking-tight my-1">{score}</span>
        <Badge variant={score >= 75 ? "success" : "warning"} className="text-xs font-bold px-2.5 py-0.5">
          Grade {grade}
        </Badge>
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-400" />
          Government Compliance Assessment Summary
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">{explainability}</p>
        <div className="flex items-center gap-4 pt-2 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.0">
            <Award className="h-3.5 w-3.5 text-blue-400" /> Bureau of Indian Standards (BIS) Benchmark Verified
          </span>
        </div>
      </div>
    </div>
  );
};
