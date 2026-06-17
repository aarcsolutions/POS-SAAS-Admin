'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  stock: number;
  createdAt: string;
}

interface Props {
  isOpen: boolean;
  editing: RawMaterial | null;
  onClose: () => void;
  onCreate: (payload: Partial<RawMaterial>) => void;
  onUpdate: (id: string, payload: Partial<RawMaterial>) => void;
}

const UNITS = ['Kg', 'Gram', 'Liter', 'Ml', 'Piece', 'Box', 'Packet'];

export default function RawMaterialModal({ isOpen, editing, onClose, onCreate, onUpdate }: Props) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState(UNITS[0]);
  const [stock, setStock] = useState<number | ''>('');

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setUnit(editing.unit);
      setStock(editing.stock);
    } else {
      setName(''); setUnit(UNITS[0]); setStock('');
    }
  }, [editing]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return alert('Material name is required');
    if (editing) {
      onUpdate(editing.id, { name, unit, stock: Number(stock || 0) });
    } else {
      onCreate({ name, unit, stock: Number(stock || 0) });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{editing ? 'Edit Raw Material' : 'Add Raw Material'}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Material Name *</label>
            <input type="text" value={name} onChange={(e)=>setName(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none" placeholder="e.g. Flour" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Unit *</label>
            <select value={unit} onChange={(e)=>setUnit(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none">
              {UNITS.map(u=> <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Initial Stock Quantity</label>
            <input type="number" value={stock as any} onChange={(e)=>setStock(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700">{editing ? 'Update Material' : 'Create Material'}</button>
        </div>
      </div>
    </div>
  );
}
