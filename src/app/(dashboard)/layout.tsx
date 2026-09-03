'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  LogOut,
  Search,
  Store,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from 'lucide-react';
import Cookies from 'js-cookie';
import { MODULE_ICON_MAP, MODULE_HREF_BY_SLUG } from '@/data/sidebar';
import { useAuthStore } from '@/store/authStore';
import { useLogoutMutation } from '@/hooks/auth';
import { PermissionBoundary } from '@/components/rbac/PermissionBoundary';
import { authApi } from '@/services/auth';
import { useUIStore } from '@/store/uiStore';
import { AuthGuard } from '@/components/auth/AuthGuard';

const SECTIONED_MODULES = new Set(['roles', 'permissions', 'modules']);

/** Map API module_slug → Next.js page path (never use permission.route as href) */
function resolveModuleHref(moduleSlug: string): string {
  return (
    MODULE_HREF_BY_SLUG[moduleSlug] || `/${moduleSlug.replace(/_/g, '-')}`
  );
}

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
};

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

  const navClasses = (path: string) =>
    `flex items-center gap-3 rounded-[26px] text-sm font-medium transition-all ${
      pathname === path || pathname.startsWith(`${path}/`)
        ? 'bg-[#d97706] text-white shadow-[0_20px_45px_rgba(217,119,6,0.18)]'
        : 'text-[#fde4b6] hover:bg-[#ffffff1a] hover:text-white'
    } ${collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}`;

  const elements: React.ReactNode[] = [];
  let lastSection: string | undefined;

  modules.forEach((item) => {
    const Icon = item.icon;
    if (!collapsed && item.section && item.section !== lastSection) {
      lastSection = item.section;
      elements.push(
        <div
          key={`section-${item.section}`}
          className="mt-4 px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-[#f5d8a5]/70"
        >
          {item.section}
        </div>
      );
    }
    elements.push(
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={navClasses(item.href)}
        onClick={onNavigate}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  });

  return <nav className="space-y-1">{elements}</nav>;
}

