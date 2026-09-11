'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { BranchRequestDraft } from '@/types/branch.types';

interface RequestBranchesModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { requestedCount: number; message: string }) => void;
  licensedBranches: number;
  currentBranchCount: number;
}

export default function RequestBranchesModal({
  open,
  onClose,
  onSubmit,
  licensedBranches,
  currentBranchCount,
}: RequestBranchesModalProps) {
  const [requestedCount, setRequestedCount] = useState(1);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(requestedCount) || requestedCount < 1) {
      setError('Enter at least 1 additional branch');
      return;
    }
    setError('');
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    onSubmit({ requestedCount, message: message.trim() });
    setSaving(false);
    setRequestedCount(1);
    setMessage('');
    toast.success('Branch request sent to Platform Admin');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Request Branches</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Licensed {licensedBranches} · Current {currentBranchCount}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Additional branches needed
            </label>
            <input
              type="number"
              min={1}
              value={requestedCount}
              onChange={(e) => {
                setRequestedCount(Number(e.target.value));
                setError('');
              }}
              className={`h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] ${
                error ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Message <span className="font-medium normal-case text-slate-400">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Why do you need more branches?"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white hover:brightness-95 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export type { BranchRequestDraft };
