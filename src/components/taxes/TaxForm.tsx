'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { TaxPayload, TaxRow } from '@/types/tax.types';

interface Props {
  mode: 'create' | 'edit' | 'view';
  initial?: TaxRow | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: TaxPayload) => Promise<void> | void;
}

export default function TaxForm({
  mode,
  initial,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const isReadOnly = mode === 'view';
  const [name, setName] = useState('');
  const [type, setType] = useState<'percentage' | 'flat'>('percentage');
  const [value, setValue] = useState<number | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setType(
        initial.type === 'flat' ? 'flat' : 'percentage'
      );
      setValue(Number(initial.value ?? 0));
    } else {
      setName('');
      setType('percentage');
      setValue('');
    }
  }, [initial]);

  const title =
    mode === 'create'
      ? 'Add Tax'
      : mode === 'edit'
        ? 'Edit Tax'
        : 'Tax Details';

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Tax name is required';
    if (!type) next.type = 'Type is required';
    if (value === '' || Number(value) < 0) {
      next.value = 'Value must be 0 or greater';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!validate()) return;
    await onSubmit({
      name: name.trim(),
      type,
      value: Number(value),
    });
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)] transition hover:text-[var(--brand-icon)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Taxes
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">{title}</h1>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tax Name {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={isReadOnly}
              placeholder="e.g. GST"
              className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] ${
                isReadOnly ? 'opacity-70' : ''
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Type {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <Select
              value={type}
              onChange={(v) => setType(v as 'percentage' | 'flat')}
              disabled={isReadOnly}
              variant="form"
              size="lg"
              allowEmpty={false}
              options={[
                { value: 'percentage', label: 'Percentage (%)' },
                { value: 'flat', label: 'Flat amount' },
              ]}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Value {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={value}
              onChange={(e) =>
                setValue(e.target.value === '' ? '' : Number(e.target.value))
              }
              readOnly={isReadOnly}
              placeholder={type === 'percentage' ? 'e.g. 18' : 'e.g. 50'}
              className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] ${
                isReadOnly ? 'opacity-70' : ''
              }`}
            />
            {errors.value && (
              <p className="mt-1 text-xs text-rose-600">{errors.value}</p>
            )}
          </div>

          {!isReadOnly && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Create Tax' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
