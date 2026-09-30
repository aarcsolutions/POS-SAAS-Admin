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
  useAssignedItemsQuery,
  useUnassignRawMaterialMutation,
} from '@/hooks/suppliers';
import { suppliersApi } from '@/services/suppliers';
import { useRawMaterialsQuery } from '@/hooks/raw-materials';
import { useInventoryItemsQuery } from '@/hooks/inventory-items';
import { useProductsQuery } from '@/hooks/products';
import { extractListItems } from '@/utils/helpers';
import { RawMaterial } from '@/types/raw-material.types';
import { InventoryItem } from '@/types/inventory-item.types';
import { Product } from '@/types/product.types';
import {
  SupplierAssignedItemRow,
  SupplierItemLineType,
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
  item_id: string;
  unit_price: string;
  min_order_qty: string;
  lead_time_days: string;
  notes: string;
};

const LINE_TYPE_TABS: { value: SupplierItemLineType; label: string }[] = [
  { value: 'raw_material', label: 'Raw Material' },
  { value: 'product_variant', label: 'Product (Direct Stock)' },
  { value: 'inventory_item', label: 'Inventory Item' },
];

const emptyRow = (): DraftRow => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  item_id: '',
  unit_price: '',
  min_order_qty: '',
  lead_time_days: '',
  notes: '',
});

function lineTypeLabel(t: SupplierItemLineType) {
  return (
    LINE_TYPE_TABS.find((x) => x.value === t)?.label || t
  );
}

function assignedItemId(row: SupplierAssignedItemRow): string | null {
  if (row.line_type === 'raw_material') return row.raw_material_id || null;
  if (row.line_type === 'product_variant') return row.product_variant_id || null;
  if (row.line_type === 'inventory_item') return row.inventory_item_id || null;
  return (
    row.raw_material_id ||
    row.product_variant_id ||
    row.inventory_item_id ||
    null
  );
}

function displayName(row: SupplierAssignedItemRow) {
  return (
    row.item_name ||
    row.raw_material_name ||
    assignedItemId(row) ||
    'Item'
  );
}

function displayUnit(row: SupplierAssignedItemRow) {
  return row.unit || row.raw_material_unit || null;
}

