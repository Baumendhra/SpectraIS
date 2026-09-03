import React, { useState } from "react";
import { FileCode2, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ClauseItem {
  clause_id: string;
  clause_title: string;
  clause_category: string;
  clause_text: string;
  rationale: string;
}

interface ClauseViewerProps {
  clauses: ClauseItem[];
}

export const ClauseViewer: React.FC<ClauseViewerProps> = ({ clauses }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!clauses || clauses.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#3d2b1f] flex items-center gap-2">
        <FileCode2 className="h-4 w-4 text-[#6f4e37]" />
        Ready-to-Use Procurement Clauses ({clauses.length} Clauses Generated)
      </h3>

      <div className="space-y-3">
        {clauses.map((c) => (
          <div
            key={c.clause_id}
            className="p-4 rounded-lg bg-white border border-[#c4a484]/40 space-y-2.5 shadow-card hover:border-[#6f4e37]/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs sm:text-sm text-[#6f4e37] flex items-center gap-1.5">
                <FileCode2 className="h-3.5 w-3.5 text-[#6f4e37]" />
                {c.clause_title}
              </span>
              <Badge variant="neutral" className="text-[10px] font-mono uppercase font-semibold">
                {c.clause_category}
              </Badge>
            </div>

            <div className="p-3 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 text-xs font-mono text-[#3d2b1f] leading-relaxed">
              {c.clause_text}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#6f4e37]/80">
                <b className="text-[#3d2b1f]">Rationale:</b> {c.rationale}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(c.clause_id, c.clause_text)}
                className="h-7 text-xs gap-1 border-[#c4a484] hover:bg-[#ebe5d8] text-[#3d2b1f]"
              >
                {copiedId === c.clause_id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#295030]" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#6f4e37]" /> Copy Clause
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
