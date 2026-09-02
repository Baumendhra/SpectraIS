"use client";

import React, { useState, useEffect } from "react";
import { Upload, Database, Layers, CheckCircle2, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

interface IngestionJob {
  id: string;
  filename: string;
  is_number?: string;
  status: string;
  chunks_count: number;
  vectors_count: number;
  error_message?: string;
}

export default function KnowledgeBaseManagementPage() {
  const [jobs, setJobs] = useState<IngestionJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [domain, setDomain] = useState("Mechanical Engineering & Fasteners");
  const [category, setCategory] = useState("Fasteners & Industrial Hardware");
  const [isUploading, setIsUploading] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/ingestion/jobs");
      setJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("domain", domain);
    formData.append("category", category);

    try {
      await api.post("/ingestion/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSelectedFile(null);
      fetchJobs();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" /> BIS Knowledge Base & Vector Indexing
          </h1>
          <p className="text-xs text-slate-400">
            Ingest BIS PDF documents, extract structured clauses, generate embeddings, and manage Qdrant vector database.
          </p>
        </div>
        <Button variant="outline" onClick={fetchJobs} className="gap-2 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Status
        </Button>
      </div>

      {/* Vector DB Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-slate-400">Qdrant Vector Store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Connected
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Collection: bis_standards_chunks</span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-slate-400">Embedding Dimension</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">768-dim</div>
            <span className="text-xs text-slate-400 mt-1 block">Vertex AI text-embedding-004</span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-slate-400">Vector Search Strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">HNSW + RRF</div>
            <span className="text-xs text-slate-400 mt-1 block">Cosine Distance | Reciprocal Rank Fusion</span>
          </CardContent>
        </Card>
      </div>

      {/* PDF Upload Dropzone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload BIS Standard PDF Document</CardTitle>
          <CardDescription>Upload official BIS specification documents for automated clause extraction and vector indexing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl p-6 text-center space-y-2 bg-slate-900/40 transition-colors">
              <Upload className="h-8 w-8 text-blue-400 mx-auto" />
              <div className="text-xs text-slate-300 font-semibold">
                {selectedFile ? selectedFile.name : "Select or Drop BIS Standard PDF file here"}
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="pdf-upload-input"
              />
              <label htmlFor="pdf-upload-input" className="inline-block cursor-pointer">
                <Button type="button" variant="outline" size="sm">Browse File</Button>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Domain" value={domain} onChange={(e) => setDomain(e.target.value)} required />
              <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
            </div>

            <Button type="submit" isLoading={isUploading} disabled={!selectedFile} className="w-full">
              Process & Index Document into Qdrant
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Ingestion Jobs History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Ingestion Jobs</CardTitle>
          <CardDescription>Track status of document parsing, semantic chunking, and embedding creation.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading ingestion history...</div>
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
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-semibold text-slate-200 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-400" /> {job.filename}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-400">{job.is_number || "Pending"}</td>
                      <td className="py-3.5 px-4 text-slate-300">{job.chunks_count}</td>
                      <td className="py-3.5 px-4 text-slate-300">{job.vectors_count}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={job.status === "COMPLETED" ? "success" : job.status === "FAILED" ? "danger" : "warning"}>
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
  );
}
