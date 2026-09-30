'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Info,
  Loader2,
  PackagePlus,
  Search,
} from 'lucide-react';
import {
  useCreatePurchaseMutation,
  useMatchByItemsMutation,
} from '@/hooks/suppliers';
import { useRawMaterialsQuery } from '@/hooks/raw-materials';
import { useInventoryItemsQuery } from '@/hooks/inventory-items';
import { useProductsQuery } from '@/hooks/products';
import { extractListItems } from '@/utils/helpers';
import { RawMaterial } from '@/types/raw-material.types';
import { InventoryItem } from '@/types/inventory-item.types';
import { Product } from '@/types/product.types';
import {
  MatchedSupplierItem,
  PurchaseLineType,
  PurchaseRow,
} from '@/types/supplier.types';

interface LineDraft {
  line_type: PurchaseLineType;
  item_id: string;
  name: string;
  unit: string;
  quantity: string;
  price: string;
}

interface Props {
  onClose: () => void;
  onCreated?: (purchase: PurchaseRow) => void;
  initialMaterialIds?: string[];
  initialLineType?: PurchaseLineType;
}

const LINE_TYPE_OPTIONS: { value: PurchaseLineType; label: string }[] = [
  { value: 'raw_material', label: 'Raw Material' },
  { value: 'product_variant', label: 'Product (Direct Stock)' },
  { value: 'inventory_item', label: 'Inventory Item' },
];

