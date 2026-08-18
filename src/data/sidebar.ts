import {
  BarChart3,
  Building2,
  Boxes,
  BriefcaseBusiness,
  ChefHat,
  LayoutDashboard,
  Lock,
  Package,
  ReceiptText,
  Settings,
  Shield,
  Truck,
  Users,
  ShoppingCart,
  Tags,
} from 'lucide-react';

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string;
  // if true, show in sidebar even if user permissions don't include the permission (useful for dev)
  public?: boolean;
  section?: string;
}

export const SIDEBAR_MODULES: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard/getAll',
  },
  {
    label: 'Business Settings',
    href: '/business-settings',
    icon: Settings,
    permission: 'business_settings/getAll',
  },
  {
    label: 'Branch Management',
    href: '/branches',
    icon: Building2,
    permission: 'branches/getAll',
  },
  {
    label: 'User Management',
    href: '/users',
    icon: Users,
    permission: 'users/getAll',
  },
  {
    label: 'Categories',
    href: '/categories',
    icon: Tags,
    permission: 'categories/getAll',
  },
  {
    label: 'Product Management',
    href: '/products',
    icon: Package,
    permission: 'products/getAll',
  },
  {
    label: 'Recipes',
    href: '/recipes',
    icon: ChefHat,
    permission: 'recipes/getAll',
  },
  {
    label: 'Inventory Management',
    href: '/inventory',
    icon: Boxes,
    permission: 'inventory/getAll',
  },
  {
    label: 'Sales & Reports',
    href: '/reports',
    icon: BarChart3,
    permission: 'reports/getAll',
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: BriefcaseBusiness,
    permission: 'customers/getAll',
  },
    {
      label: 'Orders',
      href: '/orders',
      icon: ShoppingCart,
      permission: 'orders/getAll',
    },
    {
      label: 'Raw Materials',
      href: '/raw-materials',
      icon: Package,
      permission: 'raw-materials/getAll',
    },
  {
    label: 'Suppliers',
    href: '/suppliers',
    icon: Truck,
    permission: 'suppliers/getAll',
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: ReceiptText,
    permission: 'transactions/getAll',
  },
  {
    label: 'Roles',
    href: '/roles',
    icon: Shield,
    permission: 'roles/getAll',
    section: 'Access Control',
  },
  {
    label: 'Permissions',
    href: '/permissions',
    icon: Lock,
    permission: 'permissions/getAll',
    section: 'Access Control',
  },
  {
    label: 'Modules',
    href: '/modules',
    icon: Boxes,
    permission: 'modules/getAll',
    section: 'Access Control',
  },
];

export const MODULE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  business_settings: Settings,
  branches: Building2,
  users: Users,
  categories: Tags,
  products: Package,
  recipes: ChefHat,
  inventory: Boxes,
  reports: BarChart3,
  customers: BriefcaseBusiness,
  orders: ShoppingCart,
  'raw-materials': Package,
  raw_materials: Package,
  suppliers: Truck,
  transactions: ReceiptText,
  roles: Shield,
  permissions: Lock,
  modules: Boxes,
};
