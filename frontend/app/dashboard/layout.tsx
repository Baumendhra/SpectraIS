"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // Fetch profile on initial load if token exists
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!user) {
      api.get("/auth/me")
        .then((res) => {
          setUser(res.data.data);
        })
        .catch(() => {
          router.push("/login");
        });
    }
  }, [user, setUser, router]);

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex text-[#3d2b1f]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-4 sm:p-6 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
