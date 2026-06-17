'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import RawMaterialTable from '@/components/raw-materials/RawMaterialTable';
import RawMaterialForm from '@/components/raw-materials/RawMaterialForm';
import RawMaterialDetailView from '@/components/raw-materials/RawMaterialDetailView';
import DeleteConfirm from '@/components/raw-materials/DeleteConfirm';
import { notifySuccess } from '@/utils/notify';

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  stock: number;
  createdAt: string;
}

const mockData: RawMaterial[] = [
  { id: 'RM-1', name: 'Flour', unit: 'Kg', stock: 120, createdAt: '2024-05-10' },
  { id: 'RM-2', name: 'Sugar', unit: 'Kg', stock: 60, createdAt: '2024-05-12' },
  { id: 'RM-3', name: 'Milk', unit: 'Liter', stock: 200, createdAt: '2024-06-01' },
];

export default function RawMaterialsPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>(mockData);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [editing, setEditing] = useState<RawMaterial | null>(null);
  const [viewing, setViewing] = useState<RawMaterial | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onCreate = (payload: Partial<RawMaterial>) => {
    const newItem: RawMaterial = {
      id: `RM-${Math.random().toString(36).substr(2, 6)}`,
      name: payload.name || 'Untitled',
      unit: payload.unit || 'Kg',
      stock: payload.stock || 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMaterials((s) => [newItem, ...s]);
    notifySuccess('Raw material created');
    setMode('list');
  };

  const onUpdate = (id: string, payload: Partial<RawMaterial>) => {
    setMaterials((s) => s.map((m) => (m.id === id ? { ...m, ...payload } : m)));
    notifySuccess('Raw material updated');
    setEditing(null);
    setMode('list');
  };

  const onDelete = (id: string) => {
    setMaterials((s) => s.filter((m) => m.id !== id));
    notifySuccess('Raw material deleted');
    setDeletingId(null);
  };

  const filtered = useMemo(() => materials.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())), [materials, search]);

  if (mode === 'create' || (mode === 'edit' && editing)) {
    return (
      <RawMaterialForm
        editing={mode === 'edit' ? editing : null}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onCancel={() => { setMode('list'); setEditing(null); }}
      />
    );
  }

  if (mode === 'view' && viewing) {
    return <RawMaterialDetailView material={viewing} onEdit={() => { setEditing(viewing); setMode('edit'); }} onClose={() => { setMode('list'); setViewing(null); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Raw Materials</h1>
          <p className="mt-1 text-sm text-slate-500">Manage inventory materials used in recipes and production.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search Raw Material" className="h-11 w-[320px] rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
          </div>
          <button onClick={()=>setMode('create')} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Add Raw Material
          </button>
        </div>
      </div>

      <RawMaterialTable
        materials={filtered}
        onView={(m)=>{ setViewing(m); setMode('view'); }}
        onEdit={(m)=>{ setEditing(m); setMode('edit'); }}
        onDelete={(id)=>setDeletingId(id)}
      />

      {deletingId && <DeleteConfirm id={deletingId} onCancel={()=>setDeletingId(null)} onConfirm={() => onDelete(deletingId)} />}
    </div>
  );
}
