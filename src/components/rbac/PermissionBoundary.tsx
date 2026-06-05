'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ADMIN_LINK_PERM } from '@/rbac/link-permissions';
import { ArrowLeft } from 'lucide-react';

interface PermissionBoundaryProps {
  pathname: string;
  children: React.ReactNode;
}

export const PermissionBoundary: React.FC<PermissionBoundaryProps> = ({
  pathname,
  children,
}) => {
  const router = useRouter();
  const { hasPermission, isAuthenticated } = useAuthStore();

  const requiredPermission = ADMIN_LINK_PERM[pathname];

  // If page doesn't require permission, or user has permission
  if (!requiredPermission || hasPermission(requiredPermission)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
        <ArrowLeft className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
      <p className="mt-2 text-sm text-slate-500">
        You do not have permission to view this page.
      </p>
      <button
        onClick={() => router.push('/dashboard')}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" /> Return to Dashboard
      </button>
    </div>
  );
};
