'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Loader2, Shield, X } from 'lucide-react';

interface PermissionFormData {
  name: string;
  module: string;
  action: string;
  description: string;
}

interface Props {
  mode: 'create' | 'edit' | 'view';
  initialData?: PermissionFormData;
  onClose: () => void;
  onSubmit: (data: PermissionFormData) => void;
}

const emptyData: PermissionFormData = {
  name: '',
  module: '',
  action: 'READ',
  description: '',
};

const MODULES_LIST = [
  'Dashboard', 'Business Settings', 'Branch Management', 'User Management',
  'Product Management', 'Inventory Management', 'Sales & Reports',
  'Customers', 'Suppliers', 'Transactions', 'Roles', 'Permissions', 'Modules',
];

const ACTIONS = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'READALL'];

export default function PermissionForm({ mode, initialData, onClose, onSubmit }: Props) {
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<PermissionFormData>(initialData || emptyData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Create New Permission' : mode === 'edit' ? 'Edit Permission' : 'Permission Details';

  const update = <K extends keyof PermissionFormData>(key: K, value: PermissionFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.name.trim()) e.name = 'Permission name is required';
    if (!data.module) e.module = 'Module is required';
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
          <ArrowLeft className="h-4 w-4" /> Back to Permissions
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === 'create' ? 'Define system identity and module association for new access level.' : 'Modify or review permission configuration.'}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
          <Shield className="h-4 w-4" /> Permission Details
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Permission Name {isReadOnly ? '' : <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <input
                type="text" value={data.name} onChange={(e) => update('name', e.target.value)}
                readOnly={isReadOnly}
                placeholder="e.g. products.create"
                className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 ${isReadOnly ? 'cursor-default opacity-70' : ''}`}
              />
              <Shield className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
          </div>

          <div className="mb-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Module {isReadOnly ? '' : <span className="text-rose-500">*</span>}
              </label>
              <select
                value={data.module} onChange={(e) => update('module', e.target.value)}
                disabled={isReadOnly}
                className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 ${isReadOnly ? 'cursor-default opacity-70' : ''}`}
              >
                <option value="">Select module...</option>
                {MODULES_LIST.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {errors.module && <p className="mt-1 text-xs text-rose-500">{errors.module}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Action
              </label>
              <div className="flex flex-wrap gap-2">
                {ACTIONS.map((act) => {
                  const isSelected = data.action === act;
                  return (
                    <button
                      key={act}
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => update('action', act)}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      } ${isReadOnly ? 'cursor-default opacity-60' : ''}`}
                    >
                      {act}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Internal Description
            </label>
            <textarea
              value={data.description} onChange={(e) => update('description', e.target.value)}
              readOnly={isReadOnly}
              rows={4}
              placeholder="Provide context for system administrators about what this access point governs..."
              className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-none ${isReadOnly ? 'cursor-default opacity-70' : ''}`}
            />
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
                {saving ? 'Saving...' : mode === 'create' ? 'Create Permission' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
