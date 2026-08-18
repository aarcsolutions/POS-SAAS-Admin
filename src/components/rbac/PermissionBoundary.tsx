'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ADMIN_LINK_PERM } from '@/rbac/link-permissions';

interface PermissionBoundaryProps {
  pathname: string;
  children: React.ReactNode;
}

export const PermissionBoundary: React.FC<PermissionBoundaryProps> = ({
  pathname,
  children,
}) => {
  const router = useRouter();
  const { hasPermission, isHydrated, setHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated) return;

    const markHydrated = () => useAuthStore.getState().setHydrated();

    if (useAuthStore.persist.hasHydrated()) {
      markHydrated();
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(markHydrated);
    // Fallback if persist callback never fires
    const timeout = window.setTimeout(markHydrated, 250);

    return () => {
      unsub();
      window.clearTimeout(timeout);
    };
  }, [isHydrated, setHydrated]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const requiredPermission = ADMIN_LINK_PERM[pathname];

  if (!requiredPermission || hasPermission(requiredPermission)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
        <ShieldOff className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
      <p className="mt-2 text-sm text-slate-500">
        You do not have permission to view this page.
      </p>
      <button
        onClick={() => router.push('/dashboard')}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
      >
        Return to Dashboard
      </button>
    </div>
  );
};
