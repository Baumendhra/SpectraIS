"use client";

import React, { useState, useEffect } from "react";
import { Building2, Plus, Globe, Mail, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { Organization } from "@/types";

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/organizations")
      .then((res) => {
        setOrgs(res.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#6f4e37]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#3d2b1f] tracking-tight">Tenant Organizations</h1>
          </div>
          <p className="text-xs text-[#6f4e37]/80 mt-0.5">
            Multi-tenant government department organizations and ministries setup
          </p>
        </div>
        <Button className="gap-1.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Tenant Organization
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs text-[#6f4e37]/70">
            Loading organizations...
          </div>
        ) : orgs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-[#6f4e37]/70">
            No tenant organizations found.
          </div>
        ) : (
          orgs.map((org) => (
            <Card key={org.id} className="space-y-2.5">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm sm:text-base font-semibold text-[#3d2b1f]">{org.name}</CardTitle>
                    <span className="text-[10px] font-semibold text-[#6f4e37] uppercase tracking-wider font-mono">
                      {org.code}
                    </span>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs text-[#3d2b1f]/80 pt-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#6f4e37]" />
                  <span>{org.contact_email}</span>
                </div>
                {org.domain && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-[#6f4e37]" />
                    <span>{org.domain}</span>
                  </div>
                )}
                {org.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#6f4e37]" />
                    <span>{org.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
