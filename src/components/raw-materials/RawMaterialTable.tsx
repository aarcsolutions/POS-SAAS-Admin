'use client';

import { useState } from 'react';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  stock: number;
  createdAt: string;
}

interface Props {
  materials: RawMaterial[];
  onView: (m: RawMaterial) => void;
  onEdit: (m: RawMaterial) => void;
  onDelete: (id: string) => void;
}

export default function RawMaterialTable({ materials, onView, onEdit, onDelete }: Props) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-4">Material Name</th>
            <th className="px-5 py-4">Unit</th>
            <th className="px-5 py-4">Current Stock</th>
            <th className="px-5 py-4">Created Date</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {materials.map((m) => (
            <tr key={m.id} className="transition hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold text-slate-900">{m.name}</td>
              <td className="px-5 py-4 text-slate-600">{m.unit}</td>
              <td className="px-5 py-4 text-slate-800 font-semibold">{m.stock}</td>
              <td className="px-5 py-4 text-slate-600">{m.createdAt}</td>
              <td className="px-5 py-4 text-right">
                <div className="relative inline-block">
                  <button onClick={() => setOpenDropdown(openDropdown === m.id ? null : m.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"><MoreHorizontal className="h-4 w-4" /></button>
                  {openDropdown === m.id && (
                    <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                      <button onClick={() => { setOpenDropdown(null); onView(m); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"><Eye className="h-4 w-4" /> View</button>
                      <button onClick={() => { setOpenDropdown(null); onEdit(m); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"><Pencil className="h-4 w-4" /> Edit</button>
                      <button onClick={() => { setOpenDropdown(null); onDelete(m.id); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"><Trash2 className="h-4 w-4" /> Delete</button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {materials.length === 0 && <div className="py-12 text-center text-sm text-slate-400">No raw materials found.</div>}
    </div>
  );
}
