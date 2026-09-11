'use client';

import React, { useEffect } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { useDialogStore } from '@/store/dialogStore';

export function AppDialog() {
  const active = useDialogStore((s) => s.active);
  const close = useDialogStore((s) => s.close);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (active.mode === 'confirm') {
          active.resolve(false);
        } else {
          active.resolve();
        }
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, close]);

  if (!active) return null;

  const isDanger = active.variant === 'danger';
  const isConfirm = active.mode === 'confirm';

  const handleConfirm = () => {
    if (active.mode === 'confirm') {
      active.resolve(true);
    } else {
      active.resolve();
    }
    close();
  };

  const handleCancel = () => {
    if (active.mode === 'confirm') {
      active.resolve(false);
      close();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[color-mix(in_srgb,var(--brand-primary-dark)_40%,transparent)] backdrop-blur-sm animate-in fade-in duration-200"
      role="presentation"
      onClick={isConfirm ? handleCancel : handleConfirm}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        aria-describedby="app-dialog-desc"
        className="w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-toast-soft)]">
            {isDanger ? (
              <AlertCircle className="h-6 w-6 text-[var(--brand-toast)]" />
            ) : (
              <Info className="h-6 w-6 text-[var(--brand-toast)]" />
            )}
          </div>
          <div>
            <h2
              id="app-dialog-title"
              className="text-xl font-bold text-[var(--brand-primary-dark)]"
            >
              {active.title}
            </h2>
          </div>
        </div>

        <p id="app-dialog-desc" className="mb-6 text-sm text-[var(--admin-muted)]">
          {active.message}
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {isConfirm && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-xl bg-[var(--admin-surface)] px-4 py-2.5 text-sm font-bold text-[var(--brand-primary-dark)] transition hover:bg-[var(--brand-primary-soft)] sm:flex-none"
            >
              {active.cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            autoFocus
            className="flex-1 rounded-xl bg-[var(--brand-toast)] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[color-mix(in_srgb,var(--brand-toast)_25%,transparent)] transition hover:brightness-95 sm:flex-none"
          >
            {active.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
