'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, Truck } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { SupplierPayload } from '@/types/supplier.types';

interface SupplierFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  branch_id: string;
}

interface Props {
  mode: 'create' | 'edit' | 'view';
  initialData?: Partial<SupplierFormData>;
  branchOptions?: Array<{ value: string; label: string }>;
  showBranchSelect?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierPayload) => Promise<void> | void;
}

const emptyData: SupplierFormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
  branch_id: '',
};

export default function SupplierForm({
  mode,
  initialData,
  branchOptions = [],
  showBranchSelect = false,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const [data, setData] = useState<SupplierFormData>({
    ...emptyData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const readOnly = mode === 'view';

  const update = <K extends keyof SupplierFormData>(
    key: K,
    value: SupplierFormData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.name.trim()) e.name = 'Supplier name is required';
    if (showBranchSelect && !data.branch_id) {
      e.branch_id = 'Branch is required';
    }
    if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      e.email = 'Enter a valid email';
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
      phone: data.phone.trim() || undefined,
      email: data.email.trim() || undefined,
      address: data.address.trim() || undefined,
      branch_id: showBranchSelect ? data.branch_id : undefined,
    });
  };

  const title =
    mode === 'create'
      ? 'Add Supplier'
      : mode === 'edit'
        ? 'Edit Supplier'
        : 'Supplier Details';
  const subtitle =
    mode === 'create'
      ? 'Create a supplier and later assign the raw materials they can supply.'
      : mode === 'edit'
        ? 'Update supplier information.'
        : 'View supplier information.';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Suppliers
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Truck className="h-4 w-4" /> Supplier Info
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

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                value={data.name}
                onChange={(e) => update('name', e.target.value)}
                readOnly={readOnly}
                placeholder="Supplier name"
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
              <input
                value={data.phone}
                onChange={(e) => update('phone', e.target.value)}
                readOnly={readOnly}
                placeholder="Optional phone"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => update('email', e.target.value)}
                readOnly={readOnly}
                placeholder="Optional email"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Address
              </label>
              <input
                value={data.address}
                onChange={(e) => update('address', e.target.value)}
                readOnly={readOnly}
                placeholder="Optional address"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
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
              {mode === 'create' ? 'Create Supplier' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
