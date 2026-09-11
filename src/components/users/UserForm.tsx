'use client';

import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2, Save } from 'lucide-react';
import { Role } from '@/types/rbac.types';
import { Select } from '@/components/ui/Select';

export interface UserFormPayload {
  name: string;
  email: string;
  password?: string;
  roleId: string;
}

interface Props {
  mode: 'create' | 'edit' | 'view';
  roles: Role[];
  initialData?: Partial<UserFormPayload>;
  onClose: () => void;
  onSubmit: (data: UserFormPayload) => Promise<void> | void;
  saving?: boolean;
}

export default function UserForm({
  mode,
  roles,
  initialData,
  onClose,
  onSubmit,
  saving = false,
}: Props) {
  const isReadOnly = mode === 'view';
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleId, setRoleId] = useState(initialData?.roleId || roles[0]?.id || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const title =
    mode === 'create' ? 'Add New User' : mode === 'edit' ? 'Edit User' : 'View User';

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Invalid email';
    if (mode === 'create' && password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }
    if (mode === 'edit' && password && password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }
    if (!roleId) next.roleId = 'Role is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!validate()) return;
    await onSubmit({
      name: name.trim(),
      email: email.trim(),
      roleId,
      ...(password ? { password } : mode === 'create' ? { password } : {}),
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Assign a tenant role so the user gets the correct module access on login.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={isReadOnly}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[var(--brand-primary)]"
              placeholder="e.g. Ahmed Khan"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={isReadOnly}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[var(--brand-primary)]"
              placeholder="user@tenant.com"
            />
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
          </div>

          {!isReadOnly && (
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Password {mode === 'edit' && '(optional)'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm outline-none focus:border-[#d97706] focus:ring-4 focus:ring-[#fcd299]/60"
                  placeholder={mode === 'edit' ? 'Leave blank to keep current' : 'Min 6 characters'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="h-5 w-5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
              )}
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Role
            </label>
            <Select
              value={roleId}
              onChange={setRoleId}
              disabled={isReadOnly}
              variant="form"
              size="lg"
              placeholder="Select role"
              triggerClassName="disabled:opacity-70"
              options={roles.map((role) => ({
                value: role.id,
                label: role.title,
              }))}
              searchable
              searchPlaceholder="Search roles…"
            />
            {errors.roleId && (
              <p className="mt-1 text-xs text-rose-600">{errors.roleId}</p>
            )}
          </div>

          {!isReadOnly && (
            <div className="md:col-span-2 flex justify-end gap-3">
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
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white hover:brightness-95 disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {mode === 'create' ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
