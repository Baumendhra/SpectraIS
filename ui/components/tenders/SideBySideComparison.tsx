import React from "react";
import { Badge } from "@/components/ui/Badge";
import { ArrowRightLeft, CheckCircle2, XCircle, AlertCircle, HelpCircle } from "lucide-react";

interface ComparisonRow {
  parameter: string;
  tender_specification: string;
  ideal_bis_standard: string;
  compliance_status: string; // COMPLIANT, NON_COMPLIANT, PARTIAL, MISSING
  risk_indicator: string;
}

interface SideBySideComparisonProps {
  matrix: ComparisonRow[];
}

export const SideBySideComparison: React.FC<SideBySideComparisonProps> = ({ matrix }) => {
  if (!matrix || matrix.length === 0) return null;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return (
          <Badge variant="success" className="gap-1 text-[10px]">
            <CheckCircle2 className="h-3 w-3" /> Compliant
          </Badge>
        );
      case "NON_COMPLIANT":
        return (
          <Badge variant="danger" className="gap-1 text-[10px]">
            <XCircle className="h-3 w-3" /> Non-Compliant
          </Badge>
        );
      case "PARTIAL":
        return (
          <Badge variant="warning" className="gap-1 text-[10px]">
            <AlertCircle className="h-3 w-3" /> Partial
          </Badge>
        );
      default:
        return (
          <Badge variant="danger" className="gap-1 text-[10px]">
            <HelpCircle className="h-3 w-3" /> Missing
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#3d2b1f] flex items-center gap-2">
        <ArrowRightLeft className="h-4 w-4 text-[#6f4e37]" />
        Side-by-Side Tender Spec vs Ideal BIS Compliance Profile
      </h3>

      <div className="overflow-x-auto rounded-lg border border-[#c4a484]/40 bg-white shadow-card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#ebe5d8] text-[11px] font-semibold uppercase text-[#6f4e37] border-b border-[#c4a484]/40">
              <th className="p-3">Parameter / Domain</th>
              <th className="p-3">Current Tender Specification</th>
              <th className="p-3">Ideal BIS Standard Profile</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c4a484]/25 text-xs">
            {matrix.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#ebe5d8]/40 transition-colors">
                <td className="p-3 font-semibold text-[#3d2b1f]">{row.parameter}</td>
                <td className="p-3 text-[#3d2b1f]/85 max-w-xs">{row.tender_specification}</td>
                <td className="p-3 text-[#6f4e37] font-medium max-w-xs">{row.ideal_bis_standard}</td>
                <td className="p-3 text-center">{renderStatusBadge(row.compliance_status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
