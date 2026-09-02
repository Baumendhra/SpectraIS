"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, Shield, CheckCircle, Mail, Phone, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { User } from "@/types";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/users")
      .then((res) => {
        setUsers(res.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" /> User & Role Management
          </h1>
          <p className="text-xs text-slate-400">
            Manage system access across Super Admin, Org Admin, Procurement Officer, Approver, and Auditor roles
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" /> Provision New User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">Loading system users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase bg-slate-900/60">
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Assigned Roles</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                          {u.full_name.charAt(0)}
                        </div>
                        {u.full_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{u.email}</td>
                      <td className="py-3.5 px-4 text-slate-400">{u.designation || "N/A"}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r, i) => (
                            <Badge key={i} variant={r === "SUPER_ADMIN" ? "danger" : "info"} className="text-[10px]">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={u.is_active ? "success" : "neutral"}>
                          {u.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
