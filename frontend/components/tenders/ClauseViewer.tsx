import React, { useState } from "react";
import { FileCode2, Copy, Check, Sparkles } from "lucide-react";
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
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <FileCode2 className="h-4 w-4 text-emerald-400" />
        Ready-to-Use Procurement Clauses ({clauses.length} Clauses Generated)
      </h3>

      <div className="space-y-4">
        {clauses.map((c) => (
          <div
            key={c.clause_id}
            className="p-5 rounded-xl glass-panel border border-slate-800 space-y-3 hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                {c.clause_title}
              </span>
              <Badge variant="info" className="text-[10px] font-mono uppercase">
                {c.clause_category}
              </Badge>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed">
              {c.clause_text}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400 italic">
                <b>Rationale:</b> {c.rationale}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(c.clause_id, c.clause_text)}
                className="h-8 text-xs gap-1.5 border-slate-700 hover:bg-emerald-600/10 hover:text-emerald-400"
              >
                {copiedId === c.clause_id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy Clause
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
