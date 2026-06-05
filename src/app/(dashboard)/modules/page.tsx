'use client';

import { useState } from 'react';
import {
  Plus, Search, Filter, Eye, Pencil, Trash2, MoreHorizontal,
  Package, Zap, CreditCard, Globe, Bell, BarChart3, RefreshCcw, Shield, ChevronDown,
} from 'lucide-react';
import ModuleForm from '@/components/modules/ModuleForm';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';

interface ModuleItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  icon: typeof Package;
  color: string;
}

const MOCK_MODULES: ModuleItem[] = [
  { id: 'mod_inv_091', name: 'Inventory Core', slug: 'inventory', description: 'Real-time stock sync and alerts.', version: 'v2.4.1', status: 'Active', icon: Package, color: 'bg-blue-100 text-blue-700' },
  { id: 'mod_loy_112', name: 'Loyalty Rewards', slug: 'loyalty', description: 'Customer points and rewards.', version: 'v1.8.8', status: 'Active', icon: Zap, color: 'bg-purple-100 text-purple-700' },
  { id: 'mod_pay_205', name: 'Payment Gateway', slug: 'payments', description: 'Multi-currency transactions.', version: 'v3.2.8', status: 'Active', icon: CreditCard, color: 'bg-emerald-100 text-emerald-700' },
  { id: 'mod_api_552', name: 'Checkout API', slug: 'checkout-api', description: 'Optimized checkout flow.', version: 'v3.0.2', status: 'Inactive', icon: Globe, color: 'bg-amber-100 text-amber-700' },
  { id: 'mod_not_442', name: 'Notifications', slug: 'notifications', description: 'Alerts and messaging.', version: 'v1.0.5', status: 'Active', icon: Bell, color: 'bg-sky-100 text-sky-700' },
  { id: 'mod_rep_004', name: 'Advanced Reporting', slug: 'reporting', description: 'Financial BI dashboards.', version: 'v2.1.5', status: 'Active', icon: BarChart3, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'mod_eng_881', name: 'Reporting Engine', slug: 'report-engine', description: 'Auto-scheduled reports.', version: 'v4.0.0', status: 'Active', icon: RefreshCcw, color: 'bg-rose-100 text-rose-700' },
  { id: 'mod_sec_109', name: 'Auth Shield', slug: 'auth-shield', description: 'JWT and biometric auth.', version: 'v1.1.0', status: 'Maintenance', icon: Shield, color: 'bg-slate-100 text-slate-700' },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-emerald-100 text-emerald-700';
    case 'Inactive': return 'bg-slate-100 text-slate-500';
    case 'Maintenance': return 'bg-amber-100 text-amber-700';
    default: return 'bg-slate-100 text-slate-500';
  }
};

export default function ModulesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.modules.create);
  const canUpdate = usePermission(ENTITY_PERMS.modules.update);
  const canDelete = usePermission(ENTITY_PERMS.modules.delete);

  const filtered = MOCK_MODULES.filter((m) => {
    const match = !searchTerm || m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const ms = !statusFilter || m.status === statusFilter;
    return match && ms;
  });

  const handleOpenForm = (mode: 'create' | 'edit' | 'view', mod?: ModuleItem) => {
    setFormMode(mode);
    setSelectedModule(mod || null);
  };

  if (formMode === 'create') {
    return <ModuleForm mode="create" onClose={() => setFormMode(null)} onSubmit={(data) => { console.log('Create module', data); setFormMode(null); }} />;
  }

  if (formMode === 'edit' && selectedModule) {
    return <ModuleForm mode="edit" initialData={{ name: selectedModule.name, slug: selectedModule.slug, description: selectedModule.description, isActive: selectedModule.status === 'Active' }} onClose={() => setFormMode(null)} onSubmit={(data) => { console.log('Edit module', data); setFormMode(null); }} />;
  }

  if (formMode === 'view' && selectedModule) {
    return <ModuleForm mode="view" initialData={{ name: selectedModule.name, slug: selectedModule.slug, description: selectedModule.description, isActive: selectedModule.status === 'Active' }} onClose={() => setFormMode(null)} onSubmit={() => {}} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Modules</h1>
          <p className="mt-1 text-sm text-slate-500">Manage system modules and platform features</p>
        </div>
        {canCreate && (
          <button onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Add Module
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by module name or slug..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <button onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
          <Filter className="h-4 w-4" /> Clear
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Module</th>
              <th className="px-5 py-4">Slug</th>
              <th className="px-5 py-4">Version</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Description</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filtered.map((m) => {
              const Icon = m.icon;
              return (
                <tr key={m.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-slate-800">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">{m.slug}</td>
                  <td className="px-5 py-4 text-xs font-bold text-slate-600">{m.version}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusStyle(m.status)}`}>{m.status}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">{m.description}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="relative inline-block">
                      <details className="relative inline-block">
                        <summary className="inline-flex list-none cursor-pointer items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </summary>
                        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg text-left">
                          <button onClick={() => handleOpenForm('view', m)}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"><Eye className="h-4 w-4" /> View Details</button>
                          {canUpdate && (
                            <button onClick={() => handleOpenForm('edit', m)}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"><Pencil className="h-4 w-4" /> Edit Module</button>
                          )}
                          {canDelete && (
                            <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"><Trash2 className="h-4 w-4" /> Deactivate</button>
                          )}
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-slate-400">No modules found.</div>}
      </div>
    </div>
  );
}