export default function PurchaseForm({
  onClose,
  onCreated,
  initialMaterialIds = [],
  initialLineType = 'raw_material',
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [lineType, setLineType] =
    useState<PurchaseLineType>(initialLineType);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    () => [...initialMaterialIds]
  );
  const [fullMatch, setFullMatch] = useState<MatchedSupplierItem[]>([]);
  const [partialMatch, setPartialMatch] = useState<MatchedSupplierItem[]>([]);
  const [pickedSupplier, setPickedSupplier] =
    useState<MatchedSupplierItem | null>(null);
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [error, setError] = useState('');

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

  const matchMutation = useMatchByItemsMutation();
  const createMutation = useCreatePurchaseMutation();

  const materials = extractListItems<RawMaterial>(materialsRes);
  const inventoryItems = extractListItems<InventoryItem>(inventoryRes);
  const products = extractListItems<Product>(productsRes, 'products').filter(
    (p) => p.inventory_tracking === 'direct_stock'
  );

  const materialById = useMemo(() => {
    const map = new Map<string, RawMaterial>();
    materials.forEach((m) => map.set(m.id, m));
    return map;
  }, [materials]);

  const inventoryById = useMemo(() => {
    const map = new Map<string, InventoryItem>();
    inventoryItems.forEach((m) => map.set(m.id, m));
    return map;
  }, [inventoryItems]);

  const variantOptions = useMemo(() => {
    const rows: {
      id: string;
      name: string;
      unit: string;
      productName: string;
    }[] = [];
    products.forEach((p) => {
      (p.variants || []).forEach((v) => {
        if (!v.id) return;
        rows.push({
          id: v.id,
          name: v.name,
          unit: 'pcs',
          productName: p.name,
        });
      });
    });
    return rows;
  }, [products]);

  const variantById = useMemo(() => {
    const map = new Map<string, (typeof variantOptions)[0]>();
    variantOptions.forEach((v) => map.set(v.id, v));
    return map;
  }, [variantOptions]);

  useEffect(() => {
    if (initialLineType) {
      setLineType(initialLineType);
    }
    if (initialMaterialIds.length > 0) {
      setSelectedIds([...initialMaterialIds]);
      setStep(1);
      setError('');
    }
  }, [initialMaterialIds, initialLineType]);

  const selectableLoading =
    lineType === 'raw_material'
      ? materialsLoading
      : lineType === 'inventory_item'
        ? inventoryLoading
        : productsLoading;

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setError('');
  };

  const changeLineType = (next: PurchaseLineType) => {
    setLineType(next);
    setSelectedIds([]);
    setFullMatch([]);
    setPartialMatch([]);
    setPickedSupplier(null);
    setLines([]);
    setError('');
    setStep(1);
  };

  const buildLinesFromSelection = (
    ids: string[],
    priceLookup?: Map<
      string,
      { unit_price: number; min_order_qty?: number | null }
    >
  ): LineDraft[] => {
    return ids.map((id) => {
      const mapping = priceLookup?.get(id);
      const minQty = mapping?.min_order_qty;
      const qty =
        minQty != null && Number(minQty) > 0 ? String(minQty) : '1';
      const price = String(mapping?.unit_price ?? 0);

      if (lineType === 'raw_material') {
        const mat = materialById.get(id);
        return {
          line_type: 'raw_material' as const,
          item_id: id,
          name: mat?.name || id,
          unit: mat?.unit || '',
          quantity: qty,
          price,
        };
      }
      if (lineType === 'inventory_item') {
        const item = inventoryById.get(id);
        return {
          line_type: 'inventory_item' as const,
          item_id: id,
          name: item?.name || id,
          unit: item?.unit || '',
          quantity: qty,
          price,
        };
      }
      const variant = variantById.get(id);
      return {
        line_type: 'product_variant' as const,
        item_id: id,
        name: variant ? `${variant.productName} — ${variant.name}` : id,
        unit: variant?.unit || 'pcs',
        quantity: qty,
        price,
      };
    });
  };

  const handleFindSuppliers = async () => {
    if (selectedIds.length === 0) {
      setError(
        lineType === 'raw_material'
          ? 'Select at least one raw material'
          : lineType === 'inventory_item'
            ? 'Select at least one inventory item'
            : 'Select at least one product variant'
      );
      return;
    }
    setError('');

    const res = await matchMutation.mutateAsync({
      line_type: lineType,
      item_ids: selectedIds,
    });
    setFullMatch(res.data?.full_match || []);
    setPartialMatch(res.data?.partial_match || []);
    setPickedSupplier(null);
    setLines([]);
    setStep(2);
  };

  const pickMatchedSupplier = (supplier: MatchedSupplierItem) => {
    setPickedSupplier(supplier);
    const overlapIds = supplier.matched_item_ids.filter((id) =>
      selectedIds.includes(id)
    );
    const mappingById = new Map(
      supplier.mappings.map((m) => [m.item_id, m])
    );
    setLines(buildLinesFromSelection(overlapIds, mappingById));
    setStep(3);
    setError('');
  };

  const updateLine = (index: number, patch: Partial<LineDraft>) => {
    setLines((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const lineTotal = lines.reduce((sum, line) => {
    const q = Number(line.quantity);
    const p = Number(line.price);
    if (Number.isNaN(q) || Number.isNaN(p)) return sum;
    return sum + q * p;
  }, 0);

  const handleSubmit = async () => {
    if (!pickedSupplier?.id) return;
    if (lines.length === 0) {
      setError('Add at least one line item');
      return;
    }
    for (const line of lines) {
      const q = Number(line.quantity);
      const p = Number(line.price);
      if (!line.quantity.trim() || Number.isNaN(q) || q <= 0) {
        setError(`Enter a valid quantity for ${line.name}`);
        return;
      }
      if (!line.price.trim() || Number.isNaN(p) || p < 0) {
        setError(`Enter a valid price for ${line.name}`);
        return;
      }
    }
    setError('');

    const res = await createMutation.mutateAsync({
      supplier_id: pickedSupplier.id,
      items: lines.map((line) => {
        const base = {
          line_type: line.line_type,
          quantity: Number(line.quantity),
          price: Number(line.price),
        };
        if (line.line_type === 'raw_material') {
          return { ...base, raw_material_id: line.item_id };
        }
        if (line.line_type === 'inventory_item') {
          return { ...base, inventory_item_id: line.item_id };
        }
        return { ...base, product_variant_id: line.item_id };
      }),
    });

    if (res?.status) {
      const purchase = (res.data || null) as PurchaseRow | null;
      if (onCreated && purchase?.id) onCreated(purchase);
      else onClose();
    }
  };

  const stepLabel =
    step === 1
      ? 'Select items'
      : step === 2
        ? 'Choose supplier'
        : 'Review & create draft PO';

  const itemNoun =
    lineType === 'raw_material'
      ? 'materials'
      : lineType === 'inventory_item'
        ? 'items'
        : 'variants';

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
          Create Purchase Order
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Step {step} of 3 — {stepLabel}
        </p>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-[var(--brand-primary-soft)] bg-[var(--brand-primary-soft)] px-4 py-3 text-sm text-[var(--brand-primary-dark)]">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          This creates a <strong>draft PO</strong>. Stock quantities are updated
          only after you <strong>Receive</strong> the goods — not when the PO
          is created or marked ordered.
        </p>
      </div>

      {step === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <ClipboardList className="h-4 w-4" /> Line type &amp; items
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {LINE_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => changeLineType(opt.value)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  lineType === opt.value
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {selectableLoading ? (
            <div className="flex justify-center py-12 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : lineType === 'raw_material' ? (
            materials.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                No raw materials found. Add materials first.
              </p>
            ) : (
              <SelectableList
                items={materials.map((m) => ({
                  id: m.id,
                  title: m.name,
                  subtitle: `${m.unit} · stock ${m.stock_quantity ?? 0}`,
                }))}
                selectedIds={selectedIds}
                onToggle={toggleItem}
              />
            )
          ) : lineType === 'inventory_item' ? (
            inventoryItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                No inventory items found. Add items first.
              </p>
            ) : (
              <SelectableList
                items={inventoryItems.map((m) => ({
                  id: m.id,
                  title: m.name,
                  subtitle: `${m.unit} · stock ${m.stock_quantity ?? 0}`,
                }))}
                selectedIds={selectedIds}
                onToggle={toggleItem}
              />
            )
          ) : variantOptions.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No direct-stock product variants found.
            </p>
          ) : (
            <SelectableList
              items={variantOptions.map((v) => ({
                id: v.id,
                title: `${v.productName} — ${v.name}`,
                subtitle: v.unit,
              }))}
              selectedIds={selectedIds}
              onToggle={toggleItem}
            />
          )}

          {error && <p className="mt-3 text-xs text-[var(--brand-primary-dark)]">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFindSuppliers}
              disabled={matchMutation.isPending || selectableLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
            >
              {matchMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Find suppliers
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <SupplierMatchSection
            title="Can supply all"
            empty={`No supplier can supply every selected ${itemNoun.slice(0, -1)}.`}
            suppliers={fullMatch}
            selectedCount={selectedIds.length}
            itemNoun={itemNoun}
            onPick={pickMatchedSupplier}
            accent="emerald"
          />
          <SupplierMatchSection
            title="Can supply some"
            empty="No partial matches."
            suppliers={partialMatch}
            selectedCount={selectedIds.length}
            itemNoun={itemNoun}
            onPick={pickMatchedSupplier}
            accent="amber"
          />
          {error && <p className="text-xs text-[var(--brand-primary-dark)]">{error}</p>}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </div>
        </div>
      )}

      {step === 3 && pickedSupplier && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <PackagePlus className="h-4 w-4" /> Draft lines for{' '}
            {pickedSupplier.name}
          </div>

          {lines.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No line items to create.
            </p>
          ) : (
            <div className="space-y-3">
              {lines.map((line, index) => (
                <div
                  key={`${line.line_type}-${line.item_id}`}
                  className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-12"
                >
                  <div className="sm:col-span-5">
                    <div className="text-xs font-medium text-slate-500">
                      {line.line_type === 'raw_material'
                        ? 'Material'
                        : line.line_type === 'inventory_item'
                          ? 'Inventory item'
                          : 'Product variant'}
                    </div>
                    <div className="mt-1 font-semibold text-slate-800">
                      {line.name}
                      {line.unit ? (
                        <span className="ml-1 text-xs font-normal text-slate-400">
                          ({line.unit})
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(index, { quantity: e.target.value })
                      }
                      disabled={createMutation.isPending}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Unit price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={line.price}
                      onChange={(e) =>
                        updateLine(index, { price: e.target.value })
                      }
                      disabled={createMutation.isPending}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-end text-sm">
            <span className="font-semibold text-slate-800">
              Estimated total:{' '}
              <span className="text-[var(--brand-primary)]">
                {lineTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </span>
          </div>

          {error && <p className="mt-3 text-xs text-[var(--brand-primary-dark)]">{error}</p>}

          <div className="mt-6 flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending || lines.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Create draft PO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectableList({
  items,
  selectedIds,
  onToggle,
}: {
  items: { id: string; title: string; subtitle: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const ordered = useMemo(() => {
    if (selectedIds.length === 0) return items;
    const selected = new Set(selectedIds);
    return [
      ...items.filter((m) => selected.has(m.id)),
      ...items.filter((m) => !selected.has(m.id)),
    ];
  }, [items, selectedIds]);

  return (
    <div className="max-h-96 space-y-2 overflow-y-auto">
      {ordered.map((m) => {
        const checked = selectedIds.includes(m.id);
        return (
          <label
            key={m.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
              checked
                ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-soft)]'
                : 'border-slate-100 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(m.id)}
              className="h-4 w-4 rounded border-slate-300 accent-[var(--brand-primary)]"
            />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-800">{m.title}</div>
              <div className="text-xs text-slate-500">{m.subtitle}</div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

function SupplierMatchSection({
  title,
  empty,
  suppliers,
  selectedCount,
  itemNoun,
  onPick,
  accent,
}: {
  title: string;
  empty: string;
  suppliers: MatchedSupplierItem[];
  selectedCount: number;
  itemNoun: string;
  onPick: (s: MatchedSupplierItem) => void;
  accent: 'emerald' | 'amber';
}) {
  const badge =
    accent === 'emerald'
      ? 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]'
      : 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]';
  const border = 'border-[var(--brand-primary-soft)]';

  return (
    <div className={`overflow-hidden rounded-2xl border ${border} bg-white shadow-sm`}>
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {suppliers.length} supplier{suppliers.length === 1 ? '' : 's'}
        </p>
      </div>
      {suppliers.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">{empty}</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {suppliers.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-semibold text-slate-800">{s.name}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {[s.phone, s.email].filter(Boolean).join(' · ') ||
                    'No contact info'}
                </div>
                <span
                  className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge}`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {s.matched_item_ids.length}/{selectedCount} {itemNoun}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onPick(s)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
              >
                Select
                <ArrowRight className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
