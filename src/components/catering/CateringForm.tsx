'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  UtensilsCrossed,
  Users,
  Phone,
  MapPin,
} from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { notifyError } from '@/utils/notify';
import { blockInvalidSubmit } from '@/utils/form-validation';
import {
  CateringEventPayload,
  CATERING_STATUS_OPTIONS,
  VENUE_TYPE_OPTIONS,
} from '@/types/catering.types';

interface CateringFormData {
  branch_id: string;
  customer_id: string;
  contact_name: string;
  contact_phone: string;
  event_name: string;
  event_at: string;
  party_size: string;
  venue_type: string;
  venue_address: string;
  status: string;
  estimated_total: string;
  notes: string;
}

interface Props {
  mode: 'create' | 'edit' | 'view';
  initialData?: Partial<CateringFormData>;
  branchOptions?: Array<{ value: string; label: string }>;
  customerOptions?: Array<{ value: string; label: string }>;
  showBranchSelect?: boolean;
  saving?: boolean;
  onBranchChange?: (branchId: string) => void;
  onClose: () => void;
  onSubmit: (data: CateringEventPayload) => Promise<void> | void;
}

const emptyData: CateringFormData = {
  branch_id: '',
  customer_id: '',
  contact_name: '',
  contact_phone: '',
  event_name: '',
  event_at: '',
  party_size: '10',
  venue_type: 'on_premise',
  venue_address: '',
  status: 'inquiry',
  estimated_total: '',
  notes: '',
};

function toLocalDatetimeInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CateringForm({
  mode,
  initialData,
  branchOptions = [],
  customerOptions = [],
  showBranchSelect = false,
  saving = false,
  onBranchChange,
  onClose,
  onSubmit,
}: Props) {
  const [data, setData] = useState<CateringFormData>({
    ...emptyData,
    ...initialData,
    event_at: toLocalDatetimeInput(initialData?.event_at),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const readOnly = mode === 'view';

  useEffect(() => {
    if (initialData) {
      setData({
        ...emptyData,
        ...initialData,
        event_at: toLocalDatetimeInput(initialData.event_at),
      });
    }
  }, [initialData]);

  const update = <K extends keyof CateringFormData>(
    key: K,
    value: CateringFormData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const statusOptions = useMemo(
    () =>
      CATERING_STATUS_OPTIONS.map((s) => ({
        value: s.value,
        label: s.label,
      })),
    []
  );

  const venueOptions = useMemo(
    () =>
      VENUE_TYPE_OPTIONS.map((v) => ({
        value: v.value,
        label: v.label,
      })),
    []
  );

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (showBranchSelect && !data.branch_id) {
      e.branch_id = 'Branch is required';
    }
    if (!data.customer_id && !data.contact_name.trim()) {
      e.contact_name = 'Contact name is required when no customer is selected';
    }
    if (!data.party_size || Number(data.party_size) < 1) {
      e.party_size = 'Party size must be at least 1';
    }
    if (!data.event_at) {
      e.event_at = 'Event date and time are required';
    }
    if (data.venue_type === 'off_premise' && !data.venue_address.trim()) {
      e.venue_address = 'Venue address is required for off-premise events';
    }
    setErrors(e);
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    const next = validate();
    if (!blockInvalidSubmit(next, notifyError)) return;

    await onSubmit({
      branch_id: showBranchSelect ? data.branch_id : undefined,
      customer_id: data.customer_id || null,
      contact_name: data.contact_name.trim(),
      contact_phone: data.contact_phone.trim() || null,
      event_name: data.event_name.trim() || null,
      event_at: new Date(data.event_at).toISOString(),
      party_size: Number(data.party_size),
      venue_type: data.venue_type as CateringEventPayload['venue_type'],
      venue_address:
        data.venue_type === 'off_premise'
          ? data.venue_address.trim()
          : null,
      status: data.status as CateringEventPayload['status'],
      estimated_total: data.estimated_total
        ? Number(data.estimated_total)
        : null,
      notes: data.notes.trim() || null,
    });
  };

  const title =
    mode === 'create'
      ? 'Add Catering Event'
      : mode === 'edit'
        ? 'Edit Catering Event'
        : 'Catering Event Details';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Catering
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <UtensilsCrossed className="h-4 w-4" /> Event details
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
                placeholder="No customer linked"
                options={customerOptions}
                searchable
                searchPlaceholder="Search customers…"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Event name (optional)
              </label>
              <input
                value={data.event_name}
                onChange={(e) => update('event_name', e.target.value)}
                readOnly={readOnly}
                placeholder="Corporate lunch"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Contact name
              </label>
              <input
                value={data.contact_name}
                onChange={(e) => update('contact_name', e.target.value)}
                readOnly={readOnly}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
              {errors.contact_name && (
                <p className="mt-1 text-xs text-rose-600">{errors.contact_name}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Contact phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={data.contact_phone}
                  onChange={(e) => update('contact_phone', e.target.value)}
                  readOnly={readOnly}
                  className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Event date & time
              </label>
              <input
                type="datetime-local"
                value={data.event_at}
                onChange={(e) => update('event_at', e.target.value)}
                readOnly={readOnly}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
              {errors.event_at && (
                <p className="mt-1 text-xs text-rose-600">{errors.event_at}</p>
              )}
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
                Venue type
              </label>
              <Select
                value={data.venue_type}
                onChange={(value) => update('venue_type', value)}
                disabled={readOnly}
                options={venueOptions}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Quote amount (optional)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={data.estimated_total}
                onChange={(e) => update('estimated_total', e.target.value)}
                readOnly={readOnly}
                placeholder="0.00"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
            </div>

            {data.venue_type === 'off_premise' && (
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Venue address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    value={data.venue_address}
                    onChange={(e) => update('venue_address', e.target.value)}
                    readOnly={readOnly}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
                  />
                </div>
                {errors.venue_address && (
                  <p className="mt-1 text-xs text-rose-600">{errors.venue_address}</p>
                )}
              </div>
            )}

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
                rows={4}
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
              {mode === 'create' ? 'Create Event' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
