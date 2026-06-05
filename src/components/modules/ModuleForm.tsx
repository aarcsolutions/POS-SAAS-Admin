'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Loader2, Shield, Zap } from 'lucide-react';

interface ModuleFormData {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

interface Props {
  mode: 'create' | 'edit' | 'view';
  initialData?: ModuleFormData;
  onClose: () => void;
  onSubmit: (data: ModuleFormData) => void;
}

const emptyData: ModuleFormData = {
  name: '',
  slug: 'mod_new_' + Math.floor(Math.random() * 1000),
  description: '',
  isActive: true,
};

export default function ModuleForm({ mode, initialData, onClose, onSubmit }: Props) {
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ModuleFormData>(initialData || emptyData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Add New Module' : mode === 'edit' ? 'Edit Module' : 'View Module';

  const update = <K extends keyof ModuleFormData>(key: K, value: ModuleFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.name.trim()) e.name = 'Module name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    onSubmit(data);
    setSaving(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button onClick={onClose} className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> Back to Modules
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === 'create' ? 'Register a new system component and define its core parameters.' : 'Update module configuration and system-level identifiers.'}
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
                Module Name {isReadOnly ? '' : <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text" value={data.name} onChange={(e) => update('name', e.target.value)}
                readOnly={isReadOnly}
                placeholder="e.g. Inventory Core"
                className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 ${isReadOnly ? 'cursor-default opacity-70' : ''}`}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Slug
              </label>
              <div className="relative">
                <input
                  type="text" value={data.slug} readOnly
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-emerald-700 outline-none"
                />
                <Shield className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              value={data.description} onChange={(e) => update('description', e.target.value)}
              readOnly={isReadOnly}
              rows={5}
              placeholder="Brief explanation of module functionality..."
              className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-none ${isReadOnly ? 'cursor-default opacity-70' : ''}`}
            />
          </div>

          <div className="mb-8 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-emerald-600" />
              <div>
                <div className="text-sm font-bold text-slate-800">Active Status</div>
                <div className="text-xs text-slate-500">Enable this module for platform use immediately.</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => !isReadOnly && update('isActive', !data.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.isActive ? 'bg-emerald-600' : 'bg-slate-300'} ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition ${data.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button type="submit" disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : mode === 'create' ? 'Create Module' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
