'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { PromoCodePayload, PromoCodeType } from '@/types/promo-code.types';

interface PromoCodeFormData {
  code: string;
  type: PromoCodeType;
  value: string;
  min_order_amount: string;
  max_discount: string;
  usage_limit: string;
  starts_at: string;
  expires_at: string;
  branch_id: string;
  is_active: boolean;
}

interface Props {
  mode: 'create' | 'edit' | 'view';
  initialData?: PromoCodeFormData;
  branchOptions?: Array<{ value: string; label: string }>;
  showBranchSelect?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: PromoCodePayload) => Promise<void> | void;
}

const emptyData: PromoCodeFormData = {
  code: '',
  type: 'percentage',
  value: '',
  min_order_amount: '',
  max_discount: '',
  usage_limit: '',
  starts_at: '',
  expires_at: '',
  branch_id: '',
  is_active: true,
};

function toDatetimeLocal(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value.trim()) return null;
  return new Date(value).toISOString();
}

export default function PromoCodeForm({
  mode,
  initialData,
  branchOptions = [],
  showBranchSelect = false,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const [data, setData] = useState<PromoCodeFormData>(initialData || emptyData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const readOnly = mode === 'view';

  const update = <K extends keyof PromoCodeFormData>(
    key: K,
    value: PromoCodeFormData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.code.trim()) e.code = 'Code is required';
    if (!data.value.trim() || Number(data.value) < 0) {
      e.value = 'Value is required';
    }
    if (
      data.type === 'percentage' &&
      Number(data.value) > 100
    ) {
      e.value = 'Percentage cannot exceed 100';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (!validate()) return;

    const payload: PromoCodePayload = {
      code: data.code.trim().toUpperCase(),
      type: data.type,
      value: Number(data.value),
      min_order_amount: data.min_order_amount
        ? Number(data.min_order_amount)
        : null,
      max_discount: data.max_discount ? Number(data.max_discount) : null,
      usage_limit: data.usage_limit ? Number(data.usage_limit) : null,
      starts_at: fromDatetimeLocal(data.starts_at),
      expires_at: fromDatetimeLocal(data.expires_at),
      branch_id: showBranchSelect && data.branch_id ? data.branch_id : undefined,
    };

    if (mode === 'edit') {
      payload.is_active = data.is_active;
    }

    await onSubmit(payload);
  };

  const title =
    mode === 'create'
      ? 'Add Coupon'
      : mode === 'edit'
        ? 'Edit Coupon'
        : 'Coupon Details';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Coupons
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            {showBranchSelect && (
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Branch (optional — leave empty for tenant-wide)
                </label>
                <Select
                  value={data.branch_id}
                  onChange={(value) => update('branch_id', value)}
                  disabled={readOnly}
                  allowEmpty
                  placeholder="All branches"
                  options={branchOptions}
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Code
              </label>
              <input
                value={data.code}
                onChange={(e) => update('code', e.target.value.toUpperCase())}
                readOnly={readOnly}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm uppercase outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-slate-50"
              />
              {errors.code && (
                <p className="mt-1 text-xs text-rose-600">{errors.code}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Type
              </label>
              <Select
                value={data.type}
                onChange={(v) => update('type', v as PromoCodeType)}
                disabled={readOnly}
                options={[
                  { value: 'percentage', label: 'Percentage (%)' },
                  { value: 'flat', label: 'Flat amount' },
                ]}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Value {data.type === 'percentage' ? '(%)' : '(amount)'}
              </label>
              <input
                type="number"
                min={0}
                max={data.type === 'percentage' ? 100 : undefined}
                value={data.value}
                onChange={(e) => update('value', e.target.value)}
                readOnly={readOnly}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-slate-50"
              />
              {errors.value && (
                <p className="mt-1 text-xs text-rose-600">{errors.value}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Min order amount
              </label>
              <input
                type="number"
                min={0}
                value={data.min_order_amount}
                onChange={(e) => update('min_order_amount', e.target.value)}
                readOnly={readOnly}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Max discount
              </label>
              <input
                type="number"
                min={0}
                value={data.max_discount}
                onChange={(e) => update('max_discount', e.target.value)}
                readOnly={readOnly}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Usage limit
              </label>
              <input
                type="number"
                min={1}
                value={data.usage_limit}
                onChange={(e) => update('usage_limit', e.target.value)}
                readOnly={readOnly}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Starts at
              </label>
              <input
                type="datetime-local"
                value={data.starts_at}
                onChange={(e) => update('starts_at', e.target.value)}
                readOnly={readOnly}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Expires at
              </label>
              <input
                type="datetime-local"
                value={data.expires_at}
                onChange={(e) => update('expires_at', e.target.value)}
                readOnly={readOnly}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-slate-50"
              />
            </div>

            <div className="sm:col-span-2">
              {(mode === 'edit' || mode === 'view') && (
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={(e) => update('is_active', e.target.checked)}
                    disabled={readOnly}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600"
                  />
                  Active coupon
                </label>
              )}
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
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Coupon' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export { toDatetimeLocal };
