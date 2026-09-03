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
  version_status_badge?: string;
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

  const formatVersionBadge = (item: RecommendationItem) => {
    if (item.version_status_badge) {
      return item.version_status_badge.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "").trim();
    }
    return item.status === "REVISED" ? "Revised Edition" : "Current Edition (2025)";
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="p-8 text-center border border-[#c4a484]/40 rounded-lg bg-[#ebe5d8]/30">
        <p className="text-xs text-[#6f4e37]/80">No standards recommendations generated yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recommendations.map((item) => {
        const isRevised = item.status === "REVISED" || !!item.supersession_warning;

        return (
          <div
            key={item.recommendation_id}
            className="p-5 rounded-lg bg-white border border-[#c4a484]/40 shadow-card hover:border-[#6f4e37]/60 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2.5">
              {/* Header: IS Number & Badges */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-sm sm:text-base text-[#6f4e37] tracking-tight font-mono">
                  {item.is_number}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.is_qco_mandated && (
                    <Badge variant="danger" className="text-[10px] font-bold tracking-wide">
                      QCO MANDATORY
                    </Badge>
                  )}
                  <Badge
                    variant={isRevised ? "danger" : "success"}
                    className="text-[10px] font-semibold tracking-tight"
                  >
                    {formatVersionBadge(item)}
                  </Badge>
                  <Badge
                    variant={
                      item.category_type?.includes("Mandatory")
                        ? "danger"
                        : item.category_type?.includes("Primary")
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
              <h4 className="font-semibold text-xs sm:text-sm text-[#3d2b1f] line-clamp-1">
                {item.standard_title}
              </h4>
              <p className="text-[11px] text-[#6f4e37] font-mono">
                Clause: {item.clause_reference}
              </p>
              <p className="text-xs text-[#3d2b1f]/85 line-clamp-2 leading-relaxed">
                {item.applicability_reason}
              </p>

              {/* Supersession Warning Banner if Applicable */}
              {item.supersession_warning && (
                <div className="p-2.5 rounded-md bg-[#faf3e8] border border-[#7d5017]/25 text-[11px] text-[#7d5017] flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#7d5017] shrink-0 mt-0.5" />
                  <span className="leading-tight">{item.supersession_warning}</span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-[#c4a484]/30 flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#295030] flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#295030]" />
                Evidence Grounded
              </span>

              <div className="flex items-center gap-2">
                {item.tender_boq_clause && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyClause(item.recommendation_id, item.tender_boq_clause!)}
                    className="text-xs gap-1 h-7 border-[#c4a484] hover:bg-[#ebe5d8] text-[#3d2b1f]"
                    title="Copy ready-to-use Tender BOQ clause"
                  >
                    {copiedId === item.recommendation_id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#295030]" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-[#6f4e37]" /> Copy BOQ Clause
                      </>
                    )}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onInspectEvidence(item)}
                  className="text-xs gap-1 h-7 border-[#c4a484] hover:bg-[#ebe5d8] text-[#6f4e37]"
                >
                  <Eye className="h-3.5 w-3.5" /> Traceability
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
