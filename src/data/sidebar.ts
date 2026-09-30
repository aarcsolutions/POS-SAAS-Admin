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
  ClipboardList,
  Warehouse,
  Wallet,
  Landmark,
  Banknote,
  ArrowLeftRight,
  Receipt,
  PieChart,
  TrendingUp,
  Waves,
  FileBarChart,
  HandCoins,
  CircleDollarSign,
  Scale,
  CalendarRange,
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

/** Child entries under Inventory Management parent dropdown. */
export interface InventorySidebarChild {
  label: string;
  href: string;
  /** Module slug used for permission / count lookup */
  slug: string;
  permission: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const INVENTORY_GROUP_SLUGS = [
  'inventory',
  'raw-materials',
  'inventory-items',
  'suppliers',
] as const;

/** Nested under Inventory Management — hide from branch enable-module picker. */
export const INVENTORY_BRANCH_PICKER_HIDDEN_SLUGS = [
  'raw-materials',
  'inventory-items',
  'suppliers',
] as const;

export const INVENTORY_SIDEBAR_CHILDREN: InventorySidebarChild[] = [
  {
    label: 'Stock Overview',
    href: '/inventory',
    slug: 'inventory',
    permission: 'inventory/getAll',
    icon: Boxes,
  },
  {
    label: 'Raw Materials',
    href: '/raw-materials',
    slug: 'raw-materials',
    permission: 'raw-materials/getAll',
    icon: Package,
  },
  {
    label: 'Inventory Items',
    href: '/inventory-items',
    slug: 'inventory-items',
    permission: 'inventory-items/getAll',
    icon: Warehouse,
  },
  {
    label: 'Suppliers',
    href: '/suppliers',
    slug: 'suppliers',
    permission: 'suppliers/getAll',
    icon: Truck,
  },
  {
    label: 'Purchase Orders',
    href: '/suppliers?tab=purchases',
    slug: 'suppliers',
    permission: 'suppliers/getAllPurchases',
    icon: ClipboardList,
  },
];

/** Child entries under Finance Management parent dropdown. */
export type FinanceSidebarChild = InventorySidebarChild;

export const FINANCE_GROUP_SLUGS = [
  'finance',
  'finance-accounts',
  'cash-registers',
  'finance-transactions',
  'expenses',
  'finance-reports',
  'finance-payables',
  'finance-receivables',
  'finance-reconciliation',
  'finance-periods',
] as const;

/** Nested under Finance Management — hide from branch enable-module picker. */
export const FINANCE_BRANCH_PICKER_HIDDEN_SLUGS = [
  'finance-accounts',
  'cash-registers',
  'finance-transactions',
  'expenses',
  'finance-reports',
  'finance-payables',
  'finance-receivables',
  'finance-reconciliation',
  'finance-periods',
] as const;

export const FINANCE_SIDEBAR_CHILDREN: FinanceSidebarChild[] = [
  {
    label: 'Finance Dashboard',
    href: '/finance',
    slug: 'finance',
    permission: 'finance/getAll',
    icon: Wallet,
  },
  {
    label: 'Accounts',
    href: '/finance/accounts',
    slug: 'finance-accounts',
    permission: 'finance-accounts/getAll',
    icon: Landmark,
  },
  {
    label: 'Cash Register',
    href: '/finance/cash-registers',
    slug: 'cash-registers',
    permission: 'cash-registers/getAll',
    icon: Banknote,
  },
  {
    label: 'Transactions',
    href: '/finance/transactions',
    slug: 'finance-transactions',
    permission: 'finance-transactions/getAll',
    icon: ArrowLeftRight,
  },
  {
    label: 'Expenses',
    href: '/finance/expenses',
    slug: 'expenses',
    permission: 'expenses/getAll',
    icon: Receipt,
  },
  {
    label: 'COGS',
    href: '/finance/cogs',
    slug: 'finance-reports',
    permission: 'finance-reports/cogs',
    icon: PieChart,
  },
  {
    label: 'P&L',
    href: '/finance/profit-loss',
    slug: 'finance-reports',
    permission: 'finance-reports/profitLoss',
    icon: TrendingUp,
  },
  {
    label: 'Cash Flow',
    href: '/finance/cash-flow',
    slug: 'finance-reports',
    permission: 'finance-reports/cashFlow',
    icon: Waves,
  },
  {
    label: 'Financial Reports',
    href: '/finance/reports',
    slug: 'finance-reports',
    permission: 'finance-reports/getAll',
    icon: FileBarChart,
  },
  {
    label: 'Payables',
    href: '/finance/payables',
    slug: 'finance-payables',
    permission: 'finance-payables/getAll',
    icon: HandCoins,
  },
  {
    label: 'Receivables',
    href: '/finance/receivables',
    slug: 'finance-receivables',
    permission: 'finance-receivables/getAll',
    icon: CircleDollarSign,
  },
  {
    label: 'Bank Reconciliation',
    href: '/finance/reconciliation',
    slug: 'finance-reconciliation',
    permission: 'finance-reconciliation/getAll',
    icon: Scale,
  },
  {
    label: 'Periods',
    href: '/finance/periods',
    slug: 'finance-periods',
    permission: 'finance-periods/getAll',
    icon: CalendarRange,
  },
];

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
    label: 'Finance Management',
    href: '/finance',
    icon: Wallet,
    permission: 'finance/getAll',
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
 * Inventory children are nested under the `inventory` parent — do not list them here.
 * Finance children are nested under the `finance` parent — do not list them here.
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
  'inventory',
  'finance',
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

/** Modules with getAll that must not appear as standalone sidebar entries. */
export const SIDEBAR_HIDDEN_MODULE_SLUGS = new Set([
  'notifications',
  // Nested under Inventory Management parent
  'raw-materials',
  'inventory-items',
  'suppliers',
  // Nested under Finance Management parent
  'finance-accounts',
  'cash-registers',
  'finance-transactions',
  'expenses',
  'finance-reports',
  'finance-payables',
  'finance-receivables',
  'finance-reconciliation',
  'finance-periods',
]);

/** Normalize API slugs (underscores / aliases) to TENANT_SIDEBAR_ORDER keys. */
const SIDEBAR_SLUG_ALIASES: Record<string, string> = {
  business_settings: 'business-settings',
  raw_materials: 'raw-materials',
  inventory_items: 'inventory-items',
  transactions: 'payments',
};

export function normalizeSidebarSlug(slug: string): string {
  const key = slug.trim();
  return SIDEBAR_SLUG_ALIASES[key] || key.replace(/_/g, '-');
}

export function getTenantSidebarOrderIndex(slug: string): number {
  const normalized = normalizeSidebarSlug(slug);
  // Inventory children sort with the inventory parent group
  if (
    (INVENTORY_GROUP_SLUGS as readonly string[]).includes(normalized) &&
    normalized !== 'inventory'
  ) {
    return (TENANT_SIDEBAR_ORDER as readonly string[]).indexOf('inventory');
  }
  // Finance children sort with the finance parent group
  if (
    (FINANCE_GROUP_SLUGS as readonly string[]).includes(normalized) &&
    normalized !== 'finance'
  ) {
    return (TENANT_SIDEBAR_ORDER as readonly string[]).indexOf('finance');
  }
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
  'inventory-items': '/inventory-items',
  inventory_items: '/inventory-items',
  finance: '/finance',
  'finance-accounts': '/finance/accounts',
  'cash-registers': '/finance/cash-registers',
  'finance-transactions': '/finance/transactions',
  expenses: '/finance/expenses',
  'finance-reports': '/finance/reports',
  'finance-payables': '/finance/payables',
  'finance-receivables': '/finance/receivables',
  'finance-reconciliation': '/finance/reconciliation',
  'finance-periods': '/finance/periods',
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
  'inventory-items': Warehouse,
  inventory_items: Warehouse,
  finance: Wallet,
  'finance-accounts': Landmark,
  'cash-registers': Banknote,
  'finance-transactions': ArrowLeftRight,
  expenses: Receipt,
  'finance-reports': FileBarChart,
  'finance-payables': HandCoins,
  'finance-receivables': CircleDollarSign,
  'finance-reconciliation': Scale,
  'finance-periods': CalendarRange,
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
