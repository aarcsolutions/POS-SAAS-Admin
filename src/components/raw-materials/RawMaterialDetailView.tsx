'use client';

import { ArrowLeft, Pencil } from 'lucide-react';

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  stock: number;
  createdAt: string;
}

export default function RawMaterialDetailView({ material, onEdit, onClose }: { material: RawMaterial; onEdit: () => void; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <button onClick={onClose} className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">
        <ArrowLeft className="h-4 w-4" /> Back to Raw Materials
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Material Information</h1>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <Pencil className="h-4 w-4" /> Edit Material
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Material Name</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{material.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Unit</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{material.unit}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Current Stock</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{material.stock}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Created Date</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{material.createdAt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
