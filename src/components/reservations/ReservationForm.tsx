'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, CalendarDays, Users, Phone } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { notifyError } from '@/utils/notify';
import { blockInvalidSubmit } from '@/utils/form-validation';
import {
  ReservationPayload,
  RESERVATION_STATUS_OPTIONS,
} from '@/types/reservation.types';

interface ReservationFormData {
  branch_id: string;
  customer_id: string;
  guest_name: string;
  guest_phone: string;
  restaurant_table_id: string;
  party_size: string;
  reserved_at: string;
  duration_minutes: string;
  status: string;
  notes: string;
}

interface Props {
  mode: 'create' | 'edit' | 'view';
  initialData?: Partial<ReservationFormData>;
  branchOptions?: Array<{ value: string; label: string }>;
  customerOptions?: Array<{ value: string; label: string }>;
  tableOptions?: Array<{ value: string; label: string }>;
  showBranchSelect?: boolean;
  saving?: boolean;
  onBranchChange?: (branchId: string) => void;
  onClose: () => void;
  onSubmit: (data: ReservationPayload) => Promise<void> | void;
}

const emptyData: ReservationFormData = {
  branch_id: '',
  customer_id: '',
  guest_name: '',
  guest_phone: '',
  restaurant_table_id: '',
  party_size: '2',
  reserved_at: '',
  duration_minutes: '90',
  status: 'pending',
  notes: '',
};

function toLocalDatetimeInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ReservationForm({
  mode,
  initialData,
  branchOptions = [],
  customerOptions = [],
  tableOptions = [],
  showBranchSelect = false,
  saving = false,
  onBranchChange,
  onClose,
  onSubmit,
}: Props) {
  const [data, setData] = useState<ReservationFormData>({
    ...emptyData,
    ...initialData,
    reserved_at: toLocalDatetimeInput(initialData?.reserved_at),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const readOnly = mode === 'view';

  useEffect(() => {
    if (initialData) {
      setData({
        ...emptyData,
        ...initialData,
        reserved_at: toLocalDatetimeInput(initialData.reserved_at),
      });
    }
  }, [initialData]);

  const update = <K extends keyof ReservationFormData>(
    key: K,
    value: ReservationFormData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const statusOptions = useMemo(
    () =>
      RESERVATION_STATUS_OPTIONS.map((s) => ({
        value: s.value,
        label: s.label,
      })),
    []
  );

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (showBranchSelect && !data.branch_id) {
      e.branch_id = 'Branch is required';
    }
    if (!data.customer_id && !data.guest_name.trim()) {
      e.guest_name = 'Guest name is required when no customer is selected';
    }
    if (!data.party_size || Number(data.party_size) < 1) {
      e.party_size = 'Party size must be at least 1';
    }
    if (!data.reserved_at) {
      e.reserved_at = 'Date and time are required';
    }
    setErrors(e);
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    const next = validate();
    if (!blockInvalidSubmit(next, notifyError)) return;

    const reservedAt = new Date(data.reserved_at);
    await onSubmit({
      branch_id: showBranchSelect ? data.branch_id : undefined,
      customer_id: data.customer_id || null,
      guest_name: data.guest_name.trim(),
      guest_phone: data.guest_phone.trim() || null,
      restaurant_table_id: data.restaurant_table_id || null,
      party_size: Number(data.party_size),
      reserved_at: reservedAt.toISOString(),
      duration_minutes: Number(data.duration_minutes) || 90,
      status: data.status as ReservationPayload['status'],
      notes: data.notes.trim() || null,
    });
  };

  const title =
    mode === 'create'
      ? 'Add Reservation'
      : mode === 'edit'
        ? 'Edit Reservation'
        : 'Reservation Details';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Reservations
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <CalendarDays className="h-4 w-4" /> Booking
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {showBranchSelect && (
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Branch
                </label>
                <Select
                  value={data.branch_id}
                  onChange={(value) => {
                    update('branch_id', value);
                    onBranchChange?.(value);
                  }}
                  disabled={readOnly}
                  placeholder="Select branch"
                  options={branchOptions}
                />
                {errors.branch_id && (
                  <p className="mt-1 text-xs text-rose-600">{errors.branch_id}</p>
                )}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Customer (optional)
              </label>
              <Select
                value={data.customer_id}
                onChange={(value) => update('customer_id', value)}
                disabled={readOnly}
                allowEmpty
                placeholder="Walk-in guest"
                options={customerOptions}
                searchable
                searchPlaceholder="Search customers…"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Table (optional)
              </label>
              <Select
                value={data.restaurant_table_id}
                onChange={(value) => update('restaurant_table_id', value)}
                disabled={readOnly}
                allowEmpty
                placeholder="No table assigned"
                options={tableOptions}
                searchable
                searchPlaceholder="Search tables…"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Guest name
              </label>
              <input
                value={data.guest_name}
                onChange={(e) => update('guest_name', e.target.value)}
                readOnly={readOnly}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
              {errors.guest_name && (
                <p className="mt-1 text-xs text-rose-600">{errors.guest_name}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Guest phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={data.guest_phone}
                  onChange={(e) => update('guest_phone', e.target.value)}
                  readOnly={readOnly}
                  className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Party size
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min={1}
                  value={data.party_size}
                  onChange={(e) => update('party_size', e.target.value)}
                  readOnly={readOnly}
                  className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
                />
              </div>
              {errors.party_size && (
                <p className="mt-1 text-xs text-rose-600">{errors.party_size}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={15}
                step={15}
                value={data.duration_minutes}
                onChange={(e) => update('duration_minutes', e.target.value)}
                readOnly={readOnly}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Reserved at
              </label>
              <input
                type="datetime-local"
                value={data.reserved_at}
                onChange={(e) => update('reserved_at', e.target.value)}
                readOnly={readOnly}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
              {errors.reserved_at && (
                <p className="mt-1 text-xs text-rose-600">{errors.reserved_at}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <Select
                value={data.status}
                onChange={(value) => update('status', value)}
                disabled={readOnly}
                options={statusOptions}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Notes
              </label>
              <textarea
                value={data.notes}
                onChange={(e) => update('notes', e.target.value)}
                readOnly={readOnly}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {!readOnly && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Reservation' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
