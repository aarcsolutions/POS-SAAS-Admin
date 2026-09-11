'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, User, Phone, FileText } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { DriverPayload } from '@/types/driver.types';

interface DriverFormData {
  name: string;
  phone: string;
  branch_id: string;
  notes: string;
  is_active: boolean;
}

interface Props {
  mode: 'create' | 'edit' | 'view';
  initialData?: DriverFormData;
  branchOptions?: Array<{ value: string; label: string }>;
  showBranchSelect?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: DriverPayload) => Promise<void> | void;
}

const emptyData: DriverFormData = {
  name: '',
  phone: '',
  branch_id: '',
  notes: '',
  is_active: true,
};

export default function DriverForm({
  mode,
  initialData,
  branchOptions = [],
  showBranchSelect = false,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const [data, setData] = useState<DriverFormData>(initialData || emptyData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const readOnly = mode === 'view';

  const update = <K extends keyof DriverFormData>(
    key: K,
    value: DriverFormData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.name.trim()) e.name = 'Name is required';
    if (!data.phone.trim()) e.phone = 'Phone is required';
    if (showBranchSelect && !data.branch_id) {
      e.branch_id = 'Branch is required';
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
      phone: data.phone.trim(),
      branch_id: showBranchSelect ? data.branch_id : undefined,
      notes: data.notes.trim() || null,
      is_active: data.is_active,
    });
  };

  const title =
    mode === 'create'
      ? 'Add Driver'
      : mode === 'edit'
        ? 'Edit Driver'
        : 'Driver Details';
  const subtitle =
    mode === 'create'
      ? 'Register a delivery driver for a branch.'
      : mode === 'edit'
        ? 'Update driver information.'
        : 'View driver information.';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Drivers
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <User className="h-4 w-4" /> Driver Info
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
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={data.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  readOnly={readOnly}
                  className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Notes
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  value={data.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  readOnly={readOnly}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => update('is_active', e.target.checked)}
                  disabled={readOnly}
                  className="h-4 w-4 rounded border-slate-300 accent-[var(--brand-primary)]"
                />
                Active driver
              </label>
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
              {mode === 'create' ? 'Create Driver' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
