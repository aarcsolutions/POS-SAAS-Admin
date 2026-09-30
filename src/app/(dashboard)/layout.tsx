'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Store,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ChevronDown,
  Boxes,
  Wallet,
} from 'lucide-react';
import {
  MODULE_ICON_MAP,
  MODULE_HREF_BY_SLUG,
  getTenantSidebarOrderIndex,
  SIDEBAR_HIDDEN_MODULE_SLUGS,
  INVENTORY_GROUP_SLUGS,
  INVENTORY_SIDEBAR_CHILDREN,
  FINANCE_GROUP_SLUGS,
  FINANCE_SIDEBAR_CHILDREN,
  normalizeSidebarSlug,
} from '@/data/sidebar';
import { useAuthStore } from '@/store/authStore';
import { PermissionBoundary } from '@/components/rbac/PermissionBoundary';
import { authApi } from '@/services/auth';
import { useUIStore } from '@/store/uiStore';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { OrderSocketProvider } from '@/components/realtime/OrderSocketProvider';
import NotificationBell from '@/components/notifications/NotificationBell';
import HeaderAccountMenu from '@/components/layout/HeaderAccountMenu';
import { useAdminTheme } from '@/components/providers/ThemeProvider';
import { useMenuPendingCountsQuery } from '@/hooks/dashboard';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';

const SECTIONED_MODULES = new Set(['roles', 'permissions', 'modules']);

function formatMenuCount(n: number) {
  if (n <= 0) return null;
  return n > 99 ? '99+' : String(n);
}

/** Map API module_slug → Next.js page path (never use permission.route as href) */
function resolveModuleHref(moduleSlug: string): string {
  return (
    MODULE_HREF_BY_SLUG[moduleSlug] || `/${moduleSlug.replace(/_/g, '-')}`
  );
}

type NavItem = {
  label: string;
  href: string;
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
  count?: number;
  children?: NavItem[];
};

function pathMatchesHref(pathname: string, href: string) {
  const pathOnly = href.split('?')[0];
  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}

