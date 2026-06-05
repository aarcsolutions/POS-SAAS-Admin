export interface Permission {
  permission_name: string;
  is_Show_in_menu: boolean;
  permission_slug: string;
  route: string;
  is_allowed: boolean;
}

export interface ModulePermission {
  module_name: string;
  module_slug: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
    modules: ModulePermission[];
  };
}
