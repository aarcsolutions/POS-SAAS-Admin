'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Loader2, Shield } from 'lucide-react';

interface RoleFormData {
  name: string;
  description: string;
  priority: number;
}

interface Props {
  mode: 'create' | 'edit' | 'view';
  initialData?: RoleFormData;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => void;
}

const emptyData: RoleFormData = {
  name: '',
  description: '',
  priority: 4,
};

export default function RoleForm({ mode, initialData, onClose, onSubmit }: Props) {
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<RoleFormData>(initialData || emptyData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Add New Role' : mode === 'edit' ? 'Edit Role' : 'View Role';
  const subtitle = mode === 'create'
    ? 'Configure a new role and define access levels for personnel within the POS system.'
    : 'Modify role details and access parameters.';

  const update = <K extends keyof RoleFormData>(key: K, value: RoleFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.name.trim()) e.name = 'Role name is required';
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
          <ArrowLeft className="h-4 w-4" /> Back to Roles
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
          <Shield className="h-4 w-4" /> Role Details
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Role Name {isReadOnly ? '' : <span className="text-rose-500">*</span>}
            </label>
            <input
              type="text" value={data.name} onChange={(e) => update('name', e.target.value)}
              readOnly={isReadOnly}
              placeholder="e.g. Regional Manager"
              className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 ${isReadOnly ? 'cursor-default opacity-70' : ''}`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              value={data.description} onChange={(e) => update('description', e.target.value)}
              readOnly={isReadOnly}
              rows={5}
              placeholder="Briefly describe the responsibilities and scope of this role..."
              className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-none ${isReadOnly ? 'cursor-default opacity-70' : ''}`}
            />
          </div>

          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                System Priority
              </label>
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                Level {data.priority}
              </span>
            </div>
            <input
              type="range" min={1} max={5} step={1}
              value={data.priority}
              disabled={isReadOnly}
              onChange={(e) => update('priority', parseInt(e.target.value))}
              className={`w-full accent-emerald-600 ${isReadOnly ? 'cursor-default opacity-50' : ''}`}
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>Standard</span>
              <span>Critical</span>
            </div>
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
                {saving ? 'Saving...' : mode === 'create' ? 'Create Role' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
