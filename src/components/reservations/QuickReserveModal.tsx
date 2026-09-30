'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { useReservationTablesQuery } from '@/hooks/reservations';
import { useTenantBranchScope } from '@/hooks/branches';
import { useAuthStore } from '@/store/authStore';
import { QuickCreateReservationPayload } from '@/types/reservation.types';

type Props = {
  open: boolean;
  /** Pre-select table when opened from Tables page (decision B). */
  initialTableId?: string | null;
  /** Pre-select branch when opened from Tables (tenant admin). */
  initialBranchId?: string | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: QuickCreateReservationPayload) => Promise<void>;
};

export default function QuickReserveModal({
  open,
  initialTableId,
  initialBranchId,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const user = useAuthStore((s) => s.user);
  const { showBranchFilter, branchOptions } = useTenantBranchScope(open);

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [tableId, setTableId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setGuestName('');
    setGuestPhone('');
    setPartySize('2');
    setNotes('');
    setErrors({});
    setTableId(initialTableId || '');
    setBranchId(initialBranchId || user?.branchId || '');
  }, [open, initialTableId, initialBranchId, user?.branchId]);

  const tablesBranch =
    showBranchFilter ? branchId || undefined : undefined;

  const { data: tablesRes, isLoading: tablesLoading } =
    useReservationTablesQuery(tablesBranch, open);

  const tableOptions = useMemo(() => {
    const rows = tablesRes?.data || [];
    return rows
      .filter((t) => t.status === 'available' || t.id === tableId)
      .map((t) => ({
        value: t.id,
        label: t.code
          ? `${t.name} (${t.code}) · ${t.capacity ?? '?'} seats`
          : `${t.name} · ${t.capacity ?? '?'} seats`,
      }));
  }, [tablesRes, tableId]);

  if (!open) return null;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!guestName.trim()) next.guest_name = 'Name is required';
    if (!guestPhone.trim()) next.guest_phone = 'Phone is required';
    const size = Number(partySize);
    if (!Number.isFinite(size) || size < 1) {
      next.party_size = 'Guests must be at least 1';
    }
    if (showBranchFilter && !branchId) next.branch_id = 'Branch is required';
    if (!tableId) next.restaurant_table_id = 'Table is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      guest_name: guestName.trim(),
      guest_phone: guestPhone.trim(),
      party_size: Number(partySize),
      restaurant_table_id: tableId,
      notes: notes.trim() || null,
      branch_id: showBranchFilter ? branchId : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-reserve-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2
              id="quick-reserve-title"
              className="text-lg font-bold text-slate-900"
            >
              Quick Reserve
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Walk-in table hold — order can follow
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Customer name *
            </label>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
              autoFocus
            />
            {errors.guest_name && (
              <p className="mt-1 text-xs text-rose-600">{errors.guest_name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Phone number *
            </label>
            <input
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
              inputMode="tel"
            />
            {errors.guest_phone && (
              <p className="mt-1 text-xs text-rose-600">{errors.guest_phone}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Number of guests *
            </label>
            <input
              type="number"
              min={1}
              value={partySize}
              onChange={(e) => setPartySize(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
            />
            {errors.party_size && (
              <p className="mt-1 text-xs text-rose-600">{errors.party_size}</p>
            )}
          </div>

          {showBranchFilter && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Branch *
              </label>
              <Select
                value={branchId}
                onChange={(v) => {
                  setBranchId(v);
                  if (!initialTableId) setTableId('');
                }}
                size="lg"
                placeholder="Select branch"
                options={branchOptions}
              />
              {errors.branch_id && (
                <p className="mt-1 text-xs text-rose-600">{errors.branch_id}</p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Table *
            </label>
            {tablesLoading ? (
              <div className="flex h-10 items-center text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <Select
                value={tableId}
                onChange={setTableId}
                size="lg"
                placeholder="Select available table"
                options={tableOptions}
              />
            )}
            {errors.restaurant_table_id && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.restaurant_table_id}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Reserve table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
