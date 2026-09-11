'use client';

import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Link2,
  Loader2,
  Package,
  Plus,
  Trash2,
} from 'lucide-react';
import { Select } from '@/components/ui/Select';
import {
  useAssignedMaterialsQuery,
  useUnassignRawMaterialMutation,
} from '@/hooks/suppliers';
import { suppliersApi } from '@/services/suppliers';
import { useRawMaterialsQuery } from '@/hooks/raw-materials';
import { extractListItems } from '@/utils/helpers';
import { RawMaterial } from '@/types/raw-material.types';
import {
  SupplierRawMaterialRow,
  SupplierRow,
} from '@/types/supplier.types';
import { confirmDialog } from '@/store/dialogStore';
import { toast } from 'sonner';

interface Props {
  supplier: SupplierRow;
  onClose: () => void;
}

type DraftRow = {
  key: string;
  raw_material_id: string;
  unit_price: string;
  min_order_qty: string;
  lead_time_days: string;
  notes: string;
};

const emptyRow = (): DraftRow => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  raw_material_id: '',
  unit_price: '',
  min_order_qty: '',
  lead_time_days: '',
  notes: '',
});

export default function AssignMaterialsPanel({ supplier, onClose }: Props) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<DraftRow[]>([emptyRow()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: assignedRes, isLoading: assignedLoading } =
    useAssignedMaterialsQuery(supplier.id);
  const { data: materialsRes, isLoading: materialsLoading } =
    useRawMaterialsQuery({ page: 1, limit: 100 });

  const unassignMutation = useUnassignRawMaterialMutation();

  const assigned = extractListItems<SupplierRawMaterialRow>(
    assignedRes,
    'materials'
  );
  const materials = extractListItems<RawMaterial>(materialsRes);

  const assignedIds = useMemo(
    () => new Set(assigned.map((a) => a.raw_material_id)),
    [assigned]
  );

  const updateRow = (key: string, patch: Partial<DraftRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
  };

  const removeRow = (key: string) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)));
  };

  const optionsForRow = (rowKey: string) => {
    const selectedElsewhere = new Set(
      rows
        .filter((r) => r.key !== rowKey && r.raw_material_id)
        .map((r) => r.raw_material_id)
    );
    return materials
      .filter((m) => !assignedIds.has(m.id) && !selectedElsewhere.has(m.id))
      .map((m) => ({
        value: m.id,
        label: `${m.name} (${m.unit})`,
      }));
  };

  const resetForm = () => {
    setRows([emptyRow()]);
    setErrors({});
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const eMap: Record<string, string> = {};

    rows.forEach((row, i) => {
      const prefix = row.key;
      if (!row.raw_material_id) {
        eMap[`${prefix}_material`] = `Row ${i + 1}: select a raw material`;
      }
      const price = Number(row.unit_price);
      if (!row.unit_price.trim() || Number.isNaN(price) || price < 0) {
        eMap[`${prefix}_price`] = `Row ${i + 1}: unit price must be 0 or greater`;
      }
      if (row.min_order_qty.trim()) {
        const q = Number(row.min_order_qty);
        if (Number.isNaN(q) || q < 0) {
          eMap[`${prefix}_moq`] = `Row ${i + 1}: invalid min qty`;
        }
      }
      if (row.lead_time_days.trim()) {
        const d = Number(row.lead_time_days);
        if (!Number.isInteger(d) || d < 0) {
          eMap[`${prefix}_lead`] = `Row ${i + 1}: invalid lead days`;
        }
      }
    });

    setErrors(eMap);
    if (Object.keys(eMap).length > 0) return;

    setSubmitting(true);
    let ok = 0;
    let failed = 0;
    let lastError = '';
    try {
      for (const row of rows) {
        try {
          await suppliersApi.assignRawMaterial({
            supplier_id: supplier.id,
            raw_material_id: row.raw_material_id,
            unit_price: Number(row.unit_price),
            min_order_qty: row.min_order_qty.trim()
              ? Number(row.min_order_qty)
              : undefined,
            lead_time_days: row.lead_time_days.trim()
              ? Number(row.lead_time_days)
              : undefined,
            notes: row.notes.trim() || undefined,
          });
          ok += 1;
        } catch (err: any) {
          failed += 1;
          lastError =
            err?.response?.data?.message || err?.message || 'Assign failed';
        }
      }
      if (ok > 0) {
        await queryClient.invalidateQueries({
          queryKey: ['supplier-materials', supplier.id],
        });
      }
      if (ok > 0 && failed === 0) {
        toast.success(
          ok === 1 ? 'Material assigned' : `${ok} materials assigned`
        );
        resetForm();
      } else if (ok > 0 && failed > 0) {
        toast.warning(`${ok} assigned, ${failed} failed`);
        resetForm();
      } else if (failed > 0) {
        toast.error(lastError || 'Failed to assign materials');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async (row: SupplierRawMaterialRow) => {
    const ok = await confirmDialog({
      title: 'Unassign material',
      message: `Remove ${row.raw_material_name || 'this material'} from ${supplier.name}?`,
      confirmLabel: 'Unassign',
      variant: 'danger',
    });
    if (!ok) return;
    unassignMutation.mutate({ id: row.id, supplierId: supplier.id });
  };

  const busy = submitting || unassignMutation.isPending;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Suppliers
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Assign Materials
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Map raw materials and default prices for{' '}
          <span className="font-semibold text-slate-700">{supplier.name}</span>.
          Use + to add multiple materials, then assign all at once.
        </p>
      </div>

      <div className="space-y-6">
        <form
          onSubmit={handleAssign}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Link2 className="h-4 w-4" /> Add mappings
          </div>

          <div className="space-y-4">
            {rows.map((row, index) => {
              const opts = optionsForRow(row.key);
              return (
                <div
                  key={row.key}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Material {index + 1}
                    </span>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.key)}
                        disabled={busy}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="sm:col-span-2 lg:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Raw material
                      </label>
                      <Select
                        value={row.raw_material_id}
                        onChange={(v) =>
                          updateRow(row.key, { raw_material_id: v })
                        }
                        options={opts}
                        placeholder="Select material"
                        disabled={busy || materialsLoading}
                        loading={materialsLoading}
                        searchable
                        searchPlaceholder="Search materials…"
                        emptyMessage="No materials available"
                      />
                      {errors[`${row.key}_material`] && (
                        <p className="mt-1 text-xs text-rose-600">
                          {errors[`${row.key}_material`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Unit price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.unit_price}
                        onChange={(e) =>
                          updateRow(row.key, { unit_price: e.target.value })
                        }
                        disabled={busy}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                      />
                      {errors[`${row.key}_price`] && (
                        <p className="mt-1 text-xs text-rose-600">
                          {errors[`${row.key}_price`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Min qty
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.min_order_qty}
                        onChange={(e) =>
                          updateRow(row.key, { min_order_qty: e.target.value })
                        }
                        disabled={busy}
                        placeholder="Optional"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                      />
                      {errors[`${row.key}_moq`] && (
                        <p className="mt-1 text-xs text-rose-600">
                          {errors[`${row.key}_moq`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Lead days
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={row.lead_time_days}
                        onChange={(e) =>
                          updateRow(row.key, {
                            lead_time_days: e.target.value,
                          })
                        }
                        disabled={busy}
                        placeholder="Optional"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                      />
                      {errors[`${row.key}_lead`] && (
                        <p className="mt-1 text-xs text-rose-600">
                          {errors[`${row.key}_lead`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Notes
                      </label>
                      <input
                        value={row.notes}
                        onChange={(e) =>
                          updateRow(row.key, { notes: e.target.value })
                        }
                        disabled={busy}
                        placeholder="Optional"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={addRow}
              disabled={
                busy ||
                materialsLoading ||
                materialOptionsEmpty(materials, assignedIds, rows)
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--brand-primary-soft)] bg-[var(--brand-primary-soft)] px-3.5 py-2.5 text-sm font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add material
            </button>
            <button
              type="submit"
              disabled={busy || materialsLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Assign {rows.length > 1 ? `${rows.length} materials` : 'material'}
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-800">
              Assigned materials
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Default unit prices used when creating purchase orders
            </p>
          </div>

          {assignedLoading ? (
            <div className="flex justify-center py-12 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : assigned.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              <Package className="mx-auto mb-2 h-8 w-8 opacity-40" />
              No materials assigned yet
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-bold">Material</th>
                  <th className="px-5 py-3 font-bold">Unit price</th>
                  <th className="px-5 py-3 font-bold">Min qty</th>
                  <th className="px-5 py-3 font-bold">Lead days</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assigned.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-800">
                        {row.raw_material_name || row.raw_material_id}
                      </div>
                      {row.raw_material_unit && (
                        <div className="text-xs text-slate-400">
                          {row.raw_material_unit}
                        </div>
                      )}
                      {row.notes && (
                        <div className="mt-0.5 text-xs text-slate-400">
                          {row.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {Number(row.unit_price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {row.min_order_qty ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {row.lead_time_days ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleUnassign(row)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Unassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function materialOptionsEmpty(
  materials: RawMaterial[],
  assignedIds: Set<string>,
  rows: DraftRow[]
) {
  const selected = new Set(rows.map((r) => r.raw_material_id).filter(Boolean));
  const available = materials.filter(
    (m) => !assignedIds.has(m.id) && !selected.has(m.id)
  );
  return available.length === 0;
}
