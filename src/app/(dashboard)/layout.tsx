'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LogOut, Search, Store, LayoutDashboard } from 'lucide-react';
import { SIDEBAR_MODULES, MODULE_ICON_MAP } from '@/data/sidebar';
import { useAuthStore } from '@/store/authStore';
import { useLogoutMutation } from '@/hooks/auth';
import { PermissionBoundary } from '@/components/rbac/PermissionBoundary';

const SECTIONED_MODULES = new Set(['roles', 'permissions', 'modules']);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, modulesWithPermisssions, hasPermission } = useAuthStore();
  const logoutMutation = useLogoutMutation();

  const navClasses = (path: string) =>
    `flex items-center gap-3 rounded-[26px] px-4 py-3 text-sm font-medium transition-all ${
      pathname === path || pathname.startsWith(`${path}/`)
        ? 'bg-[#d97706] text-white shadow-[0_20px_45px_rgba(217,119,6,0.18)]'
        : 'text-[#fde4b6] hover:bg-[#ffffff1a] hover:text-white'
    }`;

  const visibleModules = modulesWithPermisssions.length
    ? modulesWithPermisssions
        .map((module) => {
          const menuPermission = module.permissions.find(
            (permission) => permission.is_Show_in_menu && permission.is_allowed && permission.route
          );

          if (!menuPermission) {
            return null;
          }

          return {
            label: module.module_name,
            href: menuPermission.route,
            icon: MODULE_ICON_MAP[module.module_slug] ?? LayoutDashboard,
            section: SECTIONED_MODULES.has(module.module_slug) ? 'Access Control' : undefined,
          };
        })
        .filter(Boolean)
    : SIDEBAR_MODULES.filter((item) => item.public || hasPermission(item.permission));

  return (
    <div className="flex min-h-screen bg-[#f7f1e6] text-[#3e2a18]">
      <aside className="flex h-screen w-[280px] shrink-0 flex-col border-r border-[#ecd6b6] bg-[#5b3b1e] shadow-[6px_0_30px_rgba(0,0,0,0.08)]">
        <div className="px-6 py-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#d97706] text-white shadow-[0_16px_45px_rgba(217,119,6,0.24)]">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#fde4b6]">Baba Flour Mill</p>
              <p className="text-xs text-[#f5d8a5]">Master Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-5 py-2">
          {(() => {
            const elements: React.ReactNode[] = [];
            let lastSection: string | undefined;
            visibleModules.forEach((item) => {
              const Icon = item.icon;
              if (item.section && item.section !== lastSection) {
                lastSection = item.section;
                elements.push(
                  <div key={`section-${item.section}`} className="mt-4 px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {item.section}
                  </div>
                );
              }
              elements.push(
                <Link key={item.href} href={item.href} className={navClasses(item.href)}>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            });
            return elements;
          })()}
        </nav>

        <div className="mt-auto px-6 pb-6">
          <div className="rounded-[28px] border border-[#e6d3b2] bg-[#c68a4e]/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fde5c5] text-[#7a4e2b] font-bold shadow-sm">
                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#fff1db]">{user?.name || 'Administrator'}</p>
                <p className="text-xs text-[#f1d4aa]">{user?.role || 'Admin'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-[#ecd6b6] bg-[#fff7ee]/90 backdrop-blur-sm shadow-sm">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-8">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a16f4f]" />
              <input
                placeholder="Search finished goods, orders, or stock..."
                className="h-11 w-full rounded-[28px] border border-[#ecd6b6] bg-[#fff4e6] px-12 text-sm text-[#5b3b1e] outline-none transition focus:border-[#d97706] focus:ring-2 focus:ring-[#fcd299]/60"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-[#ecd6b6] bg-white text-[#7a553d] shadow-sm transition hover:bg-[#fff0dc]">
                <Bell className="h-4 w-4" />
              </button>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-2 rounded-[18px] border border-[#ecd6b6] bg-white px-4 py-2 text-sm font-semibold text-[#7a553d] transition hover:bg-[#fff0dc] disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {logoutMutation.isPending ? 'Signing out...' : 'Logout'}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-8 py-6">
          <PermissionBoundary pathname={pathname}>
            {children}
          </PermissionBoundary>
        </main>
      </div>
    </div>
  );
}
