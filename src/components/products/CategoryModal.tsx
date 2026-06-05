'use client';

import { useState } from 'react';
import { X, Tag, Trash2, Plus } from 'lucide-react';
import { ProductCategory } from '@/types/product.types';

interface Props {
  isOpen: boolean;
  categories: ProductCategory[];
  onClose: () => void;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

export default function CategoryModal({ isOpen, categories, onClose, onAdd, onDelete }: Props) {
  const [newName, setNewName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Categories</h2>
              <p className="text-sm text-slate-500">Manage product categories</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add Category */}
        <div className="mb-5 flex gap-2">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { onAdd(newName); setNewName(''); } }}
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            placeholder="New category name..." />
          <button onClick={() => { onAdd(newName); setNewName(''); }}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {/* Category List */}
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600">{cat.productCount}</span>
              </div>
              <button onClick={() => onDelete(cat.id)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
