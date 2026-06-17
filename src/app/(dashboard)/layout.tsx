'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LogOut, Search, Store } from 'lucide-react';
import { SIDEBAR_MODULES } from '@/data/sidebar';
import { useAuthStore } from '@/store/authStore';
import { useLogoutMutation } from '@/hooks/auth';
import { PermissionBoundary } from '@/components/rbac/PermissionBoundary';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, hasPermission } = useAuthStore();
  const logoutMutation = useLogoutMutation();

  const navClasses = (path: string) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
      pathname === path || pathname.startsWith(`${path}/`)
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
        : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
    }`;

  const visibleModules = SIDEBAR_MODULES.filter((item) => item.public || hasPermission(item.permission));

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      <aside className="sticky top-0 flex h-screen w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="shrink-0 px-5 pt-6 pb-4">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Client Admin</div>
              <div className="text-xs text-slate-500">Business Owner Portal</div>
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

        <div className="shrink-0 border-t border-slate-100 p-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-700">
                {user?.name?.substring(0, 2).toUpperCase() || 'BO'}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {user?.name || 'Business Owner'}
                </div>
                <div className="text-xs text-slate-500">{user?.role || 'Admin'}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-8">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search products, users, branches, or reports..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
            <div className="ml-6 flex items-center gap-3">
              <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50">
                <Bell className="h-4 w-4" />
              </button>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                Logout
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
