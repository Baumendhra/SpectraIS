"use client";

import React from "react";
import { Search, Bell, Building2, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export const Header: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <header className="h-14 bg-[#ebe5d8] border-b border-[#c4a484]/40 px-5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-80 sm:w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6f4e37]/60" />
          <input
            type="text"
            placeholder="Search IS Standards, Tenders, or Clauses..."
            className="w-full bg-[#f8f5f0] border border-[#c4a484]/60 rounded-md pl-9 pr-3 py-1.5 text-xs text-[#3d2b1f] placeholder:text-[#6f4e37]/50 focus:outline-none focus:border-[#6f4e37] focus:ring-1 focus:ring-[#6f4e37] transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Active Organization Badge */}
        <div className="hidden md:flex items-center gap-2 bg-[#f8f5f0] border border-[#c4a484]/50 rounded-md px-2.5 py-1">
          <Building2 className="h-3.5 w-3.5 text-[#6f4e37]" />
          <span className="text-xs font-medium text-[#3d2b1f]">
            {user?.organization_name || "Ministry of Housing & Urban Affairs"}
          </span>
        </div>

        {/* System Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#eef3ee] border border-[#295030]/25">
          <span className="h-2 w-2 rounded-full bg-[#295030]" />
          <span className="text-[11px] font-semibold text-[#295030]">BIS Grounded Engine</span>
        </div>

        {/* Notifications */}
        <button className="relative p-1.5 text-[#6f4e37] hover:text-[#3d2b1f] hover:bg-[#dfd5c3]/50 rounded-md transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#6f4e37]" />
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 border-l border-[#c4a484]/40 pl-3">
          <div className="h-7 w-7 rounded-md bg-[#6f4e37] flex items-center justify-center text-[#f8f5f0] text-xs font-bold shadow-xs">
            {user?.full_name?.charAt(0) || "U"}
          </div>
        </div>
      </div>
    </header>
  );
};