function SidebarNav({
  modules,
  collapsed,
  onNavigate,
}: {
  modules: NavItem[];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const navClasses = (active: boolean) =>
    `flex items-center gap-3 rounded-[26px] text-sm font-medium transition-all ${
      active
        ? 'bg-[var(--brand-primary)] text-white shadow-[0_20px_45px_color-mix(in_srgb,var(--brand-primary)_18%,transparent)]'
        : 'text-[var(--admin-sidebar-text)] hover:bg-[#ffffff1a] hover:text-white'
    } ${collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}`;

  const elements: React.ReactNode[] = [];
  let lastSection: string | undefined;

  modules.forEach((item) => {
    const Icon = item.icon;
    const countLabel = formatMenuCount(item.count || 0);
    const childActive = (item.children || []).some((c) =>
      pathMatchesHref(pathname, c.href)
    );
    const isActive = pathMatchesHref(pathname, item.href) || childActive;
    const groupKey = item.slug;
    const expanded =
      openGroups[groupKey] ?? (childActive || isActive);

    if (!collapsed && item.section && item.section !== lastSection) {
      lastSection = item.section;
      elements.push(
        <div
          key={`section-${item.section}`}
          className="mt-4 px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-[var(--admin-sidebar-text)]/70"
        >
          {item.section}
        </div>
      );
    }

    if (item.children && item.children.length > 0) {
      elements.push(
        <div key={`group-${item.slug}`} className="space-y-1">
          <button
            type="button"
            title={collapsed ? item.label : undefined}
            className={`${navClasses(isActive && collapsed)} w-full`}
            onClick={() => {
              if (collapsed) {
                const target = item.children?.[0]?.href || item.href;
                router.push(target);
                onNavigate?.();
                return;
              }
              setOpenGroups((prev) => ({
                ...prev,
                [groupKey]: !(prev[groupKey] ?? expanded),
              }));
            }}
          >
            <span className="relative shrink-0">
              <Icon className="h-4 w-4" />
            </span>
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 truncate text-left">
                  {item.label}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    expanded ? 'rotate-180' : ''
                  }`}
                />
              </>
            )}
          </button>
          {!collapsed && expanded && (
            <div className="ml-3 space-y-0.5 border-l border-white/15 pl-2">
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                const childIsActive = pathMatchesHref(pathname, child.href);
                const childCount = formatMenuCount(child.count || 0);
                return (
                  <Link
                    key={`${child.href}-${child.label}`}
                    href={child.href}
                    className={navClasses(childIsActive)}
                    onClick={onNavigate}
                  >
                    <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">
                      {child.label}
                    </span>
                    {childCount && (
                      <span
                        className={`ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                          childIsActive
                            ? 'bg-white/20 text-white'
                            : 'bg-white text-[var(--brand-primary-dark)]'
                        }`}
                      >
                        {childCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
      return;
    }

    elements.push(
      <Link
        key={item.href}
        href={item.href}
        title={
          collapsed
            ? countLabel
              ? `${item.label} (${countLabel})`
              : item.label
            : undefined
        }
        className={navClasses(isActive)}
        onClick={onNavigate}
      >
        <span className="relative shrink-0">
          <Icon className="h-4 w-4" />
          {collapsed && countLabel && (
            <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-0.5 text-[9px] font-bold text-[var(--brand-primary-dark)]">
              {countLabel}
            </span>
          )}
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {countLabel && (
              <span
                className={`ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-[var(--brand-primary-dark)]'
                }`}
              >
                {countLabel}
              </span>
            )}
          </>
        )}
      </Link>
    );
  });

  return <nav className="space-y-1">{elements}</nav>;
}

function SidebarBrand({
  portalName,
  collapsed,
  onToggle,
  logoUrl,
}: {
  portalName: string;
  collapsed: boolean;
  onToggle?: () => void;
  logoUrl?: string | null;
}) {
  return (
    <div className={`mb-6 ${collapsed ? 'px-0' : ''}`}>
      <div
        className={`flex items-center gap-3 ${
          collapsed ? 'flex-col justify-center' : ''
        }`}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={portalName}
            className={`shrink-0 rounded-2xl bg-white object-contain p-1.5 shadow-[0_16px_45px_color-mix(in_srgb,var(--brand-primary)_24%,transparent)] ${
              collapsed ? 'h-11 w-11' : 'h-14 w-auto max-w-[180px]'
            }`}
          />
        ) : (
          <>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-[var(--brand-primary)] text-white shadow-[0_16px_45px_color-mix(in_srgb,var(--brand-primary)_24%,transparent)]">
              <Store className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold uppercase tracking-[0.18em] text-[var(--admin-sidebar-text)]">
                  {portalName}
                </p>
                <p className="text-xs text-[var(--admin-sidebar-text)]/80">
                  Admin
                </p>
              </div>
            )}
          </>
        )}
        {logoUrl && !collapsed ? <div className="min-w-0 flex-1" /> : null}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Toggle sidebar"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[var(--admin-sidebar-text)] transition-colors hover:bg-[#ffffff1a] hover:text-white ${
              collapsed ? 'mt-1' : ''
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function SidebarUserCard({
  collapsed,
  userName,
  userRole,
}: {
  collapsed: boolean;
  userName?: string;
  userRole?: string;
}) {
  return (
    <div className={`mt-auto ${collapsed ? 'px-2 pb-4' : 'px-6 pb-6'}`}>
      <div
        className={`rounded-[28px] border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)] backdrop-blur-sm ${
          collapsed ? 'p-2' : 'p-4'
        }`}
      >
        <div
          className={`flex items-center gap-3 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary-soft)] text-[var(--brand-primary-dark)] font-bold shadow-sm">
            {userName?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--admin-sidebar-text)]">
                {userName || 'Administrator'}
              </p>
              <p className="text-xs text-[var(--admin-sidebar-text)]/80">
                {userRole || 'Admin'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, modulesWithPermisssions, permissions } = useAuthStore();
  const [headerReady, setHeaderReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resolvedTenantName, setResolvedTenantName] = useState(
    user?.tenantName || ''
  );
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  const portalName = resolvedTenantName || user?.tenantName || 'Tenant Portal';
  const { theme } = useAdminTheme();
  const logoUrl = theme?.logo_url || null;

  // Avoid hydration noise from browser extensions that inject attrs (fdprocessedid)
  useEffect(() => {
    setHeaderReady(true);
  }, []);

  useEffect(() => {
    if (user?.tenantName) {
      setResolvedTenantName(user.tenantName);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await authApi.getTenantInfo();
        if (!cancelled && res.status && res.data?.title) {
          setResolvedTenantName(res.data.title);
        }
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.tenantName]);

  useEffect(() => {
    document.title = portalName;
  }, [portalName]);

  const baseModules: NavItem[] = useMemo(() => {
    const hasPerm = (perm: string) => permissions.includes(perm);

    const items = modulesWithPermisssions.reduce<NavItem[]>((acc, module) => {
      const slug = normalizeSidebarSlug(module.module_slug);

      if (SIDEBAR_HIDDEN_MODULE_SLUGS.has(slug)) {
        return acc;
      }
      // Inventory / Finance parents are injected below from child permissions
      if ((INVENTORY_GROUP_SLUGS as readonly string[]).includes(slug)) {
        return acc;
      }
      if ((FINANCE_GROUP_SLUGS as readonly string[]).includes(slug)) {
        return acc;
      }

      const menuPermission = module.permissions.find(
        (permission) =>
          permission.is_Show_in_menu &&
          permission.is_allowed &&
          permission.route
      );

      if (!menuPermission) {
        return acc;
      }

      acc.push({
        label: module.module_name,
        slug,
        href: resolveModuleHref(slug),
        icon: MODULE_ICON_MAP[slug] ?? MODULE_ICON_MAP[module.module_slug] ?? LayoutDashboard,
        section: SECTIONED_MODULES.has(slug) ? 'Access Control' : undefined,
      });
      return acc;
    }, []);

    const inventoryChildren = INVENTORY_SIDEBAR_CHILDREN.filter((child) => {
      if (hasPerm(child.permission)) return true;
      // Purchase Orders falls back to suppliers list if getAllPurchases missing
      if (
        child.href.includes('tab=purchases') &&
        hasPerm(ENTITY_PERMS.suppliers.list)
      ) {
        return true;
      }
      return false;
    }).map((child) => ({
      label: child.label,
      href: child.href,
      slug: child.slug,
      icon: child.icon,
    }));

    const showInventoryParent =
      hasPerm('inventory/getAll') ||
      hasPerm('raw-materials/getAll') ||
      hasPerm('inventory-items/getAll') ||
      hasPerm('suppliers/getAll') ||
      inventoryChildren.length > 0;

    if (showInventoryParent && inventoryChildren.length > 0) {
      items.push({
        label: 'Inventory Management',
        slug: 'inventory',
        href: '/inventory',
        icon: Boxes,
        children: inventoryChildren,
      });
    }

    const financeChildren = FINANCE_SIDEBAR_CHILDREN.filter((child) =>
      hasPerm(child.permission)
    ).map((child) => ({
      label: child.label,
      href: child.href,
      slug: child.slug,
      icon: child.icon,
    }));

    const showFinanceParent =
      hasPerm('finance/getAll') ||
      hasPerm('finance-accounts/getAll') ||
      hasPerm('cash-registers/getAll') ||
      hasPerm('finance-transactions/getAll') ||
      hasPerm('expenses/getAll') ||
      hasPerm('finance-reports/getAll') ||
      hasPerm('finance-payables/getAll') ||
      hasPerm('finance-receivables/getAll') ||
      hasPerm('finance-reconciliation/getAll') ||
      hasPerm('finance-periods/getAll') ||
      financeChildren.length > 0;

    if (showFinanceParent && financeChildren.length > 0) {
      items.push({
        label: 'Finance Management',
        slug: 'finance',
        href: '/finance',
        icon: Wallet,
        children: financeChildren,
      });
    }

    return items.sort(
      (a, b) =>
        getTenantSidebarOrderIndex(a.slug) -
          getTenantSidebarOrderIndex(b.slug) ||
        a.label.localeCompare(b.label)
    );
  }, [modulesWithPermisssions, permissions]);

  return (
    <AuthGuard>
      <OrderSocketProvider>
        <DashboardShell
          pathname={pathname}
          portalName={portalName}
          logoUrl={logoUrl}
          userName={user?.name}
          userRole={user?.role}
          collapsed={collapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          headerReady={headerReady}
          baseModules={baseModules}
        >
          {children}
        </DashboardShell>
      </OrderSocketProvider>
    </AuthGuard>
  );
}

/** Mounted only after AuthGuard — pending counts query lives here. */
function DashboardShell({
  children,
  pathname,
  portalName,
  logoUrl,
  userName,
  userRole,
  collapsed,
  setSidebarCollapsed,
  mobileOpen,
  setMobileOpen,
  headerReady,
  baseModules,
}: {
  children: React.ReactNode;
  pathname: string;
  portalName: string;
  logoUrl?: string | null;
  userName?: string;
  userRole?: string;
  collapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  headerReady: boolean;
  baseModules: NavItem[];
}) {
  const canDashboard = usePermission(ENTITY_PERMS.dashboard.overview);
  const { data: pendingCountsRes } = useMenuPendingCountsQuery(canDashboard);
  const pendingCounts = pendingCountsRes?.data;

  const visibleModules = useMemo(() => {
    if (!pendingCounts) return baseModules;
    return baseModules.map((item) => ({
      ...item,
      count:
        Number(
          pendingCounts[item.slug] ??
            pendingCounts[item.slug.replace(/_/g, '-')] ??
            0
        ) || 0,
      children: item.children?.map((child) => ({
        ...child,
        count:
          Number(
            pendingCounts[child.slug] ??
              pendingCounts[child.slug.replace(/_/g, '-')] ??
              0
          ) || 0,
      })),
    }));
  }, [baseModules, pendingCounts]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--admin-bg)] text-[var(--brand-primary-dark)]">
      {/* Desktop sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 hidden h-screen overflow-hidden border-r border-[var(--admin-border)] bg-[var(--brand-primary-dark)] shadow-[6px_0_30px_rgba(0,0,0,0.08)] transition-[width] duration-300 lg:flex lg:flex-col ${
          collapsed ? 'w-20' : 'w-[280px]'
        }`}
      >
        <div className={`pt-7 pb-2 ${collapsed ? 'px-2' : 'px-6'}`}>
          <SidebarBrand
            portalName={portalName}
            collapsed={collapsed}
            logoUrl={logoUrl}
            onToggle={() => setSidebarCollapsed(!collapsed)}
          />
        </div>

        <div
          className={`flex-1 overflow-y-auto py-2 ${
            collapsed ? 'px-2' : 'px-5'
          }`}
        >
          <SidebarNav modules={visibleModules} collapsed={collapsed} />
        </div>

        <SidebarUserCard
          collapsed={collapsed}
          userName={userName}
          userRole={userRole}
        />
      </aside>

      {/* Main content */}
      <div
        className={`relative flex min-h-screen min-w-0 flex-col ${
          collapsed ? 'lg:pl-20' : 'lg:pl-[280px]'
        }`}
      >
        {/* Mobile top bar */}
        <div className="flex h-14 items-center gap-2 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 lg:hidden">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-white text-[var(--brand-primary-dark)]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={portalName}
                className="h-9 w-auto max-w-[140px] rounded-lg object-contain"
              />
            ) : (
              <div className="truncate text-sm font-semibold text-[var(--brand-primary-dark)]">
                {portalName}
              </div>
            )}
          </div>
        </div>

        {/* Desktop header */}
        <header className="sticky top-0 z-10 hidden border-b border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-surface)_90%,transparent)] shadow-sm backdrop-blur-sm lg:block">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-8">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
              {headerReady ? (
                <input
                  placeholder="Search finished goods, orders, or stock..."
                  className="h-11 w-full rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-12 text-sm text-[var(--brand-primary-dark)] outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary-soft)]"
                />
              ) : (
                <div
                  aria-hidden
                  className="h-11 w-full rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-surface)]"
                />
              )}
            </div>
            <div className="flex min-h-11 items-center gap-3">
              {headerReady ? (
                <>
                  <NotificationBell />
                  <HeaderAccountMenu />
                </>
              ) : (
                <>
                  <div
                    aria-hidden
                    className="h-11 w-11 rounded-[18px] border border-[var(--admin-border)] bg-white"
                  />
                  <div
                    aria-hidden
                    className="h-11 w-11 rounded-[18px] border border-[var(--admin-border)] bg-white"
                  />
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-6 sm:px-8">
          <PermissionBoundary pathname={pathname}>
            {children}
          </PermissionBoundary>
        </main>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[280px] max-w-[85%] flex-col overflow-hidden bg-[var(--brand-primary-dark)] shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-white/20 px-4">
              <div className="flex min-w-0 items-center gap-2">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={portalName}
                    className="h-9 w-auto max-w-[160px] rounded-lg bg-white object-contain p-0.5"
                  />
                ) : (
                  <div className="truncate text-sm font-semibold text-[var(--admin-sidebar-text)]">
                    {portalName}
                  </div>
                )}
              </div>
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 text-[var(--admin-sidebar-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
              <SidebarNav
                modules={visibleModules}
                collapsed={false}
                onNavigate={() => setMobileOpen(false)}
              />
              <SidebarUserCard
                collapsed={false}
                userName={userName}
                userRole={userRole}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
