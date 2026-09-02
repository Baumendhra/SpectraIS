"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, CheckCircle2, Activity, AlertCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

export default function TenderUploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile || isUploading) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await api.post("/tenders-v2/upload-and-analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data;
      sessionStorage.setItem(`tender_analysis_${data.tender_id}`, JSON.stringify(data));
      router.push(`/dashboard/tenders/${data.tender_id}`);
    } catch (err: any) {
      console.error(err);
      setError("Failed to upload and analyze document. Please verify file format and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 text-slate-400">
          <ArrowLeft className="h-4 w-4" /> Back to Tenders
        </Button>
      </div>

      <Card className="glass-panel border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2.5">
            <UploadCloud className="h-6 w-6 text-blue-400" />
            Tender Document Upload & Compliance Intelligence Pipeline
          </CardTitle>
          <CardDescription className="text-xs">
            Upload procurement tenders (PDF, DOCX, TXT) for instant 0–100 compliance scoring, BIS gap analysis, risk assessment, and report generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragActive ? "border-blue-500 bg-blue-950/20" : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
              <UploadCloud className="h-12 w-12 text-blue-400 mx-auto animate-bounce" />
              <div>
                <p className="text-sm font-bold text-white">Drag & drop your tender document here</p>
                <p className="text-xs text-slate-400 mt-1">Supports PDF, Word (.docx), or plain text (.txt) up to 50MB</p>
              </div>
              <Badge variant="outline" className="text-xs border-slate-700">
                Browse Files
              </Badge>
            </label>
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-400" />
                <div>
                  <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400 font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "Document"}
                  </p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleUploadAndAnalyze}
              disabled={!selectedFile || isUploading}
              className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
            >
              {isUploading ? (
                <>
                  <Activity className="h-4 w-4 animate-spin" />
                  Running Document Intelligence & Gap Analysis...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Start Compliance Intelligence Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
