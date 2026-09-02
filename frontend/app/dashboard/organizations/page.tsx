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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-400" /> Tenant Organizations
          </h1>
          <p className="text-xs text-slate-400">
            Multi-tenant government department organizations and ministries setup
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Tenant Organization
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading organizations...</div>
        ) : (
          orgs.map((org) => (
            <Card key={org.id} className="space-y-3">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{org.name}</CardTitle>
                    <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">{org.code}</span>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span>{org.contact_email}</span>
                </div>
                {org.domain && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-slate-500" />
                    <span>{org.domain}</span>
                  </div>
                )}
                {org.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
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
