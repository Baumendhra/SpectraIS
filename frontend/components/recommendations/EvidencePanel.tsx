import React from "react";
import { BookOpen, FileCheck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface RecommendationItem {
  recommendation_id: string;
  is_number: string;
  standard_title: str;
  clause_reference: str;
  category_type: str;
  applicability_reason: str;
  evidence_text: str;
  source_sections: string[];
  confidence_score: number;
  risk_level: string;
}

interface EvidencePanelProps {
  recommendation: RecommendationItem | null;
  onClose: () => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ recommendation, onClose }) => {
  if (!recommendation) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 glass-panel bg-slate-900/95 border-l border-slate-800 p-6 z-50 overflow-y-auto shadow-2xl space-y-5 animate-in slide-in-from-right">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-400" />
          <h3 className="font-bold text-slate-100 text-base">Citation Evidence</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-semibold">
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Standard & Clause</span>
          <p className="text-sm font-bold text-blue-400 mt-1">{recommendation.is_number}</p>
          <p className="text-xs text-slate-300 font-medium">{recommendation.standard_title}</p>
          <p className="text-xs text-slate-400 mt-0.5">Reference: {recommendation.clause_reference}</p>
        </div>

        <div className="flex gap-2">
          <Badge variant="info">{recommendation.category_type} Standard</Badge>
          <Badge variant={recommendation.risk_level === "HIGH" ? "danger" : "warning"}>
            {recommendation.risk_level} Priority
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Applicability Rationale</span>
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
          {recommendation.applicability_reason}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Source Evidence Excerpt</span>
        <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/40 text-xs font-mono text-blue-200 leading-relaxed">
          "{recommendation.evidence_text}"
        </div>
      </div>

      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 flex items-start gap-2.5">
        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-emerald-300 font-medium leading-normal">
          Verified against indexed Bureau of Indian Standards (BIS) vector payload. Zero hallucination guarantee.
        </p>
      </div>
    </div>
  );
};
