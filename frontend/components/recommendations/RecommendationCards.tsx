"use client";

import React, { useState } from "react";
import { BookOpen, Eye, CheckCircle2, ShieldAlert, Copy, Check, AlertTriangle, FileText } from "lucide-react";
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
  is_qco_mandated?: boolean;
  status?: string;
  supersession_warning?: string | null;
  tender_boq_clause?: string | null;
  nabl_testing_schedule?: string[];
}

interface RecommendationCardsProps {
  recommendations: RecommendationItem[];
  onInspectEvidence: (item: RecommendationItem) => void;
}

export const RecommendationCards: React.FC<RecommendationCardsProps> = ({ recommendations, onInspectEvidence }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyClause = (id: string, clause: string) => {
    navigator.clipboard.writeText(clause);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

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
          <div className="space-y-2.5">
            {/* Header: IS Number & Badges */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-base text-blue-400 tracking-tight">{item.is_number}</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.is_qco_mandated && (
                  <Badge variant="danger" className="text-[10px] font-bold tracking-wide">
                    QCO MANDATORY
                  </Badge>
                )}
                <Badge
                  variant={
                    item.status === "REVISED" || item.supersession_warning
                      ? "danger"
                      : "success"
                  }
                  className="text-[10px] font-bold tracking-wide flex items-center gap-1"
                >
                  {item.version_status_badge || (item.status === "REVISED" ? "🔴 REVISED" : "🟢 Up-to-Date (2025 Edition)")}
                </Badge>
                <Badge
                  variant={
                    item.category_type.includes("Mandatory")
                      ? "danger"
                      : item.category_type.includes("Primary")
                      ? "info"
                      : "neutral"
                  }
                  className="text-[10px] uppercase font-semibold"
                >
                  {item.category_type}
                </Badge>
              </div>
            </div>

            {/* Standard Title & Scope */}
            <h4 className="font-semibold text-sm text-slate-100 line-clamp-1">{item.standard_title}</h4>
            <p className="text-xs text-slate-400 font-mono">Clause: {item.clause_reference}</p>
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{item.applicability_reason}</p>

            {/* Supersession Warning Banner if Applicable */}
            {item.supersession_warning && (
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{item.supersession_warning}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Cited Evidence Grounded
            </span>

            <div className="flex items-center gap-2">
              {item.tender_boq_clause && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyClause(item.recommendation_id, item.tender_boq_clause!)}
                  className="text-xs gap-1.5 h-8 border-slate-700 hover:bg-slate-800 hover:text-slate-100"
                  title="Copy ready-to-use Tender BOQ clause"
                >
                  {copiedId === item.recommendation_id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" /> Copy BOQ Clause
                    </>
                  )}
                </Button>
              )}

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
        </div>
      ))}
    </div>
  );
};
