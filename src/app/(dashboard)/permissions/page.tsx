'use client';

import { useState } from 'react';
import {
  Plus, Search, Filter, Eye, Pencil, Trash2, MoreHorizontal,
  Lock, ChevronDown,
} from 'lucide-react';
import PermissionForm from '@/components/permissions/PermissionForm';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';

interface PermissionItem {
  id: string;
  name: string;
  module: string;
  action: string;
  description: string;
}

const MOCK_PERMISSIONS: PermissionItem[] = [
  { id: '1', name: 'dashboard.view', module: 'Dashboard', action: 'READ', description: 'View the main dashboard overview.' },
  { id: '2', name: 'users.create', module: 'User Management', action: 'CREATE', description: 'Create new user accounts.' },
  { id: '3', name: 'users.update', module: 'User Management', action: 'UPDATE', description: 'Edit existing user details.' },
  { id: '4', name: 'products.delete', module: 'Product Management', action: 'DELETE', description: 'Remove products from the catalog.' },
  { id: '5', name: 'inventory.view', module: 'Inventory Management', action: 'READ', description: 'View inventory stock levels.' },
  { id: '6', name: 'reports.export', module: 'Sales & Reports', action: 'READALL', description: 'Export sales and profit reports.' },
  { id: '7', name: 'customers.create', module: 'Customers', action: 'CREATE', description: 'Add new customer records.' },
  { id: '8', name: 'suppliers.update', module: 'Suppliers', action: 'UPDATE', description: 'Modify supplier contact details.' },
];

const getActionStyle = (action: string) => {
  switch (action) {
    case 'READ': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'CREATE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'UPDATE': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'DELETE': return 'bg-rose-100 text-rose-700 border-rose-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const getModuleStyle = (module: string) => {
  switch (module) {
    case 'Dashboard': return 'bg-blue-50 text-blue-700';
    case 'User Management': return 'bg-purple-50 text-purple-700';
    case 'Product Management': return 'bg-emerald-50 text-emerald-700';
    case 'Inventory Management': return 'bg-orange-50 text-orange-700';
    case 'Sales & Reports': return 'bg-indigo-50 text-indigo-700';
    case 'Customers': return 'bg-sky-50 text-sky-700';
    case 'Suppliers': return 'bg-teal-50 text-teal-700';
    default: return 'bg-slate-50 text-slate-600';
  }
};

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<PermissionItem | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.permissions.create);
  const canUpdate = usePermission(ENTITY_PERMS.permissions.update);
  const canDelete = usePermission(ENTITY_PERMS.permissions.delete);

  const filtered = MOCK_PERMISSIONS.filter((p) => {
    const m = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.module.toLowerCase().includes(searchTerm.toLowerCase());
    const mf = !moduleFilter || p.module === moduleFilter;
    const af = !actionFilter || p.action === actionFilter;
    return m && mf && af;
  });

  const uniqueModules = [...new Set(MOCK_PERMISSIONS.map((p) => p.module))];
  const uniqueActions = [...new Set(MOCK_PERMISSIONS.map((p) => p.action))];

  const handleOpenForm = (mode: 'create' | 'edit' | 'view', perm?: PermissionItem) => {
    setFormMode(mode);
    setSelectedPermission(perm || null);
  };

  if (formMode === 'create') {
    return <PermissionForm mode="create" onClose={() => setFormMode(null)} onSubmit={(data) => { console.log('Create permission', data); setFormMode(null); }} />;
  }

  if (formMode === 'edit' && selectedPermission) {
    return <PermissionForm mode="edit" initialData={{ name: selectedPermission.name, module: selectedPermission.module, action: selectedPermission.action, description: selectedPermission.description }} onClose={() => setFormMode(null)} onSubmit={(data) => { console.log('Edit permission', data); setFormMode(null); }} />;
  }

  if (formMode === 'view' && selectedPermission) {
    return <PermissionForm mode="view" initialData={{ name: selectedPermission.name, module: selectedPermission.module, action: selectedPermission.action, description: selectedPermission.description }} onClose={() => setFormMode(null)} onSubmit={() => {}} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Permissions</h1>
          <p className="mt-1 text-sm text-slate-500">Manage system permissions and access control definitions</p>
        </div>
        {canCreate && (
          <button onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Add Permission
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by permission name or module..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
        </div>
        <div className="relative">
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}
            className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
            <option value="">All Modules</option>
            {uniqueModules.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
            className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
            <option value="">All Actions</option>
            {uniqueActions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <button onClick={() => { setSearchTerm(''); setModuleFilter(''); setActionFilter(''); }}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
          <Filter className="h-4 w-4" /> Clear
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Permission Name</th>
              <th className="px-5 py-4">Module</th>
              <th className="px-5 py-4">Action</th>
              <th className="px-5 py-4">Description</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filtered.map((p) => (
              <tr key={p.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Lock className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-slate-800">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getModuleStyle(p.module)}`}>{p.module}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-md px-2.5 py-1 text-xs font-bold border ${getActionStyle(p.action)}`}>{p.action}</span>
                </td>
                <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">{p.description}</td>
                <td className="px-5 py-4 text-right">
                  <div className="relative inline-block">
                    <details className="relative inline-block">
                      <summary className="inline-flex list-none cursor-pointer items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-slate-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </summary>
                      <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg text-left">
                        <button onClick={() => handleOpenForm('view', p)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"><Eye className="h-4 w-4" /> View Details</button>
                        {canUpdate && (
                          <button onClick={() => handleOpenForm('edit', p)}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"><Pencil className="h-4 w-4" /> Edit Permission</button>
                        )}
                        {canDelete && (
                          <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"><Trash2 className="h-4 w-4" /> Deactivate</button>
                        )}
                      </div>
                    </details>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-slate-400">No permissions found.</div>}
      </div>
    </div>
  );
}