export default function AssignMaterialsPanel({ supplier, onClose }: Props) {
  const queryClient = useQueryClient();
  const [lineType, setLineType] =
    useState<SupplierItemLineType>('raw_material');
  const [rows, setRows] = useState<DraftRow[]>([emptyRow()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: assignedRes, isLoading: assignedLoading } =
    useAssignedItemsQuery(supplier.id);
  const { data: materialsRes, isLoading: materialsLoading } =
    useRawMaterialsQuery({ page: 1, limit: 100 });
  const { data: inventoryRes, isLoading: inventoryLoading } =
    useInventoryItemsQuery(
      { page: 1, limit: 100 },
      lineType === 'inventory_item'
    );
  const { data: productsRes, isLoading: productsLoading } = useProductsQuery(
    { page: 1, limit: 100 },
    lineType === 'product_variant'
  );

  const unassignMutation = useUnassignRawMaterialMutation();

  const assignedAll = extractListItems<SupplierAssignedItemRow>(
    assignedRes,
    'items'
  );
  const assigned = useMemo(
    () => assignedAll.filter((a) => a.line_type === lineType),
    [assignedAll, lineType]
  );

  const materials = extractListItems<RawMaterial>(materialsRes);
  const inventoryItems = extractListItems<InventoryItem>(inventoryRes);
  const products = extractListItems<Product>(productsRes, 'products').filter(
    (p) => p.inventory_tracking === 'direct_stock'
  );

  const variantOptions = useMemo(() => {
    const list: { id: string; label: string }[] = [];
    products.forEach((p) => {
      (p.variants || []).forEach((v) => {
        if (!v.id) return;
        list.push({
          id: v.id,
          label: `${p.name} — ${v.name}`,
        });
      });
    });
    return list;
  }, [products]);

  const assignedIds = useMemo(() => {
    const set = new Set<string>();
    assigned.forEach((a) => {
      const id = assignedItemId(a);
      if (id) set.add(id);
    });
    return set;
  }, [assigned]);

  const selectableLoading =
    lineType === 'raw_material'
      ? materialsLoading
      : lineType === 'inventory_item'
        ? inventoryLoading
        : productsLoading;

  const catalogOptions = useMemo(() => {
    if (lineType === 'raw_material') {
      return materials.map((m) => ({
        value: m.id,
        label: `${m.name} (${m.unit})`,
      }));
    }
    if (lineType === 'inventory_item') {
      return inventoryItems.map((m) => ({
        value: m.id,
        label: `${m.name} (${m.unit})`,
      }));
    }
    return variantOptions.map((v) => ({
      value: v.id,
      label: v.label,
    }));
  }, [lineType, materials, inventoryItems, variantOptions]);

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

  const changeLineType = (next: SupplierItemLineType) => {
    setLineType(next);
    setRows([emptyRow()]);
    setErrors({});
  };

  const optionsForRow = (rowKey: string) => {
    const selectedElsewhere = new Set(
      rows
        .filter((r) => r.key !== rowKey && r.item_id)
        .map((r) => r.item_id)
    );
    return catalogOptions.filter(
      (o) => !assignedIds.has(o.value) && !selectedElsewhere.has(o.value)
    );
  };

  const resetForm = () => {
    setRows([emptyRow()]);
    setErrors({});
  };

  const itemFieldLabel =
    lineType === 'raw_material'
      ? 'Raw material'
      : lineType === 'inventory_item'
        ? 'Inventory item'
        : 'Product variant';

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const eMap: Record<string, string> = {};

    rows.forEach((row, i) => {
      const prefix = row.key;
      if (!row.item_id) {
        eMap[`${prefix}_material`] = `Row ${i + 1}: select an item`;
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
          const base = {
            supplier_id: supplier.id,
            line_type: lineType,
            unit_price: Number(row.unit_price),
            min_order_qty: row.min_order_qty.trim()
              ? Number(row.min_order_qty)
              : undefined,
            lead_time_days: row.lead_time_days.trim()
              ? Number(row.lead_time_days)
              : undefined,
            notes: row.notes.trim() || undefined,
          };
          const payload =
            lineType === 'raw_material'
              ? { ...base, raw_material_id: row.item_id }
              : lineType === 'inventory_item'
                ? { ...base, inventory_item_id: row.item_id }
                : { ...base, product_variant_id: row.item_id };

          await suppliersApi.assignItem(payload);
          ok += 1;
        } catch (err: any) {
          failed += 1;
          lastError =
            err?.response?.data?.message || err?.message || 'Assign failed';
        }
      }
      if (ok > 0) {
        await queryClient.invalidateQueries({
          queryKey: ['supplier-assigned-items', supplier.id],
        });
        await queryClient.invalidateQueries({
          queryKey: ['supplier-materials', supplier.id],
        });
      }
      if (ok > 0 && failed === 0) {
        toast.success(ok === 1 ? 'Item assigned' : `${ok} items assigned`);
        resetForm();
      } else if (ok > 0 && failed > 0) {
        toast.warning(`${ok} assigned, ${failed} failed`);
        resetForm();
      } else if (failed > 0) {
        toast.error(lastError || 'Failed to assign items');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async (row: SupplierAssignedItemRow) => {
    const ok = await confirmDialog({
      title: 'Unassign item',
      message: `Remove ${displayName(row)} from ${supplier.name}?`,
      confirmLabel: 'Unassign',
      variant: 'danger',
    });
    if (!ok) return;
    unassignMutation.mutate({ id: row.id, supplierId: supplier.id });
  };

  const busy = submitting || unassignMutation.isPending;
  const noMoreOptions =
    catalogOptions.filter((o) => !assignedIds.has(o.value)).length === 0 ||
    optionsEmpty(catalogOptions, assignedIds, rows);

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
          Assign Catalog
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Map items and default prices for{' '}
          <span className="font-semibold text-slate-700">{supplier.name}</span>.
          Use tabs to switch between raw materials, direct-stock products, and
          inventory items.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {LINE_TYPE_TABS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => changeLineType(opt.value)}
            disabled={busy}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
              lineType === opt.value
                ? 'bg-[var(--brand-primary)] text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <form
          onSubmit={handleAssign}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Link2 className="h-4 w-4" /> Add {lineTypeLabel(lineType)} mappings
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
                      Item {index + 1}
                    </span>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.key)}
                        disabled={busy}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--brand-primary-dark)] hover:bg-[var(--brand-primary-soft)] disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="sm:col-span-2 lg:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        {itemFieldLabel}
                      </label>
                      <Select
                        value={row.item_id}
                        onChange={(v) => updateRow(row.key, { item_id: v })}
                        options={opts}
                        placeholder={`Select ${itemFieldLabel.toLowerCase()}`}
                        disabled={busy || selectableLoading}
                        loading={selectableLoading}
                        searchable
                        searchPlaceholder="Search…"
                        emptyMessage="No items available"
                      />
                      {errors[`${row.key}_material`] && (
                        <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">
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
                        <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">
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
                        <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">
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
                        <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">
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
              disabled={busy || selectableLoading || noMoreOptions}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--brand-primary-soft)] bg-[var(--brand-primary-soft)] px-3.5 py-2.5 text-sm font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add item
            </button>
            <button
              type="submit"
              disabled={busy || selectableLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Assign {rows.length > 1 ? `${rows.length} items` : 'item'}
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-800">
              Assigned {lineTypeLabel(lineType).toLowerCase()}s
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
              No items assigned yet for this type
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-bold">Item</th>
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
                        {displayName(row)}
                      </div>
                      {displayUnit(row) && (
                        <div className="text-xs text-slate-400">
                          {displayUnit(row)}
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
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--brand-primary-dark)] hover:bg-[var(--brand-primary-soft)] disabled:opacity-50"
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

function optionsEmpty(
  catalog: { value: string }[],
  assignedIds: Set<string>,
  rows: DraftRow[]
) {
  const selected = new Set(rows.map((r) => r.item_id).filter(Boolean));
  const available = catalog.filter(
    (o) => !assignedIds.has(o.value) && !selected.has(o.value)
  );
  return available.length === 0;
}
