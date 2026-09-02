"use client";

import React from "react";
import { Search, Bell, Building2, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/Badge";

export const Header: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <header className="h-16 glass-panel border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search IS Standards, Tenders, or Clauses..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Active Organization Badge */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5">
          <Building2 className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-medium text-slate-300">
            {user?.organization_name || "Ministry of Housing & Urban Affairs"}
          </span>
        </div>

        {/* System Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-semibold text-emerald-400">BIS Engine Active</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20">
            {user?.full_name?.charAt(0) || "U"}
          </div>
        </div>
      </div>
    </header>
  );
};
