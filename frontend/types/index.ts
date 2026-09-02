export type RoleName = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'PROCUREMENT_OFFICER' | 'APPROVER' | 'AUDITOR';

export type StandardStatus = 'ACTIVE' | 'REVISED' | 'WITHDRAWN' | 'DRAFT';
export type CertificationRequirement = 'MANDATORY' | 'VOLUNTARY' | 'REGULATED';

export interface User {
  id: string;
  email: string;
  full_name: string;
  designation?: string;
  phone_number?: string;
  organization_id?: string;
  organization_name?: string;
  roles: RoleName[];
  is_active: boolean;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  domain?: string;
  address?: string;
  contact_email: string;
  is_active: boolean;
  created_at: string;
}

export interface StandardVersion {
  id: string;
  version_number: string;
  publication_date: string;
  summary_of_changes?: string;
  document_url?: string;
}

export interface Amendment {
  id: string;
  amendment_number: number;
  release_date: string;
  title: string;
  description?: string;
}

export interface Standard {
  id: string;
  is_number: string;
  title: string;
  scope: string;
  domain: string;
  category: string;
  status: StandardStatus;
  revision_date?: string;
  certification_requirement: CertificationRequirement;
  keywords?: string[];
  issuing_committee?: string;
  ic_code?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  versions?: StandardVersion[];
  amendments?: Amendment[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
