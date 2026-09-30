'use client';

import { Eye, Pencil, Trash2, Loader2, Package } from 'lucide-react';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import { RawMaterial } from '@/types/raw-material.types';

interface Props {
  materials: RawMaterial[];
  loading?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  dropdownOpen: string | null;
  onDropdownChange: (id: string | null) => void;
  onView: (m: RawMaterial) => void;
  onEdit: (m: RawMaterial) => void;
  onDelete: (id: string) => void;
}

function formatDate(value: string) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

export default function RawMaterialTable({
  materials,
  loading,
  canUpdate,
  canDelete,
  dropdownOpen,
  onDropdownChange,
  onView,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-4">Material Name</th>
            <th className="px-5 py-4">Unit</th>
            <th className="px-5 py-4">Current Stock</th>
            <th className="px-5 py-4">Min Qty</th>
            <th className="px-5 py-4">Created Date</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {loading ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-slate-400">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              </td>
            </tr>
          ) : materials.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-slate-400">
                <Package className="mx-auto mb-2 h-8 w-8 opacity-40" />
                No raw materials found.
              </td>
            </tr>
          ) : (
            materials.map((m) => (
              <tr key={m.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4 font-semibold text-slate-900">
                  {m.name}
                </td>
                <td className="px-5 py-4 text-slate-600">{m.unit}</td>
                <td className="px-5 py-4 font-semibold text-slate-800">
                  {Number(m.stock_quantity).toLocaleString()}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {Number(m.min_stock_level ?? 0).toLocaleString()}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {formatDate(m.created_at)}
                </td>
                <td className="px-5 py-4 text-right">
                  <RowActionsMenu
                    open={dropdownOpen === m.id}
                    onOpenChange={(open) =>
                      onDropdownChange(open ? m.id : null)
                    }
                  >
                    <button
                      type="button"
                      onClick={() => onView(m)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="h-4 w-4" /> View
                    </button>
                    {canUpdate && (
                      <button
                        type="button"
                        onClick={() => onEdit(m)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(m.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--brand-primary-dark)] hover:bg-[var(--brand-primary-soft)]"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    )}
                  </RowActionsMenu>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
