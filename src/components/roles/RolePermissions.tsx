'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, Search, Save, Loader2, Shield } from 'lucide-react';
import {
  useRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
} from '@/hooks/roles';
import { ModuleWithPermissions } from '@/types/rbac.types';

interface Props {
  roleId: string;
  roleTitle: string;
  onClose: () => void;
}

export default function RolePermissions({ roleId, roleTitle, onClose }: Props) {
  const { data, isLoading } = useRolePermissionsQuery(roleId);
  const updateMutation = useUpdateRolePermissionsMutation();
  const [modules, setModules] = useState<ModuleWithPermissions[]>([]);
  const [search, setSearch] = useState('');
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const list = data?.data?.modulesWithPermissions ?? [];
    setModules(list);
    const open: Record<string, boolean> = {};
    list.forEach((m) => {
      open[m.id] = true;
    });
    setOpenModules(open);
  }, [data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return modules;
    const q = search.toLowerCase();
    return modules
      .map((m) => ({
        ...m,
        permissions: m.permissions.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q) ||
            m.title.toLowerCase().includes(q)
        ),
      }))
      .filter((m) => m.permissions.length > 0 || m.title.toLowerCase().includes(q));
  }, [modules, search]);

  const togglePermission = (moduleId: string, permissionId: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id !== moduleId
          ? m
          : {
              ...m,
              permissions: m.permissions.map((p) =>
                p.id === permissionId ? { ...p, is_allowed: !p.is_allowed } : p
              ),
            }
      )
    );
  };

  const toggleModuleAll = (moduleId: string, allowed: boolean) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id !== moduleId
          ? m
          : {
              ...m,
              permissions: m.permissions.map((p) => ({
                ...p,
                is_allowed: allowed,
              })),
            }
      )
    );
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync({ roleId, modules });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={onClose}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Roles
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            Permissions — {roleTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Toggle module access for this role within the tenant.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending || isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-70"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Permissions
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search modules or permissions..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((module) => {
            const allOn = module.permissions.every((p) => p.is_allowed);
            const open = openModules[module.id];
            return (
              <div
                key={module.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenModules((prev) => ({
                      ...prev,
                      [module.id]: !prev[module.id],
                    }))
                  }
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    {module.title}
                    <span className="text-xs font-medium text-slate-400">
                      ({module.permissions.filter((p) => p.is_allowed).length}/
                      {module.permissions.length})
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
                        onClick={() => toggleModuleAll(module.id, true)}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"
                      >
                        Allow all
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleModuleAll(module.id, false)}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"
                      >
                        Deny all
                      </button>
                      {!allOn && null}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {module.permissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={permission.is_allowed}
                            onChange={() =>
                              togglePermission(module.id, permission.id)
                            }
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
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">
              No modules found for this tenant.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
