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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
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
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              isDanger ? 'bg-rose-100' : 'bg-[#fde5c5]'
            }`}
          >
            {isDanger ? (
              <AlertCircle className="h-6 w-6 text-rose-600" />
            ) : (
              <Info className="h-6 w-6 text-[#d97706]" />
            )}
          </div>
          <div>
            <h2 id="app-dialog-title" className="text-xl font-bold text-[#3e2a18]">
              {active.title}
            </h2>
          </div>
        </div>

        <p id="app-dialog-desc" className="mb-6 text-sm text-slate-600">
          {active.message}
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {isConfirm && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200 sm:flex-none"
            >
              {active.cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            autoFocus
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition sm:flex-none ${
              isDanger
                ? 'bg-rose-600 shadow-rose-600/20 hover:bg-rose-700'
                : 'bg-[#d97706] shadow-[#d97706]/25 hover:bg-[#b45309]'
            }`}
          >
            {active.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
