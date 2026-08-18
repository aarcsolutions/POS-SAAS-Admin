'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Loader2, Shield } from 'lucide-react';

interface Props {
  mode: 'create' | 'edit' | 'view';
  initialTitle?: string;
  onClose: () => void;
  onSubmit: (title: string) => Promise<void> | void;
  saving?: boolean;
}

export default function RoleForm({
  mode,
  initialTitle = '',
  onClose,
  onSubmit,
  saving = false,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState('');

  const isReadOnly = mode === 'view';
  const pageTitle =
    mode === 'create' ? 'Add New Role' : mode === 'edit' ? 'Edit Role' : 'View Role';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!title.trim()) {
      setError('Role name is required');
      return;
    }
    await onSubmit(title.trim());
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Roles
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {pageTitle}
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Roles control which modules and actions users can access.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
          <Shield className="h-4 w-4" /> Role Details
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Role Name {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              readOnly={isReadOnly}
              placeholder="e.g. Cashier"
              className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${
                isReadOnly ? 'opacity-70' : ''
              }`}
            />
            {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
          </div>

          {!isReadOnly && (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {mode === 'create' ? 'Create Role' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
