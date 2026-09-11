'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, Shield } from 'lucide-react';

export interface ModuleFormData {
  title: string;
  slug: string;
  description: string;
}

interface Props {
  mode: 'create' | 'edit' | 'view';
  initialData?: ModuleFormData;
  onClose: () => void;
  onSubmit: (data: ModuleFormData) => Promise<void> | void;
  saving?: boolean;
}

const emptyData: ModuleFormData = {
  title: '',
  slug: '',
  description: '',
};

export default function ModuleForm({
  mode,
  initialData,
  onClose,
  onSubmit,
  saving = false,
}: Props) {
  const [data, setData] = useState<ModuleFormData>(initialData || emptyData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isReadOnly = mode === 'view';
  const title =
    mode === 'create'
      ? 'Add New Module'
      : mode === 'edit'
        ? 'Edit Module'
        : 'View Module';

  const update = <K extends keyof ModuleFormData>(
    key: K,
    value: ModuleFormData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.title.trim()) e.title = 'Module title is required';
    if (!data.slug.trim()) e.slug = 'Module slug is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!validate()) return;
    await onSubmit(data);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Modules
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === 'create'
            ? 'Register a new system component and define its core parameters.'
            : 'Update module configuration and system-level identifiers.'}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
          <Shield className="h-4 w-4" /> Module Details
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Title {!isReadOnly && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => update('title', e.target.value)}
                readOnly={isReadOnly}
                className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary-soft)] ${
                  isReadOnly ? 'cursor-default opacity-70' : ''
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-rose-500">{errors.title}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Slug {!isReadOnly && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text"
                value={data.slug}
                onChange={(e) => update('slug', e.target.value)}
                readOnly={isReadOnly}
                className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-mono text-sm outline-none focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary-soft)] ${
                  isReadOnly ? 'cursor-default opacity-70' : ''
                }`}
              />
              {errors.slug && (
                <p className="mt-1 text-xs text-rose-500">{errors.slug}</p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              value={data.description}
              onChange={(e) => update('description', e.target.value)}
              readOnly={isReadOnly}
              rows={4}
              className={`w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary-soft)] ${
                isReadOnly ? 'cursor-default opacity-70' : ''
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving
                  ? 'Saving...'
                  : mode === 'create'
                    ? 'Create Module'
                    : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