function SidebarBrand({
  portalName,
  collapsed,
  onToggle,
}: {
  portalName: string;
  collapsed: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className={`mb-6 ${collapsed ? 'px-0' : ''}`}>
      <div
        className={`flex items-center gap-3 ${
          collapsed ? 'flex-col justify-center' : ''
        }`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-[#d97706] text-white shadow-[0_16px_45px_rgba(217,119,6,0.24)]">
          <Store className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold uppercase tracking-[0.18em] text-[#fde4b6]">
              {portalName}
            </p>
            <p className="text-xs text-[#f5d8a5]">Admin</p>
          </div>
        )}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Toggle sidebar"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#fde4b6] transition-colors hover:bg-[#ffffff1a] hover:text-white ${
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
        className={`rounded-[28px] border border-[#e6d3b2] bg-[#c68a4e]/10 backdrop-blur-sm ${
          collapsed ? 'p-2' : 'p-4'
        }`}
      >
        <div
          className={`flex items-center gap-3 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fde5c5] text-[#7a4e2b] font-bold shadow-sm">
            {userName?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#fff1db]">
                {userName || 'Administrator'}
              </p>
              <p className="text-xs text-[#f1d4aa]">{userRole || 'Admin'}</p>
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
  const { user, modulesWithPermisssions, setAuth } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  const sessionSynced = useRef(false);
  const [headerReady, setHeaderReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resolvedTenantName, setResolvedTenantName] = useState(
    user?.tenantName || ''
  );
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  const portalName = resolvedTenantName || user?.tenantName || 'Tenant Portal';

  // Avoid hydration noise from browser extensions that inject attrs (fdprocessedid)
  useEffect(() => {
    setHeaderReady(true);
  }, []);

  // Reload modules after Master Admin license changes (stale localStorage session)
  useEffect(() => {
    if (sessionSynced.current) return;
    const refreshToken = Cookies.get('refresh_token');
    if (!refreshToken) return;

    sessionSynced.current = true;
    (async () => {
      try {
        const res = await authApi.refresh(refreshToken);
        const payload = res?.data ?? res;
        if (payload?.access_token && payload?.user) {
          Cookies.set('access_token', payload.access_token);
          if (payload.refresh_token) {
            Cookies.set('refresh_token', payload.refresh_token);
          }
          setAuth(payload.user, payload.modules || []);
        }
      } catch {
        /* keep existing session */
      }
    })();
  }, [setAuth]);

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

  const visibleModules: NavItem[] = useMemo(
    () =>
      modulesWithPermisssions.reduce<NavItem[]>((acc, module) => {
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
          href: resolveModuleHref(module.module_slug),
          icon: MODULE_ICON_MAP[module.module_slug] ?? LayoutDashboard,
          section: SECTIONED_MODULES.has(module.module_slug)
            ? 'Access Control'
            : undefined,
        });
        return acc;
      }, []),
    [modulesWithPermisssions]
  );

  return (
    <AuthGuard>
    <div className="min-h-screen overflow-x-hidden bg-[#f7f1e6] text-[#3e2a18]">
      {/* Desktop sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 hidden h-screen overflow-hidden border-r border-[#ecd6b6] bg-[#5b3b1e] shadow-[6px_0_30px_rgba(0,0,0,0.08)] transition-[width] duration-300 lg:flex lg:flex-col ${
          collapsed ? 'w-20' : 'w-[280px]'
        }`}
      >
        <div
          className={`pt-7 pb-2 ${collapsed ? 'px-2' : 'px-6'}`}
        >
          <SidebarBrand
            portalName={portalName}
            collapsed={collapsed}
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
          userName={user?.name}
          userRole={user?.role}
        />
      </aside>

      {/* Main content */}
      <div
        className={`relative flex min-h-screen min-w-0 flex-col ${
          collapsed ? 'lg:pl-20' : 'lg:pl-[280px]'
        }`}
      >
        {/* Mobile top bar */}
        <div className="flex h-14 items-center gap-2 border-b border-[#ecd6b6] bg-[#fff7ee] px-4 lg:hidden">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#ecd6b6] bg-white text-[#7a553d]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="truncate text-sm font-semibold text-[#5b3b1e]">
            {portalName}
          </div>
        </div>

        {/* Desktop header */}
        <header className="sticky top-0 z-10 hidden border-b border-[#ecd6b6] bg-[#fff7ee]/90 shadow-sm backdrop-blur-sm lg:block">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-8">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a16f4f]" />
              {headerReady ? (
                <input
                  placeholder="Search finished goods, orders, or stock..."
                  className="h-11 w-full rounded-[28px] border border-[#ecd6b6] bg-[#fff4e6] px-12 text-sm text-[#5b3b1e] outline-none transition focus:border-[#d97706] focus:ring-2 focus:ring-[#fcd299]/60"
                />
              ) : (
                <div
                  aria-hidden
                  className="h-11 w-full rounded-[28px] border border-[#ecd6b6] bg-[#fff4e6]"
                />
              )}
            </div>
            <div className="flex min-h-11 items-center gap-3">
              {headerReady ? (
                <>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-[#ecd6b6] bg-white text-[#7a553d] shadow-sm transition hover:bg-[#fff0dc]"
                  >
                    <Bell className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="flex items-center gap-2 rounded-[18px] border border-[#ecd6b6] bg-white px-4 py-2 text-sm font-semibold text-[#7a553d] transition hover:bg-[#fff0dc] disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {logoutMutation.isPending ? 'Signing out...' : 'Logout'}
                  </button>
                </>
              ) : (
                <>
                  <div
                    aria-hidden
                    className="h-11 w-11 rounded-[18px] border border-[#ecd6b6] bg-white"
                  />
                  <div
                    aria-hidden
                    className="h-11 w-[96px] rounded-[18px] border border-[#ecd6b6] bg-white"
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
          <div className="absolute left-0 top-0 flex h-full w-[280px] max-w-[85%] flex-col overflow-hidden bg-[#5b3b1e] shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-[#ecd6b6]/30 px-4">
              <div className="truncate text-sm font-semibold text-[#fde4b6]">
                {portalName}
              </div>
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#ecd6b6]/40 text-[#fde4b6]"
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
                userName={user?.name}
                userRole={user?.role}
              />
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
