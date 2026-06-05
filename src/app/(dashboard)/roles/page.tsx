'use client';

import { useState } from 'react';
import {
  Plus, Search, Filter, Eye, Pencil, Trash2, MoreHorizontal, Shield, BadgeCheck, Users,
} from 'lucide-react';
import RoleForm from '@/components/roles/RoleForm';
import RolePermissions from '@/components/roles/RolePermissions';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';

interface RoleItem {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  status: 'Active' | 'Inactive';
  userCount: number;
}

const MOCK_ROLES: RoleItem[] = [
  { id: '1', title: 'Admin', slug: 'admin', created_at: '2023-10-12T00:00:00Z', status: 'Active', userCount: 3 },
  { id: '2', title: 'Manager', slug: 'manager', created_at: '2023-11-05T00:00:00Z', status: 'Active', userCount: 5 },
  { id: '3', title: 'Cashier', slug: 'cashier', created_at: '2023-12-14T00:00:00Z', status: 'Active', userCount: 8 },
  { id: '4', title: 'Viewer', slug: 'viewer', created_at: '2024-01-02T00:00:00Z', status: 'Inactive', userCount: 2 },
  { id: '5', title: 'Kitchen Staff', slug: 'kitchen-staff', created_at: '2024-01-15T00:00:00Z', status: 'Active', userCount: 4 },
  { id: '6', title: 'Delivery Agent', slug: 'delivery-agent', created_at: '2024-02-03T00:00:00Z', status: 'Inactive', userCount: 6 },
];

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.roles.create);
  const canUpdate = usePermission(ENTITY_PERMS.roles.update);
  const canDelete = usePermission(ENTITY_PERMS.roles.delete);

  const filtered = MOCK_ROLES.filter((r) => {
    const m = !searchTerm || r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const ms = !statusFilter || r.status === statusFilter;
    return m && ms;
  });

  const handleOpenForm = (mode: 'create' | 'edit' | 'view', role?: RoleItem) => {
    setFormMode(mode);
    setSelectedRole(role || null);
  };

  if (formMode === 'create') {
    return <RoleForm mode="create" onClose={() => setFormMode(null)} onSubmit={(data) => { console.log('Create role', data); setFormMode(null); }} />;
  }

  if (formMode === 'edit' && selectedRole) {
    return <RoleForm mode="edit" initialData={{ name: selectedRole.title, description: selectedRole.slug, priority: 3 }} onClose={() => setFormMode(null)} onSubmit={(data) => { console.log('Edit role', data); setFormMode(null); }} />;
  }

  if (formMode === 'view' && selectedRole) {
    return <RoleForm mode="view" initialData={{ name: selectedRole.title, description: selectedRole.slug, priority: 3 }} onClose={() => setFormMode(null)} onSubmit={(data) => {}} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Roles & Access Control</h1>
          <p className="mt-1 text-sm text-slate-500">Manage system roles and granular permission mapping</p>
        </div>
        {activeTab === 'roles' && canCreate && (
          <button onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Add Role
          </button>
        )}
      </div>

      <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1">
        <button onClick={() => setActiveTab('roles')}
          className={`rounded-lg px-6 py-1.5 text-sm font-bold transition-all ${activeTab === 'roles' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}>
          Roles
        </button>
        <button onClick={() => setActiveTab('permissions')}
          className={`rounded-lg px-6 py-1.5 text-sm font-bold transition-all ${activeTab === 'permissions' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}>
          Role Permissions
        </button>
      </div>

      {activeTab === 'roles' ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by role name..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              <Filter className="h-4 w-4" /> Clear
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Slug</th>
                  <th className="px-5 py-4">Users</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filtered.map((r) => (
                  <tr key={r.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                          <Shield className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-slate-800">{r.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{r.slug}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                        <Users className="h-3 w-3" /> {r.userCount}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${r.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {r.status === 'Active' ? <BadgeCheck className="h-3 w-3" /> : null}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block">
                        <button onClick={() => setDropdownOpen(dropdownOpen === r.id ? null : r.id)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {dropdownOpen === r.id && (
                          <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                            <button onClick={() => { handleOpenForm('view', r); setDropdownOpen(null); }}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"><Eye className="h-4 w-4" /> View Details</button>
                            {canUpdate && (
                              <button onClick={() => { handleOpenForm('edit', r); setDropdownOpen(null); }}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"><Pencil className="h-4 w-4" /> Edit Role</button>
                            )}
                            {canDelete && (
                              <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"><Trash2 className="h-4 w-4" /> Delete</button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-12 text-center text-sm text-slate-400">No roles found.</div>}
          </div>
        </>
      ) : (
        <RolePermissions />
      )}
    </div>
  );
}
