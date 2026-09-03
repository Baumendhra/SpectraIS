import React from "react";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, AlertCircle, HelpCircle } from "lucide-react";

interface ConfidenceBadgeProps {
  confidence: string; // High, Medium, Low
  score?: number;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, score }) => {
  const isHigh = confidence?.toUpperCase() === "HIGH";
  const isMedium = confidence?.toUpperCase() === "MEDIUM";

  if (isHigh) {
    return (
      <Badge variant="success" className="flex items-center gap-1 py-0.5 px-2 text-[11px] font-semibold">
        <ShieldCheck className="h-3.5 w-3.5" />
        High Confidence {score ? `(${Math.round(score * 100)}%)` : ""}
      </Badge>
    );
  } else if (isMedium) {
    return (
      <Badge variant="warning" className="flex items-center gap-1 py-0.5 px-2 text-[11px] font-semibold">
        <AlertCircle className="h-3.5 w-3.5" />
        Medium Confidence {score ? `(${Math.round(score * 100)}%)` : ""}
      </Badge>
    );
  }
  return (
    <Badge variant="danger" className="flex items-center gap-1 py-0.5 px-2 text-[11px] font-semibold">
      <HelpCircle className="h-3.5 w-3.5" />
      Low Confidence {score ? `(${Math.round(score * 100)}%)` : ""}
    </Badge>
  );
};
