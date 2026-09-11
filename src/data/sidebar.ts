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
  CalendarDays,
  Star,
  UtensilsCrossed,
  LayoutGrid,
  Settings,
  Shield,
  CreditCard,
  Truck,
  UserRound,
  Users,
  ShoppingCart,
  Tags,
  Ticket,
  Palette,
  Globe,
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
    permission: 'business-settings/getAll',
  },
  {
    label: 'Theme',
    href: '/theme',
    icon: Palette,
    permission: 'theme/getAll',
  },
  {
    label: 'Website',
    href: '/website',
    icon: Globe,
    permission: 'website/getAll',
  },
  {
    label: 'Billing',
    href: '/billing',
    icon: CreditCard,
    permission: 'tenant-billing/myInvoices',
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
    label: 'KDS',
    href: '/kds',
    icon: ChefHat,
    permission: 'kds/getAll',
  },
  {
    label: 'Delivery Drivers',
    href: '/drivers',
    icon: UserRound,
    permission: 'drivers/getAll',
  },
  {
    label: 'Reservations',
    href: '/reservations',
    icon: CalendarDays,
    permission: 'reservations/getAll',
  },
  {
    label: 'Reviews',
    href: '/reviews',
    icon: Star,
    permission: 'reviews/getAll',
  },
  {
    label: 'Catering',
    href: '/catering',
    icon: UtensilsCrossed,
    permission: 'catering/getAll',
  },
  {
    label: 'Tables',
    href: '/tables',
    icon: LayoutGrid,
    permission: 'tables/getAll',
  },
  {
    label: 'Taxes',
    href: '/taxes',
    icon: ReceiptText,
    permission: 'taxes/getAll',
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
    label: 'Payments',
    href: '/payments',
    icon: ReceiptText,
    permission: 'payments/getAll',
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

/**
 * Fixed sidebar sequence for tenant admin.
 * Permission controls visibility; this array controls position.
 * Unknown slugs render at the end.
 */
export const TENANT_SIDEBAR_ORDER = [
  'dashboard',
  'orders',
  'kds',
  'reservations',
  'tables',
  'customers',
  'drivers',
  'catering',
  'products',
  'categories',
  'recipes',
  'raw-materials',
  'suppliers',
  'promo-codes',
  'payments',
  'taxes',
  'reports',
  'reviews',
  'branches',
  'business-settings',
  'theme',
  'website',
  'modules',
  'users',
  'roles',
  'permissions',
  'tenant-billing',
] as const;

/** Normalize API slugs (underscores / aliases) to TENANT_SIDEBAR_ORDER keys. */
const SIDEBAR_SLUG_ALIASES: Record<string, string> = {
  business_settings: 'business-settings',
  raw_materials: 'raw-materials',
  transactions: 'payments',
  inventory: 'raw-materials',
};

export function normalizeSidebarSlug(slug: string): string {
  const key = slug.trim();
  return SIDEBAR_SLUG_ALIASES[key] || key.replace(/_/g, '-');
}

export function getTenantSidebarOrderIndex(slug: string): number {
  const normalized = normalizeSidebarSlug(slug);
  const index = (TENANT_SIDEBAR_ORDER as readonly string[]).indexOf(normalized);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

/** JWT module_slug → dashboard route (one entry per licensed module). */
export const MODULE_HREF_BY_SLUG: Record<string, string> = {
  dashboard: '/dashboard',
  'business-settings': '/business-settings',
  business_settings: '/business-settings',
  theme: '/theme',
  website: '/website',
  'tenant-billing': '/billing',
  branches: '/branches',
  users: '/users',
  categories: '/categories',
  products: '/products',
  recipes: '/recipes',
  inventory: '/inventory',
  reports: '/reports',
  customers: '/customers',
  orders: '/orders',
  kds: '/kds',
  drivers: '/drivers',
  reservations: '/reservations',
  reviews: '/reviews',
  catering: '/catering',
  tables: '/tables',
  taxes: '/taxes',
  'promo-codes': '/promo-codes',
  'raw-materials': '/raw-materials',
  raw_materials: '/raw-materials',
  suppliers: '/suppliers',
  payments: '/payments',
  transactions: '/payments',
  roles: '/roles',
  permissions: '/permissions',
  modules: '/modules',
};

export const MODULE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  'business-settings': Settings,
  business_settings: Settings,
  theme: Palette,
  website: Globe,
  'tenant-billing': CreditCard,
  branches: Building2,
  users: Users,
  categories: Tags,
  products: Package,
  recipes: ChefHat,
  inventory: Boxes,
  reports: BarChart3,
  customers: BriefcaseBusiness,
  orders: ShoppingCart,
  kds: ChefHat,
  drivers: UserRound,
  reservations: CalendarDays,
  reviews: Star,
  catering: UtensilsCrossed,
  tables: LayoutGrid,
  taxes: ReceiptText,
  'promo-codes': Ticket,
  'raw-materials': Package,
  raw_materials: Package,
  suppliers: Truck,
  payments: ReceiptText,
  roles: Shield,
  permissions: Lock,
  modules: Boxes,
};
