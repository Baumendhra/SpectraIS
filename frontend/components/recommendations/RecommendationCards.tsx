import React from "react";
import { BookOpen, Eye, CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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

interface RecommendationCardsProps {
  recommendations: RecommendationItem[];
  onInspectEvidence: (item: RecommendationItem) => void;
}

export const RecommendationCards: React.FC<RecommendationCardsProps> = ({ recommendations, onInspectEvidence }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
        <p className="text-sm text-slate-400">No standards recommendations generated yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recommendations.map((item) => (
        <div
          key={item.recommendation_id}
          className="p-5 rounded-xl glass-panel border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base text-blue-400">{item.is_number}</span>
              <Badge variant={item.risk_level === "HIGH" ? "danger" : "warning"} className="text-[10px] uppercase">
                {item.category_type}
              </Badge>
            </div>

            <h4 className="font-semibold text-sm text-slate-100 line-clamp-1">{item.standard_title}</h4>
            <p className="text-xs text-slate-400 font-mono">Clause: {item.clause_reference}</p>
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{item.applicability_reason}</p>
          </div>

          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Cited Evidence Grounded
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInspectEvidence(item)}
              className="text-xs gap-1.5 h-8 border-slate-700 hover:bg-blue-600/10 hover:text-blue-400"
            >
              <Eye className="h-3.5 w-3.5" /> View Traceability
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
