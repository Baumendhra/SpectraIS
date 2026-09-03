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
  Info,
  Database
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
        keywords: [newDomain.toLowerCase(), newCategory.toLowerCase()],
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
    <div className="space-y-5 max-w-7xl mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-[#6f4e37]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#3d2b1f] tracking-tight">
              BIS Standards Repository
            </h1>
          </div>
          <p className="text-xs text-[#6f4e37]/80 mt-0.5">
            Comprehensive repository of Bureau of Indian Standards (BIS) IS Specifications & Amendments
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-1.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add New Standard
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-3.5 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6f4e37]/70" />
            <input
              type="text"
              placeholder="Search by IS number (e.g. IS 1363), title, or keywords..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#f8f5f0] border border-[#c4a484]/60 rounded-md pl-8 pr-3 py-1.5 text-xs text-[#3d2b1f] placeholder:text-[#6f4e37]/50 focus:outline-none focus:border-[#6f4e37] focus:ring-1 focus:ring-[#6f4e37]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={domainFilter}
              onChange={(e) => {
                setDomainFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#f8f5f0] border border-[#c4a484]/60 rounded-md px-2.5 py-1.5 text-xs text-[#3d2b1f] focus:outline-none focus:border-[#6f4e37]"
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
              className="bg-[#f8f5f0] border border-[#c4a484]/60 rounded-md px-2.5 py-1.5 text-xs text-[#3d2b1f] focus:outline-none focus:border-[#6f4e37]"
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
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#6f4e37]/70">
              Querying BIS Repository...
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="py-12 text-center space-y-1.5">
              <Info className="h-7 w-7 text-[#c4a484] mx-auto" />
              <div className="text-xs sm:text-sm font-semibold text-[#3d2b1f]">No Standards Found</div>
              <div className="text-[11px] text-[#6f4e37]/80">Try clearing search terms or selecting a different filter.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#c4a484]/30 text-[10px] font-semibold text-[#6f4e37] uppercase bg-[#ebe5d8]">
                    <th className="py-2.5 px-3.5">IS Number</th>
                    <th className="py-2.5 px-3.5">Title & Scope</th>
                    <th className="py-2.5 px-3.5">Domain</th>
                    <th className="py-2.5 px-3.5">Certification</th>
                    <th className="py-2.5 px-3.5">Status</th>
                    <th className="py-2.5 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4a484]/20 text-xs">
                  {data.items.map((std) => (
                    <tr key={std.id} className="hover:bg-[#ebe5d8]/40 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-[#6f4e37] font-mono whitespace-nowrap">
                        {std.is_number}
                      </td>
                      <td className="py-3 px-3.5 max-w-sm">
                        <div className="font-semibold text-[#3d2b1f] line-clamp-1">{std.title}</div>
                        <div className="text-[11px] text-[#6f4e37]/80 line-clamp-1 mt-0.5">{std.scope}</div>
                      </td>
                      <td className="py-3 px-3.5 text-[#3d2b1f]/80 whitespace-nowrap text-[11px]">
                        {std.domain}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <Badge variant={std.certification_requirement === "MANDATORY" ? "danger" : "info"}>
                          {std.certification_requirement}
                        </Badge>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <Badge variant={std.status === "ACTIVE" ? "success" : "warning"}>
                          {std.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStandard(std)}
                          className="h-7 text-xs border-[#c4a484] hover:bg-[#ebe5d8] text-[#3d2b1f]"
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
            <div className="p-3.5 border-t border-[#c4a484]/30 flex items-center justify-between text-xs text-[#6f4e37]/80 bg-[#f8f5f0]">
              <div>
                Showing Page <span className="font-semibold text-[#3d2b1f]">{data.page}</span> of{" "}
                <span className="font-semibold text-[#3d2b1f]">{data.pages}</span> ({data.total} total standards)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-7 text-xs border-[#c4a484] hover:bg-[#ebe5d8] text-[#3d2b1f]"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-7 text-xs border-[#c4a484] hover:bg-[#ebe5d8] text-[#3d2b1f]"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slide-over Detail Drawer */}
      {selectedStandard && (
        <div className="fixed inset-0 z-50 bg-[#3d2b1f]/30 flex justify-end">
          <div className="w-full max-w-xl bg-[#ebe5d8] h-full p-6 overflow-y-auto border-l border-[#c4a484]/50 space-y-5 shadow-elevated animate-in slide-in-from-right duration-150">
            <div className="flex items-center justify-between border-b border-[#c4a484]/40 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#6f4e37] uppercase tracking-wider">
                  BIS Standard Specification
                </span>
                <h2 className="text-base font-bold text-[#3d2b1f] font-mono">{selectedStandard.is_number}</h2>
              </div>
              <button
                onClick={() => setSelectedStandard(null)}
                aria-label="Close details"
                className="p-1 rounded text-[#6f4e37] hover:text-[#3d2b1f] hover:bg-[#dfd5c3]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#6f4e37] block mb-1">Standard Title</label>
                <p className="text-[#3d2b1f] bg-white p-3 rounded-md border border-[#c4a484]/40 leading-relaxed font-medium">
                  {selectedStandard.title}
                </p>
              </div>

              <div>
                <label className="font-semibold text-[#6f4e37] block mb-1">Scope & Technical Specification</label>
                <p className="text-[#3d2b1f]/90 bg-white p-3 rounded-md border border-[#c4a484]/40 leading-relaxed">
                  {selectedStandard.scope}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-white border border-[#c4a484]/40 space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-[#6f4e37]">Domain</span>
                  <div className="font-semibold text-[#3d2b1f]">{selectedStandard.domain}</div>
                </div>
                <div className="p-3 rounded-md bg-white border border-[#c4a484]/40 space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-[#6f4e37]">Category</span>
                  <div className="font-semibold text-[#3d2b1f]">{selectedStandard.category}</div>
                </div>
              </div>

              {selectedStandard.keywords && selectedStandard.keywords.length > 0 && (
                <div>
                  <label className="font-semibold text-[#6f4e37] block mb-1">Indexed Keywords</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStandard.keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white border border-[#c4a484]/40 text-[#6f4e37] text-[11px]">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedStandard.versions && selectedStandard.versions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#c4a484]/40">
                  <label className="font-semibold text-[#6f4e37] block">Version History</label>
                  {selectedStandard.versions.map((ver) => (
                    <div key={ver.id} className="p-2.5 rounded-md bg-white border border-[#c4a484]/40 space-y-1">
                      <div className="flex justify-between font-semibold text-[#3d2b1f]">
                        <span>{ver.version_number}</span>
                        <span className="text-[#6f4e37]/80">{formatDate(ver.publication_date)}</span>
                      </div>
                      <p className="text-[#6f4e37]/90 text-[11px]">{ver.summary_of_changes}</p>
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
        <div className="fixed inset-0 z-50 bg-[#3d2b1f]/35 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white p-6 rounded-lg border border-[#c4a484]/50 shadow-elevated space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#c4a484]/30 pb-3">
              <h3 className="font-bold text-sm sm:text-base text-[#3d2b1f]">Add New BIS Standard Entry</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close modal"
                className="text-[#6f4e37] hover:text-[#3d2b1f]"
              >
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
                <label className="text-xs font-medium text-[#3d2b1f]">Scope</label>
                <textarea
                  className="w-full bg-[#f8f5f0] border border-[#c4a484]/60 rounded-md p-2.5 text-xs text-[#3d2b1f] placeholder:text-[#6f4e37]/50 focus:outline-none focus:border-[#6f4e37] focus:ring-1 focus:ring-[#6f4e37] h-20 resize-none"
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

              <div className="flex justify-end gap-2 pt-3 border-t border-[#c4a484]/30">
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
