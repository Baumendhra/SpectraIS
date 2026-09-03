"use client";

import React, { useState } from "react";
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit3,
  Layers,
  FileText,
  Activity,
  SearchCheck,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { ConfidenceBadge } from "@/components/recommendations/ConfidenceBadge";
import { RecommendationCards } from "@/components/recommendations/RecommendationCards";
import { EvidencePanel } from "@/components/recommendations/EvidencePanel";

export default function RecommendationsWorkspacePage() {
  const [procurementInput, setProcurementInput] = useState(
    "Procurement of 500 High-Performance Commercial Laptop Computers and 100 Desktop PCs for Government Office Deployment with 14-inch Full HD display, minimum 16GB RAM, 512GB NVMe SSD, Type-C Power Adaptor, and mandatory BIS CRS IS 13252 Security Compliance."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeEvidence, setActiveEvidence] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procurementInput.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setReviewStatus(null);

    try {
      const res = await api.post("/copilot/recommend-standards", {
        procurement_text: procurementInput,
      });
      setProfile(res.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || err.message || "Failed to analyze procurement requirements.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfficerReview = async (status: "APPROVED" | "REJECTED" | "MODIFIED") => {
    if (!profile) return;
    try {
      await api.post("/copilot/review-recommendation", {
        profile_id: profile.profile_id,
        review_status: status,
        officer_notes: `Officer review recorded as ${status}.`,
      });
      setReviewStatus(status);
    } catch (err: any) {
      console.error("Failed to submit review:", err);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <SearchCheck className="h-5 w-5 text-[#6f4e37]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#3d2b1f] tracking-tight">
              AI Procurement Copilot & Recommendation Engine
            </h1>
          </div>
          <p className="text-xs text-[#6f4e37]/80 mt-0.5">
            Enterprise BIS Standards Recommendation Engine with Multi-Stage Retrieval & Government-Grade Traceability.
          </p>
        </div>
        {profile && (
          <div className="flex items-center gap-2.5">
            <ConfidenceBadge
              confidence={profile.overall_confidence.overall_confidence}
              score={profile.overall_confidence.numeric_score}
            />
            <Badge variant="outline" className="font-mono text-xs border-[#c4a484]">
              {profile.domain} Domain
            </Badge>
          </div>
        )}
      </div>

      {/* Input Spec Form */}
      <Card>
        <CardHeader className="border-b border-[#c4a484]/30 pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-[#6f4e37]" />
            Procurement Requirement Input
          </CardTitle>
          <CardDescription className="text-xs">
            Enter technical tender specifications, product descriptions, or BOQ line items to map against BIS standards.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <form onSubmit={handleGenerate} className="space-y-3">
            <textarea
              value={procurementInput}
              onChange={(e) => setProcurementInput(e.target.value)}
              rows={3}
              className="w-full rounded-md bg-[#f8f5f0] border border-[#c4a484]/60 p-3 text-xs sm:text-sm text-[#3d2b1f] placeholder-[#6f4e37]/50 focus:outline-none focus:border-[#6f4e37] focus:ring-1 focus:ring-[#6f4e37] resize-none font-sans"
              placeholder="e.g., Procurement of LED street lights for municipal roads with minimum 10kV surge protection..."
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2 text-xs text-[#6f4e37]/85">
                <span className="h-2 w-2 rounded-full bg-[#295030]" />
                Gemini Multi-Stage Hybrid Vector Pipeline Active
              </div>
              <Button type="submit" disabled={isLoading} className="gap-2 self-stretch sm:self-auto">
                {isLoading ? (
                  <>
                    <Activity className="h-3.5 w-3.5 animate-spin" />
                    Analyzing Standards...
                  </>
                ) : (
                  <>
                    <SearchCheck className="h-3.5 w-3.5" />
                    Generate Compliance Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error state alert */}
      {errorMsg && (
        <div className="p-3 rounded-md bg-[#f9ecec] border border-[#822424]/30 flex items-center gap-2 text-xs text-[#822424]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results Workspace */}
      {profile ? (
        <div className="space-y-5">
          {/* Audit & Confidence Overview Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <Card className="border-l-4 border-l-[#6f4e37]">
              <CardContent className="p-3.5">
                <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Product Category</span>
                <p className="text-xs sm:text-sm font-bold text-[#3d2b1f] mt-1 truncate">{profile.product_category}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#c4a484]">
              <CardContent className="p-3.5">
                <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Domain Classification</span>
                <p className="text-xs sm:text-sm font-bold text-[#6f4e37] mt-1">{profile.domain}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#295030]">
              <CardContent className="p-3.5">
                <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Vector Similarity</span>
                <p className="text-xs sm:text-sm font-bold text-[#295030] mt-1 font-mono">
                  {Math.round(profile.overall_confidence.vector_similarity_score * 100)}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#3d2b1f]">
              <CardContent className="p-3.5">
                <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Graph Match Topology</span>
                <p className="text-xs sm:text-sm font-bold text-[#3d2b1f] mt-1 font-mono">
                  {Math.round(profile.overall_confidence.graph_topology_score * 100)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Workspace */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-[#3d2b1f] flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#6f4e37]" />
                Recommended BIS Standards & Compliance Clauses
              </h2>
              <span className="text-xs text-[#6f4e37]/80">
                Total Recommended: {profile.recommendations.length} Standards
              </span>
            </div>

            <RecommendationCards
              recommendations={profile.recommendations}
              onInspectEvidence={(item) => setActiveEvidence(item)}
            />
          </div>

          {/* Documentation Requirements Card */}
          {profile.categorized_standards?.documentation_requirements && profile.categorized_standards.documentation_requirements.length > 0 && (
            <Card>
              <CardHeader className="border-b border-[#c4a484]/30 pb-2.5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#3d2b1f]">
                  <FileText className="h-4 w-4 text-[#6f4e37]" />
                  Mandatory Documentation & Testing Audit Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-[#3d2b1f]">
                  {profile.categorized_standards.documentation_requirements.map((doc: string, idx: number) => (
                    <li key={idx} className="p-2.5 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#295030] shrink-0" />
                      <span className="leading-snug">{doc}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Procurement Officer Review Action Bar */}
          <div className="p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#3d2b1f] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#6f4e37]" />
                Procurement Officer Approval Workflow
              </h3>
              <p className="text-xs text-[#6f4e37]/85 mt-0.5">
                Review recommended compliance profile before attaching to official tender BOQ specification.
              </p>
              {reviewStatus && (
                <p className="text-xs font-semibold text-[#295030] mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Review Status Committed as: {reviewStatus}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOfficerReview("REJECTED")}
                className="border-[#822424]/50 text-[#822424] hover:bg-[#f9ecec] gap-1 text-xs"
              >
                <XCircle className="h-3.5 w-3.5" /> Reject Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOfficerReview("MODIFIED")}
                className="border-[#7d5017]/50 text-[#7d5017] hover:bg-[#faf3e8] gap-1 text-xs"
              >
                <Edit3 className="h-3.5 w-3.5" /> Modify & Approve
              </Button>
              <Button
                size="sm"
                onClick={() => handleOfficerReview("APPROVED")}
                className="bg-[#295030] hover:bg-[#203f26] text-[#f8f5f0] gap-1 text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve Recommendations
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-10 text-center rounded-lg bg-[#ebe5d8]/50 border border-dashed border-[#c4a484]/60 space-y-2">
          <div className="h-10 w-10 mx-auto rounded-md bg-[#ebe5d8] border border-[#c4a484]/50 flex items-center justify-center text-[#6f4e37]">
            <SearchCheck className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#3d2b1f]">No Compliance Profile Generated Yet</h3>
          <p className="text-xs text-[#6f4e37]/80 max-w-md mx-auto">
            Input procurement specifications above and click "Generate Compliance Profile" to map requirements against Bureau of Indian Standards (BIS) records.
          </p>
        </div>
      )}

      {/* Evidence Drawer */}
      <EvidencePanel recommendation={activeEvidence} onClose={() => setActiveEvidence(null)} />
    </div>
  );
}
