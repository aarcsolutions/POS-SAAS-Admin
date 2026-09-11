'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, LogOut, UserRound } from 'lucide-react';
import { useLogoutMutation } from '@/hooks/auth';

export default function HeaderAccountMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const logoutMutation = useLogoutMutation();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-[var(--admin-border)] bg-white text-[var(--brand-primary-dark)] transition hover:bg-[var(--brand-primary-soft)]"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white py-1 shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)]"
        >
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-[var(--brand-primary-dark)] transition hover:bg-[var(--brand-primary-soft)]"
          >
            <UserRound className="h-4 w-4 text-[var(--brand-primary)]" />
            My Account
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={logoutMutation.isPending}
            onClick={() => {
              setOpen(false);
              logoutMutation.mutate();
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-[var(--brand-primary-dark)] transition hover:bg-[var(--brand-primary-soft)] disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 text-[var(--brand-primary)]" />
            {logoutMutation.isPending ? 'Signing out...' : 'Logout'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
