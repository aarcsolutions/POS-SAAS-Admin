export type BranchStatus = 'active' | 'inactive';

export interface BranchPermissionOption {
  id: string;
  title: string;
  slug: string;
  is_allowed: boolean;
}

export interface BranchModuleOption {
  id: string;
  title: string;
  slug: string;
  permissions: BranchPermissionOption[];
}

/** Payload for branch create bootstrap (UI → later API). */
export interface BranchCreateBootstrapPayload {
  name: string;
  code: string;
  address: string;
  phone: string;
  status: BranchStatus;
  enabledModuleIds: string[];
  roleTitle: string;
  permissionIds: string[];
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  status: BranchStatus;
  enabledModuleIds: string[];
  enabledModuleTitles: string[];
  roleTitle: string;
  permissionIds: string[];
  adminName: string;
  adminEmail: string;
  createdAt: string;
}

export interface BranchRequestDraft {
  id: string;
  requestedCount: number;
  message: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}
