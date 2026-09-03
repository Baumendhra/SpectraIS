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
      <div className="p-8 text-center border border-dashed border-[#c4a484]/60 rounded-lg bg-[#ebe5d8]/40">
        <p className="text-xs text-[#6f4e37]/80">No standards recommendations generated yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recommendations.map((item) => (
        <div
          key={item.recommendation_id}
          className="p-4 rounded-lg bg-white border border-[#c4a484]/35 shadow-card hover:border-[#6f4e37]/40 transition-all flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#6f4e37] font-mono">{item.is_number}</span>
              <Badge variant={item.risk_level === "HIGH" ? "danger" : "warning"} className="text-[10px] uppercase">
                {item.category_type}
              </Badge>
            </div>

            <h4 className="font-semibold text-xs sm:text-sm text-[#3d2b1f] line-clamp-1">{item.standard_title}</h4>
            <p className="text-[11px] text-[#6f4e37] font-mono">Clause: {item.clause_reference}</p>
            <p className="text-xs text-[#3d2b1f]/85 line-clamp-2 leading-relaxed">{item.applicability_reason}</p>
          </div>

          <div className="pt-2.5 border-t border-[#c4a484]/25 flex items-center justify-between">
            <span className="text-[11px] text-[#295030] flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Cited Evidence Grounded
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInspectEvidence(item)}
              className="text-xs gap-1.5 h-7.5 border-[#c4a484] hover:bg-[#ebe5d8] text-[#3d2b1f]"
            >
              <Eye className="h-3.5 w-3.5" /> View Traceability
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
