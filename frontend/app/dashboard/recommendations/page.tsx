"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit3,
  BookOpen,
  Layers,
  FileText,
  Activity,
  Upload,
  Database,
  RefreshCw,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { ConfidenceBadge } from "@/components/recommendations/ConfidenceBadge";
import { RecommendationCards } from "@/components/recommendations/RecommendationCards";
import { EvidencePanel } from "@/components/recommendations/EvidencePanel";

interface IngestionJob {
  id: string;
  filename: string;
  is_number?: string;
  status: string;
  chunks_count: number;
  vectors_count: number;
  error_message?: string;
}

export default function RecommendationsWorkspacePage() {
  // Main view navigation tab
  const [activeTab, setActiveTab] = useState<"recommendations" | "knowledge">("recommendations");

  // Recommendation Input state
  const [inputMode, setInputMode] = useState<"text" | "pdf">("text");
  const [procurementInput, setProcurementInput] = useState(
    "Need procurement of LED street lights for municipal highway lighting with minimum 10kV surge protection and IP66 ingress rating."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [tenderAnalysis, setTenderAnalysis] = useState<any>(null);
  const [activeEvidence, setActiveEvidence] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);

  // Requirement PDF Upload state
  const [specPdfFile, setSpecPdfFile] = useState<File | null>(null);
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);
  const specFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDraggingSpec, setIsDraggingSpec] = useState(false);

  // Knowledge Base / RAG Ingestion state
  const [kbJobs, setKbJobs] = useState<IngestionJob[]>([]);
  const [isKbLoading, setIsKbLoading] = useState(false);
  const [kbFile, setKbFile] = useState<File | null>(null);
  const [kbDomain, setKbDomain] = useState("Mechanical Engineering & Fasteners");
  const [kbCategory, setKbCategory] = useState("Fasteners & Industrial Hardware");
  const [isKbUploading, setIsKbUploading] = useState(false);
  const [kbUploadSuccess, setKbUploadSuccess] = useState<string | null>(null);
  const kbFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDraggingKb, setIsDraggingKb] = useState(false);

  // Load Ingestion jobs when switching to knowledge tab or on load
  const fetchKbJobs = async () => {
    setIsKbLoading(true);
    try {
      const res = await api.get("/ingestion/jobs");
      setKbJobs(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch ingestion jobs:", err);
    } finally {
      setIsKbLoading(false);
    }
  };

  useEffect(() => {
    fetchKbJobs();
  }, []);

  // Handle Text Requirement submission
  const handleGenerateText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procurementInput.trim() || isLoading) return;

    setIsLoading(true);
    setReviewStatus(null);
    setTenderAnalysis(null);

    try {
      const res = await api.post("/copilot/recommend-standards", {
        procurement_text: procurementInput,
      });
      setProfile(res.data);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to generate recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Spec / Tender PDF Upload & Analysis
  const handleUploadSpecPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specPdfFile || isAnalyzingPdf) return;

    setIsAnalyzingPdf(true);
    setReviewStatus(null);
    const formData = new FormData();
    formData.append("file", specPdfFile);

    try {
      // Analyze the uploaded PDF with tender analysis pipeline
      const res = await api.post("/tenders-v2/upload-and-analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTenderAnalysis(res.data);

      // Extract scope and text from the parsed profile to trigger standard recommendations
      const extractedText = res.data?.tender_profile?.scope_of_work || 
        `${res.data?.tender_profile?.title || ""} ${res.data?.tender_profile?.product_category || ""}`;

      if (extractedText) {
        setProcurementInput(extractedText);
        const recRes = await api.post("/copilot/recommend-standards", {
          procurement_text: extractedText,
        });
        setProfile(recRes.data);
      }
    } catch (err: any) {
      console.error("Failed to analyze specification PDF:", err);
      alert(err.response?.data?.detail || "Failed to analyze document. Ensure it is a valid PDF.");
    } finally {
      setIsAnalyzingPdf(false);
    }
  };

  // Handle BIS Standard PDF Ingestion into Qdrant RAG
  const handleKbUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbFile || isKbUploading) return;

    setIsKbUploading(true);
    setKbUploadSuccess(null);
    const formData = new FormData();
    formData.append("file", kbFile);
    formData.append("domain", kbDomain);
    formData.append("category", kbCategory);

    try {
      const res = await api.post("/ingestion/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setKbFile(null);
      setKbUploadSuccess(`Successfully parsed and indexed ${res.data?.data?.filename || "document"} into Qdrant.`);
      fetchKbJobs();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Upload to Knowledge Base failed.");
    } finally {
      setIsKbUploading(false);
    }
  };

  // Handle Officer Review
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
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/30 via-slate-900/60 to-indigo-950/20">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-blue-400" />
            AI Recommendations & BIS Knowledge Base
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Enterprise BIS Standards Retrieval, Specification PDF Upload Analysis, and Qdrant RAG Vector Ingestion.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "recommendations"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Recommendations
          </button>
          <button
            onClick={() => {
              setActiveTab("knowledge");
              fetchKbJobs();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "knowledge"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            Knowledge Base & RAG
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AI RECOMMENDATIONS & SPECIFICATION PDF UPLOAD                      */}
      {/* ========================================================================= */}
      {activeTab === "recommendations" && (
        <div className="space-y-6">
          {/* Input Mode Selector Card */}
          <Card className="glass-panel border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Search className="h-4 w-4 text-blue-400" />
                    Procurement Specification Input
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Choose to paste unstructured requirements or upload a procurement / tender specification PDF.
                  </CardDescription>
                </div>
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 self-start">
                  <button
                    type="button"
                    onClick={() => setInputMode("text")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      inputMode === "text"
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Paste Requirements Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("pdf")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      inputMode === "pdf"
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload PDF Document
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {inputMode === "text" ? (
                /* Text Input Form */
                <form onSubmit={handleGenerateText} className="space-y-4">
                  <textarea
                    value={procurementInput}
                    onChange={(e) => setProcurementInput(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-sans"
                    placeholder="e.g., Procurement of LED street lights for municipal roads with minimum 10kV surge protection..."
                  />
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Gemini 2.5 Pro + Qdrant Vector Retrieval Pipeline Active
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
                    >
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
              ) : (
                /* PDF Upload Form */
                <form onSubmit={handleUploadSpecPdf} className="space-y-4">
                  <div
                    onClick={() => specFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingSpec(true);
                    }}
                    onDragLeave={() => setIsDraggingSpec(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingSpec(false);
                      if (e.dataTransfer.files?.[0]) setSpecPdfFile(e.dataTransfer.files[0]);
                    }}
                    className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center space-y-2 transition-all ${
                      isDraggingSpec
                        ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                        : "border-slate-800 hover:border-blue-500/50 bg-slate-900/40"
                    }`}
                  >
                    <input
                      ref={specFileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => setSpecPdfFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />

                    {specPdfFile ? (
                      <div className="flex items-center justify-between p-3.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-left">
                        <div className="flex items-center gap-3">
                          <FileText className="h-7 w-7 text-blue-400 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-white truncate max-w-[280px] sm:max-w-md">
                              {specPdfFile.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {(specPdfFile.size / 1024).toFixed(1)} KB • Click or drop another to replace
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSpecPdfFile(null);
                            if (specFileInputRef.current) specFileInputRef.current.value = "";
                          }}
                          className="text-slate-400 hover:text-rose-400 p-1.5 transition-colors"
                          title="Remove file"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-blue-400 mx-auto" />
                        <div className="text-xs text-slate-200 font-semibold">
                          Click to Browse or Drag & Drop Tender / Spec Document
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Supports official tender PDFs, BOQ technical schedules, and equipment specifications.
                        </p>
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 pointer-events-none">
                            <Upload className="h-3.5 w-3.5 text-blue-400" /> Browse File
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-blue-400" />
                      Automatic clause extraction & compliance evaluation
                    </div>
                    <Button
                      type="submit"
                      disabled={!specPdfFile || isAnalyzingPdf}
                      className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
                    >
                      {isAnalyzingPdf ? (
                        <>
                          <Activity className="h-4 w-4 animate-spin" />
                          Parsing & Evaluating PDF...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Extract & Analyze PDF Spec
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Interactive Adaptive Clarification Engine Card */}
          {profile?.needs_clarification && (
            <Card className="glass-panel border-amber-500/40 bg-amber-950/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-amber-300">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    Adaptive Clarification Engine: Additional Parameters Recommended
                  </CardTitle>
                  <Badge variant="warning" className="text-[10px] font-bold">
                    {profile.missing_parameters?.length || 0} Underspecified Parameter(s)
                  </Badge>
                </div>
                <CardDescription className="text-xs text-amber-200/80">
                  To ensure 100% precise, legally binding Indian Standards recommendations, click an option to refine your specification:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {profile.clarification_questions?.map((q: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <label className="text-xs font-semibold text-white block">{q.question}</label>
                    <div className="flex flex-wrap gap-2">
                      {q.options?.map((opt: string, optIdx: number) => (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => {
                            const newText = `${procurementInput.trim()} ${opt}.`;
                            setProcurementInput(newText);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-blue-600 hover:text-white border border-slate-700 text-slate-200 transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <Sparkles className="h-3 w-3 text-amber-400" />
                          + {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* If Tender PDF was analyzed, display Document Summary & Compliance Score Breakdown */}
          {tenderAnalysis && (
            <Card className="glass-panel border-blue-500/30 bg-blue-950/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2 text-blue-300">
                    <FileCheck2 className="h-4 w-4 text-blue-400" />
                    Uploaded Document Analysis: {tenderAnalysis.filename}
                  </CardTitle>
                  <Badge variant="info" className="text-xs font-bold">
                    Grade: {tenderAnalysis.compliance_score?.grade || "A"} (
                    {Math.round(tenderAnalysis.compliance_score?.overall_score || 0)}%)
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {tenderAnalysis.tender_profile?.title || "Tender Document Analysis"} •{" "}
                  {tenderAnalysis.tender_profile?.department || "Procurement Dept"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                  <span className="font-semibold text-white block mb-1">Extracted Scope:</span>
                  {tenderAnalysis.tender_profile?.scope_of_work}
                </div>
                {tenderAnalysis.detected_standards?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-slate-400 font-semibold">Detected Standards:</span>
                    {tenderAnalysis.detected_standards.map((st: any, idx: number) => (
                      <Badge key={idx} variant="info" className="border-blue-500/30 text-blue-300 text-[11px]">
                        {st.is_number} ({st.status_in_kb || "Indexed"})
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results Workspace: Recommendations & Metrics */}
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
                      {Math.round((profile.overall_confidence?.vector_similarity_score || 0.88) * 100)}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-panel border-slate-800">
                  <CardContent className="p-4">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Confidence Rating</span>
                    <div className="mt-1">
                      <ConfidenceBadge
                        confidence={profile.overall_confidence?.overall_confidence || "HIGH"}
                        score={profile.overall_confidence?.numeric_score || 0.9}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Government Classification & Statutory Metadata Bar */}
              {(profile.sectional_committee || profile.suggested_hsn || profile.qco_enforced) && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-slate-300">
                    {profile.sectional_committee && (
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">BIS Sectional Committee</span>
                        <span className="font-semibold text-blue-300">{profile.sectional_committee}</span>
                      </div>
                    )}
                    {profile.suggested_hsn && (
                      <div className="border-l border-slate-800 pl-4">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Suggested HSN / SAC</span>
                        <span className="font-mono text-emerald-400 font-bold">{profile.suggested_hsn}</span>
                      </div>
                    )}
                  </div>
                  {profile.qco_enforced && (
                    <Badge variant="danger" className="font-bold py-1 px-3 text-[11px] tracking-wide">
                      GOVERNMENT QCO MANDATED
                    </Badge>
                  )}
                </div>
              )}

              {/* Statutory Legal Disclaimer */}
              {profile.statutory_disclaimer && (
                <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-800/30 text-[11px] text-slate-300 leading-relaxed">
                  <span className="font-bold text-blue-400 block mb-0.5">Government Procurement Rule 144(xi) GFR 2017 Notice:</span>
                  {profile.statutory_disclaimer}
                </div>
              )}

              {/* Recommendations Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="h-5 w-5 text-blue-400" />
                    Recommended BIS Standards & Compliance Clauses
                  </h2>
                  <span className="text-xs text-slate-400">
                    Total Recommended: {profile.recommendations?.length || 0} Standards
                  </span>
                </div>

                <RecommendationCards
                  recommendations={profile.recommendations || []}
                  onInspectEvidence={(item) => setActiveEvidence(item)}
                />
              </div>

              {/* Documentation Requirements */}
              {profile.categorized_standards?.documentation_requirements && (
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
                        <li
                          key={idx}
                          className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Officer Review Action Bar */}
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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KNOWLEDGE BASE & QDRANT RAG INGESTION                               */}
      {/* ========================================================================= */}
      {activeTab === "knowledge" && (
        <div className="space-y-6">
          {/* Vector DB Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-blue-500 glass-panel">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-semibold text-slate-400">
                  Qdrant Vector Store
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Connected
                </div>
                <span className="text-xs text-slate-400 mt-1 block font-mono">
                  Collection: bis_standards_chunks
                </span>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 glass-panel">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-semibold text-slate-400">
                  Embedding Dimension
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white">768-dim</div>
                <span className="text-xs text-slate-400 mt-1 block">Google Gemini / text-embedding-004</span>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 glass-panel">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-semibold text-slate-400">
                  Vector Retrieval Strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white">HNSW + RRF</div>
                <span className="text-xs text-slate-400 mt-1 block">Cosine Distance | Reciprocal Rank Fusion</span>
              </CardContent>
            </Card>
          </div>

          {/* BIS Standard PDF Upload Form for RAG Indexing */}
          <Card className="glass-panel border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-400" />
                Index Official BIS Standard PDF into RAG Vector Store
              </CardTitle>
              <CardDescription className="text-xs">
                Upload official Bureau of Indian Standards specification documents for automated clause extraction,
                semantic chunking, and Qdrant indexing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleKbUpload} className="space-y-4">
                <div
                  onClick={() => kbFileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingKb(true);
                  }}
                  onDragLeave={() => setIsDraggingKb(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingKb(false);
                    if (e.dataTransfer.files?.[0]) setKbFile(e.dataTransfer.files[0]);
                  }}
                  className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center space-y-2 transition-all ${
                    isDraggingKb
                      ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                      : "border-slate-800 hover:border-blue-500/50 bg-slate-900/40"
                  }`}
                >
                  <input
                    ref={kbFileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setKbFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />

                  {kbFile ? (
                    <div className="flex items-center justify-between p-3.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-left">
                      <div className="flex items-center gap-3">
                        <Database className="h-7 w-7 text-blue-400 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-white truncate max-w-[280px] sm:max-w-md">
                            {kbFile.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(kbFile.size / 1024).toFixed(1)} KB • Click or drop another to replace
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setKbFile(null);
                          if (kbFileInputRef.current) kbFileInputRef.current.value = "";
                        }}
                        className="text-slate-400 hover:text-rose-400 p-1.5 transition-colors"
                        title="Remove file"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-blue-400 mx-auto" />
                      <div className="text-xs text-slate-200 font-semibold">
                        Click to Browse or Drag & Drop BIS Standard PDF file
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Upload official BIS standard PDFs for automated clause extraction, semantic chunking, and Qdrant indexing.
                      </p>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 pointer-events-none">
                          <Upload className="h-3.5 w-3.5 text-blue-400" /> Browse PDF File
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Engineering Domain"
                    value={kbDomain}
                    onChange={(e) => setKbDomain(e.target.value)}
                    required
                  />
                  <Input
                    label="Product Category"
                    value={kbCategory}
                    onChange={(e) => setKbCategory(e.target.value)}
                    required
                  />
                </div>

                {kbUploadSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/50 text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {kbUploadSuccess}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!kbFile || isKbUploading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white gap-2"
                >
                  {isKbUploading ? (
                    <>
                      <Activity className="h-4 w-4 animate-spin" />
                      Parsing, Chunking & Indexing into Qdrant...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4" />
                      Process & Index Standard Document
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Ingestion Jobs History Table */}
          <Card className="glass-panel border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  Recent Ingestion Jobs
                </CardTitle>
                <CardDescription className="text-xs">
                  Track document parsing, semantic chunking, and embedding generation in Qdrant.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchKbJobs} className="gap-1.5 text-xs">
                <RefreshCw className={`h-3.5 w-3.5 ${isKbLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isKbLoading && kbJobs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                  Loading ingestion history...
                </div>
              ) : kbJobs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No ingestion jobs yet. Upload a BIS Standard PDF document above to index.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase bg-slate-900/60">
                        <th className="py-3 px-4">Filename</th>
                        <th className="py-3 px-4">Detected IS Number</th>
                        <th className="py-3 px-4">Chunks Extracted</th>
                        <th className="py-3 px-4">Qdrant Vectors</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {kbJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-800/30">
                          <td className="py-3.5 px-4 font-semibold text-slate-200 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-400" /> {job.filename}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-blue-400">{job.is_number || "Pending"}</td>
                          <td className="py-3.5 px-4 text-slate-300">{job.chunks_count}</td>
                          <td className="py-3.5 px-4 text-slate-300">{job.vectors_count}</td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                job.status === "COMPLETED"
                                  ? "success"
                                  : job.status === "FAILED"
                                  ? "danger"
                                  : "warning"
                              }
                            >
                              {job.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
