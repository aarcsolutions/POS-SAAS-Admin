import {
  BarChart3,
  Building2,
  Boxes,
  BriefcaseBusiness,
  LayoutDashboard,
  Lock,
  Package,
  ReceiptText,
  Settings,
  Shield,
  Truck,
  Users,
} from 'lucide-react';

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string;
  section?: string;
}

export const SIDEBAR_MODULES: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard/view',
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
    label: 'Product Management',
    href: '/products',
    icon: Package,
    permission: 'products/getAll',
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
