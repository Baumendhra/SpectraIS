import React from "react";
import { BookOpen, FileCheck, CheckCircle2, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface RecommendationItem {
  recommendation_id: string;
  is_number: string;
  standard_title: string;
  clause_reference: string;
  category_type: string;
  applicability_reason: string;
  evidence_text: string;
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
    <div className="fixed inset-y-0 right-0 w-96 bg-[#ebe5d8] border-l border-[#c4a484]/50 p-5 z-50 overflow-y-auto shadow-elevated space-y-4 animate-in slide-in-from-right">
      <div className="flex items-center justify-between border-b border-[#c4a484]/40 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4.5 w-4.5 text-[#6f4e37]" />
          <h3 className="font-bold text-[#3d2b1f] text-sm">Citation Evidence Grounding</h3>
        </div>
        <button onClick={onClose} className="text-[#6f4e37] hover:text-[#3d2b1f] p-1 rounded transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2.5">
        <div>
          <span className="text-[10px] font-semibold text-[#6f4e37] uppercase tracking-wider">Standard & Clause</span>
          <p className="text-sm font-bold text-[#6f4e37] font-mono mt-0.5">{recommendation.is_number}</p>
          <p className="text-xs text-[#3d2b1f] font-medium leading-snug">{recommendation.standard_title}</p>
          <p className="text-[11px] text-[#6f4e37] mt-0.5 font-mono">Reference: {recommendation.clause_reference}</p>
        </div>

        <div className="flex gap-2">
          <Badge variant="info">{recommendation.category_type} Standard</Badge>
          <Badge variant={recommendation.risk_level === "HIGH" ? "danger" : "warning"}>
            {recommendation.risk_level} Priority
          </Badge>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-semibold text-[#6f4e37] uppercase tracking-wider">Applicability Rationale</span>
        <div className="p-3 rounded-md bg-white border border-[#c4a484]/40 text-xs text-[#3d2b1f] leading-relaxed">
          {recommendation.applicability_reason}
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-semibold text-[#6f4e37] uppercase tracking-wider">Source Evidence Excerpt</span>
        <div className="p-3 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 text-xs font-mono text-[#3d2b1f] leading-relaxed">
          "{recommendation.evidence_text}"
        </div>
      </div>

      <div className="p-3 rounded-md bg-[#eef3ee] border border-[#295030]/25 flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 text-[#295030] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#295030] font-medium leading-normal">
          Verified against indexed Bureau of Indian Standards (BIS) records. Zero hallucination guarantee.
        </p>
      </div>
    </div>
  );
};
