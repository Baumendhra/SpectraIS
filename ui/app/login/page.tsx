"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("admin@mohua.gov.in");
  const [password, setPassword] = useState("Admin123!");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      const { access_token, refresh_token, user } = res.data.data;
      setAuth(user, access_token, refresh_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoRole = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-5 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-12 w-12 rounded-lg bg-[#6f4e37] text-[#f8f5f0] items-center justify-center shadow-sm mb-1">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#3d2b1f]">
            Spectra<span className="text-[#6f4e37]">IS</span> Copilot
          </h1>
          <p className="text-xs text-[#6f4e37]/80 font-medium">
            Government Procurement BIS Standards & Compliance Portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-lg p-6 shadow-card border border-[#c4a484]/40 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-[#f9ecec] border border-[#822424]/30 text-[#822424] text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <Input
              label="Email Address"
              type="email"
              placeholder="officer@gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full py-2 text-xs sm:text-sm font-semibold mt-2" isLoading={isLoading}>
              Sign In to Portal <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </form>

          {/* Quick Role Switcher Demo */}
          <div className="pt-3 border-t border-[#c4a484]/30 space-y-2">
            <span className="text-[10px] font-semibold text-[#6f4e37]/75 uppercase tracking-wider block text-center">
              Quick Role Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoRole("admin@mohua.gov.in", "Admin123!")}
                className="p-2 rounded-md bg-[#ebe5d8]/40 border border-[#c4a484]/40 text-[#3d2b1f] hover:bg-[#ebe5d8] transition-colors text-left"
              >
                <div className="font-semibold text-[#6f4e37] text-[11px]">Super Admin</div>
                <div className="text-[10px] text-[#6f4e37]/70 truncate">admin@mohua.gov.in</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoRole("officer@mohua.gov.in", "Officer123!")}
                className="p-2 rounded-md bg-[#ebe5d8]/40 border border-[#c4a484]/40 text-[#3d2b1f] hover:bg-[#ebe5d8] transition-colors text-left"
              >
                <div className="font-semibold text-[#295030] text-[11px]">Procurement Officer</div>
                <div className="text-[10px] text-[#6f4e37]/70 truncate">officer@mohua.gov.in</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#6f4e37]/70 font-medium">
          Protected by Enterprise JWT Authentication & RBAC Guards
        </p>
      </div>
    </div>
  );
}
