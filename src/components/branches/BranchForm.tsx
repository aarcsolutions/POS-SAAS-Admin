'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  Shield,
  Store,
  UserCog,
  KeyRound,
} from 'lucide-react';
import { Select } from '@/components/ui/Select';
import type {
  Branch,
  BranchCreateBootstrapPayload,
  BranchModuleOption,
  BranchStatus,
} from '@/types/branch.types';

interface BranchFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Branch>;
  licensedModules: BranchModuleOption[];
  catalogLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: BranchCreateBootstrapPayload) => void;
}

const inputClass = (hasError?: boolean, readOnly?: boolean) =>
  `h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all ${
    hasError ? 'border-rose-400' : 'border-slate-200'
  } ${readOnly ? 'cursor-default opacity-70' : ''}`;

export default function BranchForm({
  mode,
  initialData,
  licensedModules,
  catalogLoading = false,
  onClose,
  onSubmit,
}: BranchFormProps) {
  const isEdit = mode === 'edit';
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [status, setStatus] = useState<BranchStatus>(initialData?.status || 'active');

  const [enabledModuleIds, setEnabledModuleIds] = useState<string[]>(
    initialData?.enabledModuleIds || []
  );
  const [roleTitle, setRoleTitle] = useState(initialData?.roleTitle || 'Branch Admin');
  const [permissionIds, setPermissionIds] = useState<string[]>(
    initialData?.permissionIds || []
  );

  const [adminName, setAdminName] = useState(initialData?.adminName || '');
  const [adminEmail, setAdminEmail] = useState(initialData?.adminEmail || '');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');

  const modulesForPermissions = useMemo(
    () => licensedModules.filter((m) => enabledModuleIds.includes(m.id)),
    [licensedModules, enabledModuleIds]
  );

  const toggleModule = (moduleId: string) => {
    setEnabledModuleIds((prev) => {
      const wasEnabled = prev.includes(moduleId);
      const next = wasEnabled
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId];
      if (wasEnabled) {
        const removed = licensedModules.find((m) => m.id === moduleId);
        if (removed) {
          const removePermIds = new Set(removed.permissions.map((p) => p.id));
          setPermissionIds((pids) => pids.filter((id) => !removePermIds.has(id)));
        }
      }
      return next;
    });
  };

  const togglePermission = (permissionId: string) => {
    setPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleModuleAllPermissions = (module: BranchModuleOption, allowed: boolean) => {
    const ids = module.permissions.map((p) => p.id);
    setPermissionIds((prev) => {
      if (allowed) {
        return Array.from(new Set([...prev, ...ids]));
      }
      const remove = new Set(ids);
      return prev.filter((id) => !remove.has(id));
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Branch name is required';
    if (!code.trim()) next.code = 'Branch code is required';
    if (!phone.trim()) next.phone = 'Phone is required';
    if (!address.trim()) next.address = 'Address is required';
    if (enabledModuleIds.length === 0) next.modules = 'Select at least one module';
    if (!roleTitle.trim()) next.roleTitle = 'Role title is required';
    if (permissionIds.length === 0) next.permissions = 'Assign at least one permission';
    if (!adminName.trim()) next.adminName = 'Branch Admin name is required';
    if (!adminEmail.trim()) next.adminEmail = 'Branch Admin email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail.trim())) {
      next.adminEmail = 'Enter a valid email';
    }
    if (!isEdit) {
      if (!adminPassword || adminPassword.length < 6) {
        next.adminPassword = 'Password must be at least 6 characters';
      }
      if (adminPassword !== adminPasswordConfirm) {
        next.adminPasswordConfirm = 'Passwords do not match';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const allowedPermissionIds = new Set(
      licensedModules
        .filter((m) => enabledModuleIds.includes(m.id))
        .flatMap((m) => m.permissions.map((p) => p.id)),
    );
    const syncedPermissionIds = permissionIds.filter((id) =>
      allowedPermissionIds.has(id),
    );
    if (syncedPermissionIds.length === 0) {
      setErrors((prev) => ({
        ...prev,
        permissions: 'Assign at least one permission for enabled modules',
      }));
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      address: address.trim(),
      phone: phone.trim(),
      status,
      enabledModuleIds,
      roleTitle: roleTitle.trim(),
      permissionIds: syncedPermissionIds,
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim().toLowerCase(),
      adminPassword: isEdit ? '' : adminPassword,
    });
    setSaving(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Branches
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {isEdit ? 'Edit Branch' : 'Create Branch'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isEdit
            ? 'Update branch details, enabled modules, and Branch Admin access.'
            : 'Create the branch, enable modules, define the Branch Admin role & permissions, and create the Branch Admin user.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Branch info */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <Store className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Branch details</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Branch name
              </label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                }}
                placeholder="e.g. DHA Branch"
                className={inputClass(!!errors.name)}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Branch code
              </label>
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errors.code) setErrors((p) => ({ ...p, code: '' }));
                }}
                placeholder="e.g. DHA"
                className={inputClass(!!errors.code)}
              />
              {errors.code && <p className="mt-1 text-xs text-rose-600">{errors.code}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Phone
              </label>
              <input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                }}
                placeholder="+92 3XX XXXXXXX"
                className={inputClass(!!errors.phone)}
              />
              {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </label>
              <Select
                value={status}
                onChange={(value) => setStatus(value as BranchStatus)}
                variant="form"
                allowEmpty={false}
                size="lg"
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors((p) => ({ ...p, address: '' }));
                }}
                rows={3}
                placeholder="Full branch address"
                className={`w-full resize-none rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${
                  errors.address ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-rose-600">{errors.address}</p>
              )}
            </div>
          </div>
        </section>

        {/* 2. Enabled modules */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Enabled modules</h2>
          </div>
          <p className="mb-4 text-sm text-slate-500">
            Only modules licensed to your tenant are listed. Selected modules are stored in
            branch_modules.
          </p>
          {errors.modules && (
            <p className="mb-3 text-xs text-rose-600">{errors.modules}</p>
          )}
          {catalogLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : licensedModules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
              No licensed modules found for this tenant. Ask Platform Admin to assign modules.
            </div>
          ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {licensedModules.map((module) => {
              const checked = enabledModuleIds.includes(module.id);
              return (
                <label
                  key={module.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                    checked
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      toggleModule(module.id);
                      if (errors.modules) setErrors((p) => ({ ...p, modules: '' }));
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-slate-800">{module.title}</span>
                </label>
              );
            })}
          </div>
          )}
        </section>

        {/* 3. Role */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Branch Admin role</h2>
          </div>
          <div className="max-w-md">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Role title
            </label>
            <input
              value={roleTitle}
              onChange={(e) => {
                setRoleTitle(e.target.value);
                if (errors.roleTitle) setErrors((p) => ({ ...p, roleTitle: '' }));
              }}
              className={inputClass(!!errors.roleTitle)}
            />
            {errors.roleTitle && (
              <p className="mt-1 text-xs text-rose-600">{errors.roleTitle}</p>
            )}
            <p className="mt-2 text-xs text-slate-400">
              Role will be scoped to this branch (branch_id set automatically).
            </p>
          </div>
        </section>

        {/* 4. Permissions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Role permissions</h2>
          </div>
          <p className="mb-4 text-sm text-slate-500">
            Assign permissions for enabled modules only. You can only grant permissions your
            Tenant Admin role already has.
          </p>
          {errors.permissions && (
            <p className="mb-3 text-xs text-rose-600">{errors.permissions}</p>
          )}
          {modulesForPermissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
              Enable at least one module above to assign permissions.
            </div>
          ) : (
            <div className="space-y-3">
              {modulesForPermissions.map((module) => {
                const open = openModules[module.id] ?? true;
                const selectedCount = module.permissions.filter((p) =>
                  permissionIds.includes(p.id)
                ).length;
                return (
                  <div
                    key={module.id}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenModules((prev) => ({
                          ...prev,
                          [module.id]: !open,
                        }))
                      }
                      className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
                    >
                      <div className="font-semibold text-slate-800">
                        {module.title}{' '}
                        <span className="text-xs font-medium text-slate-400">
                          ({selectedCount}/{module.permissions.length})
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {open && (
                      <div className="border-t border-slate-100 px-5 py-4">
                        <div className="mb-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => toggleModuleAllPermissions(module, true)}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"
                          >
                            Allow all
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleModuleAllPermissions(module, false)}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"
                          >
                            Deny all
                          </button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {module.permissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                            >
                              <input
                                type="checkbox"
                                checked={permissionIds.includes(permission.id)}
                                onChange={() => {
                                  togglePermission(permission.id);
                                  if (errors.permissions) {
                                    setErrors((p) => ({ ...p, permissions: '' }));
                                  }
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="text-slate-700">{permission.title}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 5. Branch Admin user */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <UserCog className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Branch Admin user</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Full name
              </label>
              <input
                value={adminName}
                onChange={(e) => {
                  setAdminName(e.target.value);
                  if (errors.adminName) setErrors((p) => ({ ...p, adminName: '' }));
                }}
                placeholder="e.g. Ali Khan"
                className={inputClass(!!errors.adminName)}
              />
              {errors.adminName && (
                <p className="mt-1 text-xs text-rose-600">{errors.adminName}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => {
                  setAdminEmail(e.target.value);
                  if (errors.adminEmail) setErrors((p) => ({ ...p, adminEmail: '' }));
                }}
                placeholder="branch.admin@example.com"
                className={inputClass(!!errors.adminEmail)}
              />
              {errors.adminEmail && (
                <p className="mt-1 text-xs text-rose-600">{errors.adminEmail}</p>
              )}
            </div>
            {!isEdit && (
              <>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (errors.adminPassword) {
                        setErrors((p) => ({ ...p, adminPassword: '' }));
                      }
                    }}
                    placeholder="Min 6 characters"
                    className={inputClass(!!errors.adminPassword)}
                  />
                  {errors.adminPassword && (
                    <p className="mt-1 text-xs text-rose-600">{errors.adminPassword}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={adminPasswordConfirm}
                    onChange={(e) => {
                      setAdminPasswordConfirm(e.target.value);
                      if (errors.adminPasswordConfirm) {
                        setErrors((p) => ({ ...p, adminPasswordConfirm: '' }));
                      }
                    }}
                    placeholder="Re-enter password"
                    className={inputClass(!!errors.adminPasswordConfirm)}
                  />
                  {errors.adminPasswordConfirm && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.adminPasswordConfirm}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            User will be linked to this branch and the Branch Admin role automatically.
          </p>
        </section>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
            Cancel
            </button>
              <button
                type="submit"
                disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Branch'}
              </button>
          </div>
        </form>
    </div>
  );
}
