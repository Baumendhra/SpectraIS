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
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#6f4e37]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#3d2b1f] tracking-tight">
              User & Role Management
            </h1>
          </div>
          <p className="text-xs text-[#6f4e37]/80 mt-0.5">
            Manage system access across Super Admin, Org Admin, Procurement Officer, Approver, and Auditor roles
          </p>
        </div>
        <Button className="gap-1.5 self-start sm:self-auto">
          <UserPlus className="h-4 w-4" /> Provision New User
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#6f4e37]/70">Loading system users...</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6f4e37]/70">No registered users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#c4a484]/30 text-[10px] font-semibold text-[#6f4e37] uppercase bg-[#ebe5d8]">
                    <th className="py-2.5 px-3.5">User Name</th>
                    <th className="py-2.5 px-3.5">Email</th>
                    <th className="py-2.5 px-3.5">Designation</th>
                    <th className="py-2.5 px-3.5">Assigned Roles</th>
                    <th className="py-2.5 px-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4a484]/20 text-xs">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#ebe5d8]/40 transition-colors">
                      <td className="py-3 px-3.5 font-semibold text-[#3d2b1f] flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-[#ebe5d8] text-[#6f4e37] border border-[#c4a484]/40 flex items-center justify-center font-bold text-xs">
                          {u.full_name?.charAt(0) || "U"}
                        </div>
                        {u.full_name}
                      </td>
                      <td className="py-3 px-3.5 text-[#3d2b1f]/80 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-3.5 text-[#3d2b1f]/80">{u.designation || "N/A"}</td>
                      <td className="py-3 px-3.5">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r, i) => (
                            <Badge key={i} variant={r === "SUPER_ADMIN" ? "danger" : "info"} className="text-[10px]">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-right">
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
