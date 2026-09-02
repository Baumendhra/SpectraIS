"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, Lock, Mail, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 items-center justify-center shadow-xl shadow-blue-500/25 mb-2">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Spectra<span className="text-blue-500">IS</span> Copilot
          </h1>
          <p className="text-xs text-slate-400">
            Government Procurement BIS Standards & Compliance Portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-slate-800 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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

            <Button type="submit" className="w-full py-2.5 text-sm" isLoading={isLoading}>
              Sign In to Portal <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Quick Role Switcher Demo */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
              Quick Role Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoRole("admin@mohua.gov.in", "Admin123!")}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-blue-500/50 hover:text-white transition-colors text-left"
              >
                <div className="font-semibold text-blue-400 text-[11px]">Super Admin</div>
                <div className="text-[10px] text-slate-500 truncate">admin@mohua.gov.in</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoRole("officer@mohua.gov.in", "Officer123!")}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-blue-500/50 hover:text-white transition-colors text-left"
              >
                <div className="font-semibold text-emerald-400 text-[11px]">Procurement Officer</div>
                <div className="text-[10px] text-slate-500 truncate">officer@mohua.gov.in</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          Protected by Enterprise JWT Authentication & RBAC Guards
        </p>
      </div>
    </div>
  );
}
