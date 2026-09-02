"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  BookOpen,
  Calendar,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Sparkles,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { Standard, PaginatedResponse } from "@/types";
import { formatDate } from "@/lib/utils";

export default function StandardsRepositoryPage() {
  const [data, setData] = useState<PaginatedResponse<Standard> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  // Drawer details state
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);

  // Add Standard Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newIsNumber, setNewIsNumber] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newScope, setNewScope] = useState("");
  const [newDomain, setNewDomain] = useState("Mechanical Engineering & Fasteners");
  const [newCategory, setNewCategory] = useState("Fasteners & Industrial Hardware");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStandards = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (domainFilter) params.append("domain", domainFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      params.append("page", page.toString());
      params.append("size", "10");

      const res = await api.get(`/standards?${params.toString()}`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStandards();
  }, [searchQuery, domainFilter, categoryFilter, page]);

  const handleCreateStandard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/standards", {
        is_number: newIsNumber,
        title: newTitle,
        scope: newScope,
        domain: newDomain,
        category: newCategory,
        status: "ACTIVE",
        certification_requirement: "MANDATORY",
        keywords: [newDomain.toLowerCase(), newCategory.toLowerCase()]
      });
      setIsAddModalOpen(false);
      setNewIsNumber("");
      setNewTitle("");
      setNewScope("");
      fetchStandards();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create standard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" /> BIS Standards Repository
          </h1>
          <p className="text-xs text-slate-400">
            Comprehensive repository of Bureau of Indian Standards (BIS) IS Specifications & Amendments
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add New Standard
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by IS number (e.g. IS 1363), title, or keywords..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={domainFilter}
              onChange={(e) => {
                setDomainFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Domains</option>
              <option value="Mechanical Engineering & Fasteners">Mechanical Engineering</option>
              <option value="Civil & Metallurgical Engineering">Civil & Steel</option>
              <option value="Electrical & Electronics">Electrical</option>
              <option value="Safety & Electrical Infrastructure">Safety & Infrastructure</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Fasteners & Industrial Hardware">Fasteners</option>
              <option value="Structural Steel & Metals">Structural Steel</option>
              <option value="Electrical Cables & Wiring">Cables & Wiring</option>
              <option value="Safety Equipment & Insulators">Safety Equipment</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Standards Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Querying BIS Repository...
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Info className="h-8 w-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No Standards Found</div>
              <div className="text-xs text-slate-500">Try clearing search terms or selecting a different filter.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase bg-slate-900/60">
                    <th className="py-3 px-4">IS Number</th>
                    <th className="py-3 px-4">Title & Scope</th>
                    <th className="py-3 px-4">Domain</th>
                    <th className="py-3 px-4">Certification</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {data.items.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-blue-400 whitespace-nowrap">{std.is_number}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100 line-clamp-1">{std.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{std.scope}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">{std.domain}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={std.certification_requirement === "MANDATORY" ? "danger" : "info"}>
                          {std.certification_requirement}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={std.status === "ACTIVE" ? "success" : "warning"}>
                          {std.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStandard(std)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {data && data.pages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing Page <span className="font-semibold text-white">{data.page}</span> of{" "}
                <span className="font-semibold text-white">{data.pages}</span> ({data.total} total standards)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slide-over Detail Drawer */}
      {selectedStandard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl glass-panel h-full p-6 overflow-y-auto border-l border-slate-800 space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">BIS Standard Specification</span>
                <h2 className="text-lg font-bold text-white">{selectedStandard.is_number}</h2>
              </div>
              <button
                onClick={() => setSelectedStandard(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Standard Title</label>
                <p className="text-slate-100 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed font-medium">
                  {selectedStandard.title}
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Scope & Technical Specification</label>
                <p className="text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {selectedStandard.scope}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Domain</span>
                  <div className="font-semibold text-slate-200">{selectedStandard.domain}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Category</span>
                  <div className="font-semibold text-slate-200">{selectedStandard.category}</div>
                </div>
              </div>

              {selectedStandard.keywords && selectedStandard.keywords.length > 0 && (
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Indexed Keywords</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStandard.keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedStandard.versions && selectedStandard.versions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="font-semibold text-slate-300 block">Version History</label>
                  {selectedStandard.versions.map((ver) => (
                    <div key={ver.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between font-semibold text-slate-200">
                        <span>{ver.version_number}</span>
                        <span>{formatDate(ver.publication_date)}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{ver.summary_of_changes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Standard Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Add New BIS Standard Entry</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStandard} className="space-y-3">
              <Input
                label="IS Number"
                placeholder="e.g. IS 1029: 2024"
                value={newIsNumber}
                onChange={(e) => setNewIsNumber(e.target.value)}
                required
              />
              <Input
                label="Title"
                placeholder="e.g. Hot Rolled Steel Bars Specification"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Scope</label>
                <textarea
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 h-20"
                  placeholder="Provide technical scope and applicability parameters..."
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Domain"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  required
                />
                <Input
                  label="Category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Save Standard
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
