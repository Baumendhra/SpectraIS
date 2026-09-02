"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Database,
  BookOpenCheck,
  FileCheck2,
  Users,
  Building2,
  ShieldAlert,
  LogOut,
  Sparkles
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Procurement OS", href: "/dashboard/procurement-os", icon: LayoutDashboard },
  { name: "AI Command Center", href: "/dashboard/command-center", icon: Sparkles },
  { name: "Executive Analytics", href: "/dashboard/analytics", icon: Sparkles },
  { name: "AI Recommendations", href: "/dashboard/recommendations", icon: Sparkles },
  { name: "AI Copilot Chat", href: "/dashboard/copilot", icon: Bot },
  { name: "Supplier Intelligence", href: "/dashboard/suppliers", icon: Building2 },
  { name: "Gov Integrations", href: "/dashboard/integrations", icon: Building2 },
  { name: "AI Benchmark Eval", href: "/dashboard/evaluation", icon: BookOpenCheck },
  { name: "Knowledge Base & RAG", href: "/dashboard/knowledge", icon: Database },
  { name: "BIS Standards", href: "/dashboard/standards", icon: BookOpenCheck },
  { name: "Tenders & Compliance", href: "/dashboard/tenders", icon: FileCheck2 },
  { name: "User Management", href: "/dashboard/users", icon: Users, roles: ["SUPER_ADMIN", "ORG_ADMIN"] },
  { name: "Organizations", href: "/dashboard/organizations", icon: Building2, roles: ["SUPER_ADMIN"] },
  { name: "Audit Trail", href: "/dashboard/audit", icon: ShieldAlert, roles: ["SUPER_ADMIN", "AUDITOR"] },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const userRoles = user?.roles || [];

  return (
    <aside className="w-64 glass-panel flex flex-col justify-between border-r border-slate-800/80 h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
              Spectra<span className="text-blue-400">IS</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Compliance Copilot v2.0</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navigation.map((item) => {
            if (item.roles && !item.roles.some((r) => userRoles.includes(r as any) || userRoles.includes("SUPER_ADMIN"))) {
              return null;
            }
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                )}
              >
                <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-blue-400" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer / Role Card */}
      <div className="p-4 border-t border-slate-800/60 space-y-3">
        {user && (
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 truncate">{user.full_name}</span>
              <Badge variant="info" className="text-[10px] py-0 px-1.5 uppercase">
                {user.roles[0] || "USER"}
              </Badge>
            </div>
            <span className="text-[11px] text-slate-400 truncate">{user.email}</span>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
