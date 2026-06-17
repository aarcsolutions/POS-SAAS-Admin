'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  stock: number;
  createdAt: string;
}

interface Props {
  editing: RawMaterial | null;
  onCreate: (payload: Partial<RawMaterial>) => void;
  onUpdate: (id: string, payload: Partial<RawMaterial>) => void;
  onCancel: () => void;
}

const UNITS = ['Kg', 'Gram', 'Liter', 'Ml', 'Piece', 'Box', 'Packet'];

export default function RawMaterialForm({ editing, onCreate, onUpdate, onCancel }: Props) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState(UNITS[0]);
  const [stock, setStock] = useState<number | ''>('');

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setUnit(editing.unit);
      setStock(editing.stock);
    } else {
      setName('');
      setUnit(UNITS[0]);
      setStock('');
    }
  }, [editing]);

  const handleSubmit = () => {
    if (!name.trim()) return alert('Material name is required');
    if (editing) {
      onUpdate(editing.id, { name, unit, stock: Number(stock || 0) });
    } else {
      onCreate({ name, unit, stock: Number(stock || 0) });
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onCancel} className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">
        <ArrowLeft className="h-4 w-4" /> Back to Raw Materials
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{editing ? 'Edit Raw Material' : 'Add Raw Material'}</h1>

        <div className="space-y-5 max-w-2xl">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Material Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Flour"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Unit *</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Initial Stock Quantity</label>
            <input
              type="number"
              value={stock as any}
              onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            {editing ? 'Update Material' : 'Create Material'}
          </button>
        </div>
      </div>
    </div>
  );
}
