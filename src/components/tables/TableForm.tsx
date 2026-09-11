'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, LayoutGrid } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import {
  RestaurantTableStatus,
  TablePayload,
} from '@/types/table.types';

interface TableFormData {
  name: string;
  code: string;
  capacity: string;
  status: RestaurantTableStatus;
  branch_id: string;
  is_active: boolean;
}

interface Props {
  mode: 'create' | 'edit' | 'view';
  initialData?: TableFormData;
  branchOptions?: Array<{ value: string; label: string }>;
  showBranchSelect?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: TablePayload) => Promise<void> | void;
}

const emptyData: TableFormData = {
  name: '',
  code: '',
  capacity: '',
  status: 'available',
  branch_id: '',
  is_active: true,
};

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'reserved', label: 'Reserved' },
];

export default function TableForm({
  mode,
  initialData,
  branchOptions = [],
  showBranchSelect = false,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const [data, setData] = useState<TableFormData>(initialData || emptyData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const readOnly = mode === 'view';

  const update = <K extends keyof TableFormData>(
    key: K,
    value: TableFormData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.name.trim()) e.name = 'Name is required';
    if (showBranchSelect && !data.branch_id) {
      e.branch_id = 'Branch is required';
    }
    if (data.capacity.trim()) {
      const n = Number(data.capacity);
      if (!Number.isInteger(n) || n < 1) {
        e.capacity = 'Capacity must be a positive whole number';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (!validate()) return;

    await onSubmit({
      name: data.name.trim(),
      code: data.code.trim() || null,
      capacity: data.capacity.trim() ? Number(data.capacity) : null,
      status: data.status,
      branch_id: showBranchSelect ? data.branch_id : undefined,
      is_active: data.is_active,
    });
  };

  const title =
    mode === 'create'
      ? 'Add Table'
      : mode === 'edit'
        ? 'Edit Table'
        : 'Table Details';
  const subtitle =
    mode === 'create'
      ? 'Create a floor table for dine-in and reservations.'
      : mode === 'edit'
        ? 'Update table information.'
        : 'View table information.';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tables
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <LayoutGrid className="h-4 w-4" /> Table Info
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {showBranchSelect && (
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Branch
                </label>
                <Select
                  value={data.branch_id}
                  onChange={(value) => update('branch_id', value)}
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
                Name
              </label>
              <input
                value={data.name}
                onChange={(e) => update('name', e.target.value)}
                readOnly={readOnly}
                placeholder="e.g. Table 5"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Code
              </label>
              <input
                value={data.code}
                onChange={(e) => update('code', e.target.value)}
                readOnly={readOnly}
                placeholder="Optional short code"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Capacity
              </label>
              <input
                type="number"
                min={1}
                value={data.capacity}
                onChange={(e) => update('capacity', e.target.value)}
                readOnly={readOnly}
                placeholder="Seats"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
              {errors.capacity && (
                <p className="mt-1 text-xs text-rose-600">{errors.capacity}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <Select
                value={data.status}
                onChange={(value) =>
                  update('status', value as RestaurantTableStatus)
                }
                disabled={readOnly}
                options={STATUS_OPTIONS}
              />
            </div>
          </div>
        </div>

        {!readOnly && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Table' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
