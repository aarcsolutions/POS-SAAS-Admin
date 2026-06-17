'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Search, Save, Loader2, ShieldAlert, Info } from 'lucide-react';

interface ModulePerm {
  id: string;
  title: string;
}

interface ModuleGroup {
  id: string;
  title: string;
  permissions: ModulePerm[];
}

const MOCK_MODULES: ModuleGroup[] = [
  {
    id: 'mod_1',
    title: 'Dashboard',
    permissions: [
      { id: 'p1', title: 'View Dashboard' },
    ],
  },
  {
    id: 'mod_2',
    title: 'Business Settings',
    permissions: [
      { id: 'p2', title: 'View Settings' },
      { id: 'p3', title: 'Update Settings' },
    ],
  },
  {
    id: 'mod_3',
    title: 'Branch Management',
    permissions: [
      { id: 'p4', title: 'List Branches' },
      { id: 'p5', title: 'Create Branch' },
      { id: 'p6', title: 'Edit Branch' },
      { id: 'p7', title: 'Delete Branch' },
    ],
  },
  {
    id: 'mod_4',
    title: 'User Management',
    permissions: [
      { id: 'p8', title: 'List Users' },
      { id: 'p9', title: 'Create User' },
      { id: 'p10', title: 'Edit User' },
      { id: 'p11', title: 'Delete User' },
    ],
  },
  {
    id: 'mod_5',
    title: 'Product Management',
    permissions: [
      { id: 'p12', title: 'List Products' },
      { id: 'p13', title: 'Create Product' },
      { id: 'p14', title: 'Edit Product' },
      { id: 'p15', title: 'Delete Product' },
    ],
  },
  {
    id: 'mod_6',
    title: 'Inventory Management',
    permissions: [
      { id: 'p16', title: 'View Inventory' },
      { id: 'p17', title: 'Stock In/Out' },
      { id: 'p18', title: 'Manage Alerts' },
    ],
  },
  {
    id: 'mod_7',
    title: 'Sales & Reports',
    permissions: [
      { id: 'p19', title: 'View Reports' },
      { id: 'p20', title: 'Export Reports' },
    ],
  },
  {
    id: 'mod_8',
    title: 'Customers',
    permissions: [
      { id: 'p21', title: 'List Customers' },
      { id: 'p22', title: 'Create Customer' },
      { id: 'p23', title: 'Edit Customer' },
      { id: 'p24', title: 'Delete Customer' },
    ],
  },
  {
    id: 'mod_9',
    title: 'Suppliers',
    permissions: [
      { id: 'p25', title: 'List Suppliers' },
      { id: 'p26', title: 'Create Supplier' },
      { id: 'p27', title: 'Edit Supplier' },
      { id: 'p28', title: 'Delete Supplier' },
    ],
  },
  {
    id: 'mod_10',
    title: 'Transactions',
    permissions: [
      { id: 'p29', title: 'View Transactions' },
      { id: 'p30', title: 'Create Transaction' },
    ],
  },
];

const MOCK_ROLES = [
  { id: 'r1', label: 'Admin' },
  { id: 'r2', label: 'Manager' },
  { id: 'r3', label: 'Cashier' },
  { id: 'r4', label: 'Viewer' },
];

export default function RolePermissions() {
  const [selectedRole, setSelectedRole] = useState<string>('r1');
  const [searchQuery, setSearchQuery] = useState('');
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({ mod_1: true });
  const [localPermissions, setLocalPermissions] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    MOCK_MODULES.forEach((m) => m.permissions.forEach((p) => { map[p.id] = true; }));
    return map;
  });
  const [saving, setSaving] = useState(false);

  const toggleModule = (id: string) => {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePermission = (id: string) => {
    setLocalPermissions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    console.log('Saved permissions for role', selectedRole, localPermissions);
  };

  const filteredModules = useMemo(() => {
    return MOCK_MODULES.filter(
      (m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.permissions.some((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const totalAllowed = Object.values(localPermissions).filter((v) => v).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Select Role</h3>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>

          <div className="relative mb-6">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              {MOCK_ROLES.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900">Role Permissions</h4>
              <p className="mt-1 text-xs text-slate-500">
                Currently editing permissions for: <span className="font-bold text-emerald-600">{MOCK_ROLES.find((r) => r.id === selectedRole)?.label}</span>
              </p>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${totalAllowed > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
              {totalAllowed} Permissions Allowed
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search modules or permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="space-y-3">
            {filteredModules.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-16 text-slate-400">
                <Search className="mb-2 h-8 w-8 opacity-20" />
                <p className="text-sm">No modules matching your search</p>
              </div>
            ) : (
              filteredModules.map((module) => {
                const selectedCount = module.permissions.filter((p) => localPermissions[p.id]).length;
                const isOpen = !!openModules[module.id];
                return (
                  <div key={module.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${!isOpen ? '-rotate-90' : ''}`} />
                        <span className="text-sm font-bold text-slate-900">{module.title}</span>
                      </div>
                      <div className={`rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${selectedCount > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {selectedCount} Selected
                      </div>
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-200 bg-white p-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                          {module.permissions.map((p) => {
                            const isAllowed = !!localPermissions[p.id];
                            return (
                              <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 hover:bg-slate-100 transition-colors">
                                <span className={`text-xs font-medium transition-colors truncate ${isAllowed ? 'text-slate-800' : 'text-slate-400'}`}>{p.title}</span>
                                <button
                                  onClick={() => togglePermission(p.id)}
                                  className={`relative h-5 w-9 rounded-full transition-colors focus:outline-none flex-shrink-0 ml-2 ${isAllowed ? 'bg-emerald-600' : 'bg-slate-200'}`}
                                >
                                  <div className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isAllowed ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-b-2xl border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-500">
          <p>Total Modules: <span className="font-bold text-slate-800">{MOCK_MODULES.length}</span></p>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>Changes are only saved once you click Save Changes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
