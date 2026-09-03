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
  ShieldCheck,
  BarChart3,
  SearchCheck,
  FileText
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Executive Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "AI Recommendations & RAG", href: "/dashboard/recommendations", icon: SearchCheck },
  { name: "AI Copilot Chat", href: "/dashboard/copilot", icon: Bot },
  { name: "Gov Integrations", href: "/dashboard/integrations", icon: Building2 },
  { name: "AI Benchmark Eval", href: "/dashboard/evaluation", icon: BookOpenCheck },
  { name: "BIS Standards", href: "/dashboard/standards", icon: Database },
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
    <aside className="w-64 bg-[#ebe5d8] flex flex-col justify-between border-r border-[#c4a484]/40 h-screen sticky top-0 z-30 select-none">
      <div className="flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="p-4 flex items-center gap-3 border-b border-[#c4a484]/40 bg-[#ebe5d8]">
          <div className="h-9 w-9 rounded-md bg-[#6f4e37] flex items-center justify-center text-[#f8f5f0] shadow-sm shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm tracking-tight text-[#3d2b1f] flex items-center gap-1">
              Spectra<span className="text-[#6f4e37]">IS</span>
            </h1>
            <p className="text-[10px] text-[#6f4e37]/80 font-medium tracking-tight truncate">
              BIS Procurement Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <div className="px-2 py-1 text-[10px] font-semibold text-[#6f4e37]/70 uppercase tracking-wider">
            Procurement Portal
          </div>
          {navigation.map((item) => {
            if (
              item.roles &&
              !item.roles.some((r) => userRoles.includes(r as any) || userRoles.includes("SUPER_ADMIN"))
            ) {
              return null;
            }
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all",
                  isActive
                    ? "bg-[#6f4e37] text-[#f8f5f0] shadow-sm font-semibold"
                    : "text-[#3d2b1f]/85 hover:text-[#3d2b1f] hover:bg-[#dfd5c3]/60"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-[#f8f5f0]" : "text-[#6f4e37]"
                  )}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer / Role Card */}
      <div className="p-3 border-t border-[#c4a484]/40 bg-[#ebe5d8]/70 space-y-2">
        {user && (
          <div className="p-2.5 rounded-md bg-[#f8f5f0] border border-[#c4a484]/50 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#3d2b1f] truncate">
                {user.full_name}
              </span>
              <Badge variant="neutral" className="text-[9px] py-0 px-1.5 uppercase font-semibold">
                {user.roles[0] || "OFFICER"}
              </Badge>
            </div>
            <span className="text-[10px] text-[#6f4e37]/75 truncate">{user.email}</span>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6f4e37] hover:text-[#822424] hover:bg-[#f9ecec] rounded-md transition-colors border border-transparent hover:border-[#822424]/20"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
