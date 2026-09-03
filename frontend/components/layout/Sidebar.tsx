"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Network
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Executive Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "AI Recommendations & RAG", href: "/dashboard/recommendations", icon: SearchCheck },
  { name: "AI Copilot Chat", href: "/dashboard/copilot", icon: Bot },
  { name: "Gov Integrations", href: "/dashboard/integrations", icon: Network },
  { name: "AI Benchmark Eval", href: "/dashboard/evaluation", icon: BookOpenCheck },
  { name: "BIS Standards", href: "/dashboard/standards", icon: BookOpenCheck },
  { name: "Tenders & Compliance", href: "/dashboard/tenders", icon: FileCheck2 },
  { name: "User Management", href: "/dashboard/users", icon: Users, roles: ["SUPER_ADMIN", "ORG_ADMIN"] },
  { name: "Organizations", href: "/dashboard/organizations", icon: Building2, roles: ["SUPER_ADMIN"] },
  { name: "Audit Trail", href: "/dashboard/audit", icon: ShieldAlert, roles: ["SUPER_ADMIN", "AUDITOR"] },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const rawRoles = user?.roles || [];
  const userRoles: string[] = Array.isArray(rawRoles)
    ? rawRoles.map((r: any) => (typeof r === "string" ? r : r?.name || ""))
    : [];
  const isSuperAdmin = userRoles.includes("SUPER_ADMIN");

  const isItemVisible = (item: NavItem) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (isSuperAdmin) return true;
    return item.roles.some((r) => userRoles.includes(r));
  };

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-[#ebe5d8] border-r border-[#c4a484]/40 h-screen sticky top-0 z-30 flex flex-col justify-between select-none shadow-xs shrink-0">
      {/* Top Section: Brand & Navigation */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <Link
          href="/dashboard"
          className="h-14 px-4 flex items-center gap-3 border-b border-[#c4a484]/40 bg-[#ebe5d8] hover:bg-[#dfd5c3]/40 transition-colors"
        >
          <div className="h-8 w-8 rounded-md bg-[#6f4e37] flex items-center justify-center text-[#f8f5f0] shadow-xs shrink-0">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm text-[#3d2b1f] tracking-tight flex items-center gap-1 leading-none">
              Spectra<span className="text-[#6f4e37]">IS</span>
            </h1>
            <p className="text-[10px] text-[#6f4e37]/80 font-medium tracking-normal truncate mt-0.5">
              Standards Intelligence Platform
            </p>
          </div>
        </Link>

        {/* Scrollable Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1" aria-label="Main Navigation">
          {navigation.map((item) => {
            if (!isItemVisible(item)) return null;

            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all group relative",
                  isActive
                    ? "bg-[#6f4e37] text-[#f8f5f0] font-semibold shadow-xs"
                    : "text-[#3d2b1f]/85 hover:text-[#3d2b1f] hover:bg-[#dfd5c3]/60"
                )}
              >
                <span
                  className={cn(
                    "h-4 w-4 shrink-0 flex items-center justify-center transition-colors",
                    isActive ? "text-[#f8f5f0]" : "text-[#6f4e37] group-hover:text-[#3d2b1f]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer / Role Card */}
      <div className="p-3 border-t border-[#c4a484]/40 bg-[#ebe5d8] space-y-2 shrink-0">
        {user ? (
          <div className="p-2.5 rounded-md bg-[#f8f5f0] border border-[#c4a484]/50 shadow-xs flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-[#6f4e37] text-[#f8f5f0] flex items-center justify-center font-bold text-xs shrink-0">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-[#3d2b1f] truncate leading-tight">
                  {user.full_name}
                </span>
                <span className="text-[9px] font-bold uppercase px-1 py-0.2 rounded bg-[#ebe5d8] text-[#6f4e37] border border-[#c4a484]/50 shrink-0">
                  {userRoles[0] || "OFFICER"}
                </span>
              </div>
              <span className="text-[10px] text-[#6f4e37]/75 truncate block leading-tight font-mono">
                {user.email}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-2 rounded-md bg-[#f8f5f0] border border-[#c4a484]/50 text-center">
            <span className="text-[11px] text-[#6f4e37] font-medium">Session Active</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#6f4e37] hover:text-[#822424] hover:bg-[#f9ecec] rounded-md transition-colors border border-transparent hover:border-[#822424]/20"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
