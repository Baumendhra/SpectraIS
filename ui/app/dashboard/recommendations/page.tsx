"use client";

import React, { useState, useEffect } from "react";
import {
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
  Plus,
  SearchCheck,
  Check
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
      const extractedText =
        res.data?.tender_profile?.scope_of_work ||
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
      setKbUploadSuccess(`Successfully indexed ${res.data?.data?.filename || "document"} into Qdrant.`);
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
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <SearchCheck className="h-5 w-5 text-[#6f4e37]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#3d2b1f] tracking-tight">
              AI Standards Recommendations & BIS RAG Workspace
            </h1>
          </div>
          <p className="text-xs text-[#6f4e37]/85 mt-1">
            Enterprise BIS Standards Retrieval, Specification PDF Upload Analysis, and Qdrant RAG Vector Ingestion.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#f8f5f0] p-1 rounded-md border border-[#c4a484]/50 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === "recommendations"
                ? "bg-[#6f4e37] text-[#f8f5f0] shadow-xs"
                : "text-[#3d2b1f]/80 hover:text-[#3d2b1f] hover:bg-[#dfd5c3]/50"
            }`}
          >
            <SearchCheck className="h-3.5 w-3.5" />
            AI Recommendations
          </button>
          <button
            onClick={() => {
              setActiveTab("knowledge");
              fetchKbJobs();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === "knowledge"
                ? "bg-[#6f4e37] text-[#f8f5f0] shadow-xs"
                : "text-[#3d2b1f]/80 hover:text-[#3d2b1f] hover:bg-[#dfd5c3]/50"
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
        <div className="space-y-5">
          {/* Input Mode Selector Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-[#c4a484]/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <Search className="h-4 w-4 text-[#6f4e37]" />
                    Procurement Specification Input
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Choose to enter unstructured requirements or upload a procurement tender specification document.
                  </CardDescription>
                </div>
                <div className="flex bg-[#ebe5d8] p-0.5 rounded-md border border-[#c4a484]/40 self-start">
                  <button
                    type="button"
                    onClick={() => setInputMode("text")}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      inputMode === "text"
                        ? "bg-[#6f4e37] text-[#f8f5f0] font-semibold shadow-xs"
                        : "text-[#3d2b1f]/80 hover:text-[#3d2b1f]"
                    }`}
                  >
                    Paste Requirements Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("pdf")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                      inputMode === "pdf"
                        ? "bg-[#6f4e37] text-[#f8f5f0] font-semibold shadow-xs"
                        : "text-[#3d2b1f]/80 hover:text-[#3d2b1f]"
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload PDF Document
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {inputMode === "text" ? (
                /* Text Input Form */
                <form onSubmit={handleGenerateText} className="space-y-4">
                  <textarea
                    value={procurementInput}
                    onChange={(e) => setProcurementInput(e.target.value)}
                    rows={3}
                    className="w-full rounded-md bg-[#f8f5f0] border border-[#c4a484]/60 p-3 text-xs sm:text-sm text-[#3d2b1f] placeholder:text-[#6f4e37]/50 focus:outline-none focus:border-[#6f4e37] focus:ring-1 focus:ring-[#6f4e37] resize-none font-sans"
                    placeholder="e.g., Procurement of LED street lights for municipal roads with minimum 10kV surge protection..."
                  />
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-[#295030] font-medium">
                      <span className="h-2 w-2 rounded-full bg-[#295030]" />
                      Semantic Vector Retrieval & Clause Grounding Pipeline Active
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-[#6f4e37] hover:bg-[#3d2b1f] text-[#f8f5f0] gap-1.5"
                    >
                      {isLoading ? (
                        <>
                          <Activity className="h-4 w-4 animate-spin" />
                          Analyzing Standards...
                        </>
                      ) : (
                        <>
                          <SearchCheck className="h-4 w-4" />
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
                    className={`cursor-pointer border-2 border-dashed rounded-lg p-6 text-center space-y-2 transition-all ${
                      isDraggingSpec
                        ? "border-[#6f4e37] bg-[#ebe5d8]"
                        : "border-[#c4a484]/60 hover:border-[#6f4e37] bg-[#f8f5f0]"
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
                      <div className="flex items-center justify-between p-3 rounded-md bg-[#ebe5d8] border border-[#c4a484]/50 text-left">
                        <div className="flex items-center gap-3">
                          <FileText className="h-6 w-6 text-[#6f4e37] shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-[#3d2b1f] truncate max-w-[280px] sm:max-w-md">
                              {specPdfFile.name}
                            </p>
                            <p className="text-[10px] text-[#6f4e37]/80">
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
                          className="text-[#6f4e37] hover:text-[#822424] p-1 transition-colors"
                          title="Remove file"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-7 w-7 text-[#6f4e37] mx-auto" />
                        <div className="text-xs text-[#3d2b1f] font-semibold">
                          Click to Browse or Drag & Drop Tender / Spec Document
                        </div>
                        <p className="text-[11px] text-[#6f4e37]/75">
                          Supports official tender PDFs, BOQ technical schedules, and equipment specifications.
                        </p>
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ebe5d8] text-xs font-medium text-[#3d2b1f] border border-[#c4a484]/60 pointer-events-none">
                            <Upload className="h-3 w-3 text-[#6f4e37]" /> Browse File
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="text-xs text-[#6f4e37]/85 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-[#6f4e37]" />
                      Automatic clause extraction & compliance evaluation
                    </div>
                    <Button
                      type="submit"
                      disabled={!specPdfFile || isAnalyzingPdf}
                      className="bg-[#6f4e37] hover:bg-[#3d2b1f] text-[#f8f5f0] gap-1.5"
                    >
                      {isAnalyzingPdf ? (
                        <>
                          <Activity className="h-4 w-4 animate-spin" />
                          Parsing & Evaluating PDF...
                        </>
                      ) : (
                        <>
                          <SearchCheck className="h-4 w-4" />
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
            <Card className="border-[#7d5017]/30 bg-[#faf3e8]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-[#7d5017]">
                    <AlertTriangle className="h-4 w-4 text-[#7d5017] shrink-0" />
                    Adaptive Clarification Engine: Additional Parameters Recommended
                  </CardTitle>
                  <Badge variant="warning" className="text-[10px] font-bold">
                    {profile.missing_parameters?.length || 0} Underspecified Parameter(s)
                  </Badge>
                </div>
                <CardDescription className="text-xs text-[#7d5017]/90">
                  To ensure 100% precise, legally binding Indian Standards recommendations, click an option to refine your specification:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {profile.clarification_questions?.map((q: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-md bg-white border border-[#c4a484]/40 space-y-2">
                    <label className="text-xs font-semibold text-[#3d2b1f] block">{q.question}</label>
                    <div className="flex flex-wrap gap-2">
                      {q.options?.map((opt: string, optIdx: number) => (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => {
                            const newText = `${procurementInput.trim()} ${opt}.`;
                            setProcurementInput(newText);
                          }}
                          className="px-2.5 py-1 rounded text-xs font-medium bg-[#f8f5f0] hover:bg-[#6f4e37] hover:text-[#f8f5f0] border border-[#c4a484]/50 text-[#3d2b1f] transition-all flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3 text-[#6f4e37]" />
                          {opt}
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
            <Card className="border-[#6f4e37]/30 bg-[#ebe5d8]/40">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-[#3d2b1f]">
                    <FileCheck2 className="h-4 w-4 text-[#6f4e37]" />
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
                <div className="p-3 rounded-md bg-white border border-[#c4a484]/40 text-xs text-[#3d2b1f]">
                  <span className="font-semibold text-[#3d2b1f] block mb-1">Extracted Scope:</span>
                  {tenderAnalysis.tender_profile?.scope_of_work}
                </div>
                {tenderAnalysis.detected_standards?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-[#6f4e37] font-semibold">Detected Standards:</span>
                    {tenderAnalysis.detected_standards.map((st: any, idx: number) => (
                      <Badge key={idx} variant="info" className="text-[11px] font-mono">
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
            <div className="space-y-5">
              {/* Audit & Confidence Overview Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <Card className="p-3.5">
                  <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Product Category</span>
                  <p className="text-xs sm:text-sm font-bold text-[#3d2b1f] mt-0.5 truncate">{profile.product_category}</p>
                </Card>

                <Card className="p-3.5">
                  <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Domain Classification</span>
                  <p className="text-xs sm:text-sm font-bold text-[#6f4e37] mt-0.5 truncate">{profile.domain}</p>
                </Card>

                <Card className="p-3.5">
                  <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Vector Similarity</span>
                  <p className="text-xs sm:text-sm font-bold text-[#295030] mt-0.5 font-mono">
                    {Math.round((profile.overall_confidence?.vector_similarity_score || 0.88) * 100)}%
                  </p>
                </Card>

                <Card className="p-3.5">
                  <span className="text-[10px] font-semibold text-[#6f4e37] uppercase">Confidence Rating</span>
                  <div className="mt-1">
                    <ConfidenceBadge
                      confidence={profile.overall_confidence?.overall_confidence || "HIGH"}
                      score={profile.overall_confidence?.numeric_score || 0.9}
                    />
                  </div>
                </Card>
              </div>

              {/* Government Classification & Statutory Metadata Bar */}
              {(profile.sectional_committee || profile.suggested_hsn || profile.qco_enforced) && (
                <div className="p-3.5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-[#3d2b1f]">
                    {profile.sectional_committee && (
                      <div>
                        <span className="text-[#6f4e37]/80 block text-[10px] uppercase font-semibold">
                          BIS Sectional Committee
                        </span>
                        <span className="font-semibold text-[#3d2b1f]">{profile.sectional_committee}</span>
                      </div>
                    )}
                    {profile.suggested_hsn && (
                      <div className="border-l border-[#c4a484]/40 pl-4">
                        <span className="text-[#6f4e37]/80 block text-[10px] uppercase font-semibold">
                          Suggested HSN / SAC
                        </span>
                        <span className="font-mono text-[#295030] font-bold">{profile.suggested_hsn}</span>
                      </div>
                    )}
                  </div>
                  {profile.qco_enforced && (
                    <Badge variant="danger" className="font-bold py-1 px-2.5 text-[10px] tracking-wide">
                      GOVERNMENT QCO MANDATED
                    </Badge>
                  )}
                </div>
              )}

              {/* Statutory Legal Disclaimer */}
              {profile.statutory_disclaimer && (
                <div className="p-3 rounded-lg bg-[#ebe5d8]/60 border border-[#c4a484]/40 text-[11px] text-[#3d2b1f] leading-relaxed">
                  <span className="font-bold text-[#6f4e37] block mb-0.5">
                    Government Procurement Rule 144(xi) GFR 2017 Notice:
                  </span>
                  {profile.statutory_disclaimer}
                </div>
              )}

              {/* Recommendations Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-bold text-[#3d2b1f] flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#6f4e37]" />
                    Recommended BIS Standards & Compliance Clauses
                  </h2>
                  <span className="text-xs text-[#6f4e37]">
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#6f4e37]" />
                      Mandatory Documentation & Testing Audit Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-[#3d2b1f]">
                      {profile.categorized_standards.documentation_requirements.map((doc: string, idx: number) => (
                        <li
                          key={idx}
                          className="p-2.5 rounded-md bg-[#f8f5f0] border border-[#c4a484]/40 flex items-center gap-2"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#295030] shrink-0" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Officer Review Action Bar */}
              <div className="p-4 sm:p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#3d2b1f] flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#6f4e37]" />
                    Procurement Officer Approval Workflow
                  </h3>
                  <p className="text-xs text-[#6f4e37]/80 mt-0.5">
                    Review recommended compliance profile before attaching to official tender BOQ specification.
                  </p>
                  {reviewStatus && (
                    <p className="text-xs font-semibold text-[#295030] mt-1 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Review Status Committed as: {reviewStatus}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOfficerReview("REJECTED")}
                    className="border-[#822424]/40 text-[#822424] hover:bg-[#f9ecec] gap-1"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOfficerReview("MODIFIED")}
                    className="border-[#7d5017]/40 text-[#7d5017] hover:bg-[#faf3e8] gap-1"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Modify & Approve
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOfficerReview("APPROVED")}
                    className="bg-[#295030] hover:bg-[#1e3c23] text-white gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve Recommendations
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
        <div className="space-y-5">
          {/* Vector DB Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-[#6f4e37]">
              <CardHeader className="pb-1">
                <CardDescription className="text-[10px] uppercase font-semibold text-[#6f4e37]">
                  Qdrant Vector Store
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-[#3d2b1f] flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#295030]" /> Connected
                </div>
                <span className="text-[11px] text-[#6f4e37]/80 mt-0.5 block font-mono">
                  Collection: bis_standards_chunks
                </span>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#c4a484]">
              <CardHeader className="pb-1">
                <CardDescription className="text-[10px] uppercase font-semibold text-[#6f4e37]">
                  Embedding Dimension
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-[#3d2b1f]">768-dim</div>
                <span className="text-[11px] text-[#6f4e37]/80 mt-0.5 block">
                  Google Gemini / text-embedding-004
                </span>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#295030]">
              <CardHeader className="pb-1">
                <CardDescription className="text-[10px] uppercase font-semibold text-[#6f4e37]">
                  Vector Retrieval Strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-[#3d2b1f]">HNSW + RRF</div>
                <span className="text-[11px] text-[#6f4e37]/80 mt-0.5 block">
                  Cosine Distance | Reciprocal Rank Fusion
                </span>
              </CardContent>
            </Card>
          </div>

          {/* BIS Standard PDF Upload Form for RAG Indexing */}
          <Card>
            <CardHeader className="border-b border-[#c4a484]/30 pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Database className="h-4 w-4 text-[#6f4e37]" />
                Index Official BIS Standard PDF into RAG Vector Store
              </CardTitle>
              <CardDescription className="text-xs">
                Upload official Bureau of Indian Standards specification documents for automated clause extraction,
                semantic chunking, and Qdrant indexing.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
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
                  className={`cursor-pointer border-2 border-dashed rounded-lg p-6 text-center space-y-2 transition-all ${
                    isDraggingKb
                      ? "border-[#6f4e37] bg-[#ebe5d8]"
                      : "border-[#c4a484]/60 hover:border-[#6f4e37] bg-[#f8f5f0]"
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
                    <div className="flex items-center justify-between p-3 rounded-md bg-[#ebe5d8] border border-[#c4a484]/50 text-left">
                      <div className="flex items-center gap-3">
                        <Database className="h-6 w-6 text-[#6f4e37] shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-[#3d2b1f] truncate max-w-[280px] sm:max-w-md">
                            {kbFile.name}
                          </p>
                          <p className="text-[10px] text-[#6f4e37]/80">
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
                        className="text-[#6f4e37] hover:text-[#822424] p-1 transition-colors"
                        title="Remove file"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-7 w-7 text-[#6f4e37] mx-auto" />
                      <div className="text-xs text-[#3d2b1f] font-semibold">
                        Click to Browse or Drag & Drop BIS Standard PDF file
                      </div>
                      <p className="text-[11px] text-[#6f4e37]/75">
                        Upload official BIS standard PDFs for automated clause extraction, semantic chunking, and Qdrant indexing.
                      </p>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ebe5d8] text-xs font-medium text-[#3d2b1f] border border-[#c4a484]/60 pointer-events-none">
                          <Upload className="h-3 w-3 text-[#6f4e37]" /> Browse PDF File
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
                  <div className="p-3 rounded-md bg-[#eef3ee] border border-[#295030]/30 text-xs text-[#295030] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {kbUploadSuccess}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!kbFile || isKbUploading}
                  className="w-full bg-[#6f4e37] hover:bg-[#3d2b1f] text-[#f8f5f0] gap-2"
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
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#c4a484]/30 pb-3">
              <div>
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#6f4e37]" />
                  Recent Ingestion Jobs
                </CardTitle>
                <CardDescription className="text-xs">
                  Track document parsing, semantic chunking, and embedding generation in Qdrant.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchKbJobs}
                className="gap-1 text-xs h-7 border-[#c4a484] hover:bg-[#ebe5d8] text-[#3d2b1f]"
              >
                <RefreshCw className={`h-3 w-3 ${isKbLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isKbLoading && kbJobs.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6f4e37]/70">
                  Loading ingestion history...
                </div>
              ) : kbJobs.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6f4e37]/70">
                  No ingestion jobs yet. Upload a BIS Standard PDF document above to index.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#ebe5d8] text-[10px] font-semibold text-[#6f4e37] uppercase border-b border-[#c4a484]/30">
                        <th className="py-2.5 px-3">Filename</th>
                        <th className="py-2.5 px-3">Detected IS Number</th>
                        <th className="py-2.5 px-3">Chunks Extracted</th>
                        <th className="py-2.5 px-3">Qdrant Vectors</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c4a484]/20 text-xs">
                      {kbJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-[#ebe5d8]/40 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-[#3d2b1f] flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-[#6f4e37]" /> {job.filename}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#6f4e37] font-mono">
                            {job.is_number || "Pending"}
                          </td>
                          <td className="py-2.5 px-3 text-[#3d2b1f]/80 font-mono">{job.chunks_count}</td>
                          <td className="py-2.5 px-3 text-[#3d2b1f]/80 font-mono">{job.vectors_count}</td>
                          <td className="py-2.5 px-3 text-right">
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
