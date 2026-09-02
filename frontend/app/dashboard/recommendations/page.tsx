"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit3,
  BookOpen,
  Cpu,
  Layers,
  FileText,
  Activity
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
    "Need procurement of LED street lights for municipal highway lighting with minimum 10kV surge protection and IP66 ingress rating."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeEvidence, setActiveEvidence] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procurementInput.trim() || isLoading) return;

    setIsLoading(true);
    setReviewStatus(null);

    try {
      const res = await api.post("/copilot/recommend-standards", {
        procurement_text: procurementInput,
      });
      setProfile(res.data);
    } catch (err: any) {
      console.error(err);
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-blue-400" />
            AI Procurement Copilot & Recommendation Engine
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Enterprise BIS Standards Recommendation Engine with Multi-Stage Retrieval & Government-Grade Traceability.
          </p>
        </div>
        {profile && (
          <div className="flex items-center gap-3">
            <ConfidenceBadge
              confidence={profile.overall_confidence.overall_confidence}
              score={profile.overall_confidence.numeric_score}
            />
            <Badge variant="outline" className="font-mono text-xs border-slate-700">
              {profile.domain} Domain
            </Badge>
          </div>
        )}
      </div>

      {/* Input Spec Form */}
      <Card className="glass-panel border-slate-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-400" />
            Procurement Requirement Input
          </CardTitle>
          <CardDescription className="text-xs">
            Enter unstructured tender specifications, product descriptions, or BOQ technical requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <textarea
              value={procurementInput}
              onChange={(e) => setProcurementInput(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-sans"
              placeholder="e.g., Procurement of LED street lights for municipal roads..."
            />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Gemini 2.5 Pro + Qdrant Multi-Stage Pipeline Active
              </div>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
                {isLoading ? (
                  <>
                    <Activity className="h-4 w-4 animate-spin" />
                    Analyzing Standards...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Compliance Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Workspace */}
      {profile && (
        <div className="space-y-6">
          {/* Audit & Confidence Overview Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-panel border-slate-800">
              <CardContent className="p-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Product Category</span>
                <p className="text-sm font-bold text-white mt-1 truncate">{profile.product_category}</p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-slate-800">
              <CardContent className="p-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Domain Classification</span>
                <p className="text-sm font-bold text-blue-400 mt-1">{profile.domain}</p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-slate-800">
              <CardContent className="p-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Vector Similarity</span>
                <p className="text-sm font-bold text-emerald-400 mt-1">
                  {Math.round(profile.overall_confidence.vector_similarity_score * 100)}%
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-slate-800">
              <CardContent className="p-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Graph Match Topology</span>
                <p className="text-sm font-bold text-indigo-400 mt-1">
                  {Math.round(profile.overall_confidence.graph_topology_score * 100)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Workspace */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-400" />
                Recommended BIS Standards & Compliance Clauses
              </h2>
              <span className="text-xs text-slate-400">
                Total Recommended: {profile.recommendations.length} Standards
              </span>
            </div>

            <RecommendationCards
              recommendations={profile.recommendations}
              onInspectEvidence={(item) => setActiveEvidence(item)}
            />
          </div>

          {/* Documentation Requirements Card */}
          <Card className="glass-panel border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                Mandatory Documentation & Testing Audit Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                {profile.categorized_standards.documentation_requirements.map((doc: string, idx: number) => (
                  <li key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Procurement Officer Review Action Bar */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                Procurement Officer Approval Workflow
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review recommended compliance profile before attaching to official tender BOQ specification.
              </p>
              {reviewStatus && (
                <p className="text-xs font-semibold text-emerald-400 mt-1">
                  ✓ Review Status Committed as: {reviewStatus}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOfficerReview("REJECTED")}
                className="border-rose-800/60 text-rose-400 hover:bg-rose-950/40 gap-1.5"
              >
                <XCircle className="h-4 w-4" /> Reject Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOfficerReview("MODIFIED")}
                className="border-amber-800/60 text-amber-400 hover:bg-amber-950/40 gap-1.5"
              >
                <Edit3 className="h-4 w-4" /> Modify & Approve
              </Button>
              <Button
                size="sm"
                onClick={() => handleOfficerReview("APPROVED")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve Recommendations
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Drawer */}
      <EvidencePanel recommendation={activeEvidence} onClose={() => setActiveEvidence(null)} />
    </div>
  );
}
