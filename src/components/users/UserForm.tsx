'use client';

import { Shield, X, Loader2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

type UserRole = 'admin' | 'manager' | 'cashier';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  branch: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  lastActive: string;
  address: string;
}

interface UserFormProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: Partial<User>;
  branches: string[];
  onClose: () => void;
  onSubmit: (data: Partial<User>) => void;
}

export default function UserForm({ mode, initialData, branches, onClose, onSubmit }: UserFormProps) {
  const isReadOnly = mode === 'view';
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<User>>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    role: initialData?.role || 'cashier',
    branch: initialData?.branch || branches[0],
    status: initialData?.status || 'active',
    address: initialData?.address || '',
  });

  const title = mode === 'create' ? 'Add New User' : mode === 'edit' ? 'Edit User' : 'View User';
  const buttonText = mode === 'create' ? 'Create User' : 'Save Changes';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    onSubmit(formData);
    setSaving(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === 'create'
            ? 'Create a new staff account with specific role and branch assignment.'
            : mode === 'edit'
            ? 'Modify user account details and access permissions within the system.'
            : 'View complete user profile and activity details.'}
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">User Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Full Name */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                readOnly={isReadOnly}
                placeholder="e.g. Ahmed Khan"
                className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all ${
                  isReadOnly ? 'cursor-default opacity-70' : ''
                }`}
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                readOnly={isReadOnly}
                placeholder="user@company.com"
                className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all ${
                  isReadOnly ? 'cursor-default opacity-70' : ''
                }`}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                readOnly={isReadOnly}
                placeholder="+92 3XX XXXXXXX"
                className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all ${
                  isReadOnly ? 'cursor-default opacity-70' : ''
                }`}
              />
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Role
              </label>
              <div className="relative">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  disabled={isReadOnly}
                  className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 appearance-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all ${
                    isReadOnly ? 'cursor-default opacity-70' : ''
                  }`}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
                {!isReadOnly && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Branch */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Assigned Branch
              </label>
              <div className="relative">
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  disabled={isReadOnly}
                  className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 appearance-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all ${
                    isReadOnly ? 'cursor-default opacity-70' : ''
                  }`}
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                {!isReadOnly && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  disabled={isReadOnly}
                  className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 appearance-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all ${
                    isReadOnly ? 'cursor-default opacity-70' : ''
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {!isReadOnly && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Address - full width */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                readOnly={isReadOnly}
                rows={3}
                placeholder="User address..."
                className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all resize-none ${
                  isReadOnly ? 'cursor-default opacity-70' : ''
                }`}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : buttonText}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
