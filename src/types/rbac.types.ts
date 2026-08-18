export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Role {
  id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
}

export interface RolesListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    roles: Role[];
    pagination: Pagination;
  };
}

export interface RoleDetailResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: Role;
}

export interface PermissionItem {
  id: string;
  title: string;
  slug: string;
  is_allowed: boolean;
}

export interface ModuleWithPermissions {
  id: string;
  title: string;
  slug: string;
  permissions: PermissionItem[];
}

export interface RolePermissionsResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    modulesWithPermissions: ModuleWithPermissions[];
  };
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role?: Role | null;
  role_id?: string;
}

export interface UsersListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    data?: ApiUser[];
    users?: ApiUser[];
    pagination: Pagination;
  };
}
