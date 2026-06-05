import api from '../lib/api';

/**
 * Pure API functions for Authentication
 * TEMPORARILY MOCKED - Bypassing backend for local access
 */
export const authApi = {
  login: async (credentials: any) => {
    // MOCK: Return successful login without hitting backend
    return {
      status: true,
      statusCode: 200,
      message: "Login successful",
      data: {
        user: {
          id: "admin-001",
          email: credentials.email || "admin@pos.com",
          name: "Admin User",
          role: "admin"
        },
        access_token: "mock-local-access-token",
        refresh_token: "mock-local-refresh-token",
        modules: [
          {
            module_name: "Dashboard",
            module_slug: "dashboard",
            permissions: [
              { permission_name: "View", is_Show_in_menu: true, permission_slug: "view", route: "/dashboard", is_allowed: true }
            ]
          },
          {
            module_name: "Business Settings",
            module_slug: "business_settings",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/business-settings", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/business-settings", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/business-settings", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/business-settings", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/business-settings", is_allowed: true }
            ]
          },
          {
            module_name: "Branch Management",
            module_slug: "branches",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/branches", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/branches", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/branches", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/branches", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/branches", is_allowed: true }
            ]
          },
          {
            module_name: "User Management",
            module_slug: "users",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/users", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/users", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/users", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/users", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/users", is_allowed: true }
            ]
          },
          {
            module_name: "Product Management",
            module_slug: "products",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/products", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/products", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/products", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/products", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/products", is_allowed: true }
            ]
          },
          {
            module_name: "Inventory Management",
            module_slug: "inventory",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/inventory", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/inventory", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/inventory", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/inventory", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/inventory", is_allowed: true }
            ]
          },
          {
            module_name: "Sales & Reports",
            module_slug: "reports",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/reports", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/reports", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/reports", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/reports", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/reports", is_allowed: true }
            ]
          },
          {
            module_name: "Customers",
            module_slug: "customers",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/customers", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/customers", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/customers", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/customers", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/customers", is_allowed: true }
            ]
          },
          {
            module_name: "Suppliers",
            module_slug: "suppliers",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/suppliers", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/suppliers", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/suppliers", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/suppliers", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/suppliers", is_allowed: true }
            ]
          },
          {
            module_name: "Transactions",
            module_slug: "transactions",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/transactions", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/transactions", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/transactions", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/transactions", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/transactions", is_allowed: true }
            ]
          },
          {
            module_name: "Roles",
            module_slug: "roles",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/roles", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/roles", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/roles", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/roles", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/roles", is_allowed: true }
            ]
          },
          {
            module_name: "Permissions",
            module_slug: "permissions",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/permissions", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/permissions", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/permissions", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/permissions", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/permissions", is_allowed: true }
            ]
          },
          {
            module_name: "Modules",
            module_slug: "modules",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/modules", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/modules", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/modules", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/modules", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/modules", is_allowed: true }
            ]
          }
        ]
      }
    };
  },

  signup: async (data: any) => {
    // MOCK: Return successful signup without hitting backend
    return {
      status: true,
      statusCode: 201,
      message: "Account created successfully",
      data: {
        user: {
          id: "user-" + Math.random().toString(36).substr(2, 9),
          email: data.email,
          name: data.name,
          role: "admin"
        },
        access_token: "mock-signup-access-token",
        refresh_token: "mock-signup-refresh-token",
        modules: [
          {
            module_name: "Dashboard",
            module_slug: "dashboard",
            permissions: [
              { permission_name: "View", is_Show_in_menu: true, permission_slug: "view", route: "/dashboard", is_allowed: true }
            ]
          },
          {
            module_name: "Business Settings",
            module_slug: "business_settings",
            permissions: [
              { permission_name: "View", is_Show_in_menu: true, permission_slug: "getAll", route: "/business-settings", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create", route: "/business-settings", is_allowed: true },
              { permission_name: "Read", is_Show_in_menu: false, permission_slug: "getById", route: "/business-settings", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update", route: "/business-settings", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete", route: "/business-settings", is_allowed: true }
            ]
          },
          {
            module_name: "Branch Management",
            module_slug: "branches",
            permissions: [
              { permission_name: "View", is_Show_in_menu: true, permission_slug: "getAll", route: "/branches", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create", route: "/branches", is_allowed: true },
              { permission_name: "Read", is_Show_in_menu: false, permission_slug: "getById", route: "/branches", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update", route: "/branches", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete", route: "/branches", is_allowed: true }
            ]
          },
          {
            module_name: "User Management",
            module_slug: "users",
            permissions: [
              { permission_name: "View", is_Show_in_menu: true, permission_slug: "getAll", route: "/users", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create", route: "/users", is_allowed: true },
              { permission_name: "Read", is_Show_in_menu: false, permission_slug: "getById", route: "/users", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update", route: "/users", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete", route: "/users", is_allowed: true }
            ]
          },
          {
            module_name: "Product Management",
            module_slug: "products",
            permissions: [
              { permission_name: "View", is_Show_in_menu: true, permission_slug: "getAll", route: "/products", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create", route: "/products", is_allowed: true },
              { permission_name: "Read", is_Show_in_menu: false, permission_slug: "getById", route: "/products", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update", route: "/products", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete", route: "/products", is_allowed: true }
            ]
          },
          {
            module_name: "Inventory Management",
            module_slug: "inventory",
            permissions: [
              { permission_name: "View", is_Show_in_menu: true, permission_slug: "getAll", route: "/inventory", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create", route: "/inventory", is_allowed: true },
              { permission_name: "Read", is_Show_in_menu: false, permission_slug: "getById", route: "/inventory", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update", route: "/inventory", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete", route: "/inventory", is_allowed: true }
            ]
          },
          {
            module_name: "Sales & Reports",
            module_slug: "reports",
            permissions: [
              { permission_name: "View", is_Show_in_menu: true, permission_slug: "getAll", route: "/reports", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create", route: "/reports", is_allowed: true },
              { permission_name: "Read", is_Show_in_menu: false, permission_slug: "getById", route: "/reports", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update", route: "/reports", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete", route: "/reports", is_allowed: true }
            ]
          },
          {
            module_name: "Customers",
            module_slug: "customers",
            permissions: [
              { permission_name: "View", is_Show_in_menu: true, permission_slug: "getAll", route: "/customers", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create", route: "/customers", is_allowed: true },
              { permission_name: "Read", is_Show_in_menu: false, permission_slug: "getById", route: "/customers", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update", route: "/customers", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete", route: "/customers", is_allowed: true }
            ]
          },
          {
            module_name: "Suppliers",
            module_slug: "suppliers",
            permissions: [
              { permission_name: "View", is_Show_in_menu: true, permission_slug: "getAll", route: "/suppliers", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create", route: "/suppliers", is_allowed: true },
              { permission_name: "Read", is_Show_in_menu: false, permission_slug: "getById", route: "/suppliers", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update", route: "/suppliers", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete", route: "/suppliers", is_allowed: true }
            ]
          },
          {
            module_name: "Transactions",
            module_slug: "transactions",
            permissions: [
              { permission_name: "View", is_Show_in_menu: true, permission_slug: "getAll", route: "/transactions", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create", route: "/transactions", is_allowed: true },
              { permission_name: "Read", is_Show_in_menu: false, permission_slug: "getById", route: "/transactions", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update", route: "/transactions", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete", route: "/transactions", is_allowed: true }
            ]
          },
          {
            module_name: "Roles",
            module_slug: "roles",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/roles", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/roles", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/roles", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/roles", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/roles", is_allowed: true }
            ]
          },
          {
            module_name: "Permissions",
            module_slug: "permissions",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/permissions", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/permissions", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/permissions", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/permissions", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/permissions", is_allowed: true }
            ]
          },
          {
            module_name: "Modules",
            module_slug: "modules",
            permissions: [
              { permission_name: "View",   is_Show_in_menu: true,  permission_slug: "getAll",  route: "/modules", is_allowed: true },
              { permission_name: "Create", is_Show_in_menu: false, permission_slug: "create",  route: "/modules", is_allowed: true },
              { permission_name: "Read",   is_Show_in_menu: false, permission_slug: "getById", route: "/modules", is_allowed: true },
              { permission_name: "Update", is_Show_in_menu: false, permission_slug: "update",  route: "/modules", is_allowed: true },
              { permission_name: "Delete", is_Show_in_menu: false, permission_slug: "delete",  route: "/modules", is_allowed: true }
            ]
          }
        ]
      }
    };
  },
  
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
  
  me: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  refresh: async (refresh_token: string) => {
    const { data } = await api.post('/auth/refresh', { refresh_token });
    return data;
  }
};
