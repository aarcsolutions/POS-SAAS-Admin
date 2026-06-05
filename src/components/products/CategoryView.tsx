'use client';

import { useState } from 'react';
import { ArrowLeft, Tag, Trash2, Plus } from 'lucide-react';
import { ProductCategory } from '@/types/product.types';

interface Props {
  categories: ProductCategory[];
  onClose: () => void;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

export default function CategoryView({ categories, onClose, onAdd, onDelete }: Props) {
  const [newName, setNewName] = useState('');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Tag className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
            <p className="text-sm text-slate-500">Manage product categories for your catalog</p>
          </div>
        </div>
      </div>

      {/* Add Category */}
      <div className="mb-6 flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAdd(newName);
              setNewName('');
            }
          }}
          className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          placeholder="Enter new category name..."
        />
        <button
          onClick={() => {
            onAdd(newName);
            setNewName('');
          }}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-slate-300"
          >
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {cat.productCount} products
              </span>
            </div>
            <button
              onClick={() => onDelete(cat.id)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <button
          onClick={onClose}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}
