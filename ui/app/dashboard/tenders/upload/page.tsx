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
    <div className="space-y-5 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5 text-[#6f4e37] hover:text-[#3d2b1f]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tenders
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b border-[#c4a484]/30 pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-[#6f4e37]" />
            Tender Document Upload & Compliance Intelligence Pipeline
          </CardTitle>
          <CardDescription className="text-xs">
            Upload procurement tenders (PDF, DOCX, TXT) for instant 0–100 compliance scoring, BIS gap analysis, risk assessment, and report generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
              dragActive
                ? "border-[#6f4e37] bg-[#ebe5d8]"
                : "border-[#c4a484]/60 bg-[#f8f5f0] hover:border-[#6f4e37]"
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 rounded-md bg-[#ebe5d8] text-[#6f4e37]">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#3d2b1f]">
                  {selectedFile ? selectedFile.name : "Click to select or drag and drop tender document"}
                </p>
                <p className="text-[11px] text-[#6f4e37]/80 mt-0.5">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze`
                    : "Supports technical specifications, RFPs, and BOQs up to 25MB"}
                </p>
              </div>
              {!selectedFile && (
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[#ebe5d8] text-[#3d2b1f] border border-[#c4a484]/50 pointer-events-none mt-2">
                  Browse Files
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-[#f9ecec] border border-[#822424]/30 text-xs text-[#822424] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                setError(null);
              }}
              disabled={!selectedFile || isUploading}
              className="border-[#c4a484] text-[#3d2b1f]"
            >
              Clear
            </Button>
            <Button
              onClick={handleUploadAndAnalyze}
              disabled={!selectedFile || isUploading}
              isLoading={isUploading}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Upload & Run Full Compliance Audit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
