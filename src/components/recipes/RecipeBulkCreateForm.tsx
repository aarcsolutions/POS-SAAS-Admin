'use client';

import { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Select } from '@/components/ui/Select';
import { useRawMaterialsQuery } from '@/hooks/raw-materials';
import { RecipeProductCard, RecipePayload } from '@/types/recipe.types';
import { getCompatibleUnits, normalizeUnit } from '@/utils/unit-conversion';
import {
  downloadRecipeExcelTemplate,
  parseRecipeExcelFile,
} from '@/utils/recipe-excel';
import { extractListItems } from '@/utils/helpers';
import { RawMaterial } from '@/types/raw-material.types';

type VariantOption = {
  key: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  label: string;
};

type Row = {
  key: string;
  variantKey: string;
  raw_material_id: string;
  quantity: string;
  unit: string;
};

interface Props {
  productsWithoutRecipes: RecipeProductCard[];
  loadingProducts?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payloads: RecipePayload[]) => Promise<void> | void;
}

const emptyRow = (): Row => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  variantKey: '',
  raw_material_id: '',
  quantity: '',
  unit: '',
});

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]';

export default function RecipeBulkCreateForm({
  productsWithoutRecipes,
  loadingProducts = false,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);

  const { data: rmData, isLoading: rmLoading } = useRawMaterialsQuery({
    page: 1,
    limit: 100,
  });
  const rawMaterials = extractListItems<RawMaterial>(rmData);

  const variantOptions: VariantOption[] = useMemo(() => {
    const opts: VariantOption[] = [];
    for (const product of productsWithoutRecipes) {
      for (const variant of product.variants_without_recipe || []) {
        opts.push({
          key: `${product.id}::${variant.id}`,
          productId: product.id,
          productName: product.name,
          variantId: variant.id,
          variantName: variant.name,
          label: product.has_variant
            ? `${product.name} — ${variant.name}`
            : product.name,
        });
      }
    }
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [productsWithoutRecipes]);

  const variantByKey = useMemo(() => {
    const map = new Map<string, VariantOption>();
    variantOptions.forEach((v) => map.set(v.key, v));
    return map;
  }, [variantOptions]);

  const rmById = useMemo(() => {
    const map = new Map<string, RawMaterial>();
    rawMaterials.forEach((rm) => map.set(rm.id, rm));
    return map;
  }, [rawMaterials]);

  const updateRow = (key: string, patch: Partial<Row>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.key !== key) return r;
        const next = { ...r, ...patch };
        if (patch.raw_material_id) {
          const rm = rmById.get(patch.raw_material_id);
          if (rm) {
            next.unit = normalizeUnit(rm.unit);
          }
        }
        return next;
      })
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (key: string) => {
    setRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)
    );
    setRowErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const resolveVariantKey = (
    productName: string,
    variantName: string
  ): string | null => {
    const p = productName.trim().toLowerCase();
    const v = variantName.trim().toLowerCase();
    const exact = variantOptions.find(
      (o) =>
        o.productName.toLowerCase() === p && o.variantName.toLowerCase() === v
    );
    if (exact) return exact.key;
    // Single-variant products often use "Default" / product name as variant
    const byProduct = variantOptions.filter(
      (o) => o.productName.toLowerCase() === p
    );
    if (byProduct.length === 1) return byProduct[0].key;
    const fuzzy = byProduct.find((o) => o.variantName.toLowerCase() === v);
    return fuzzy?.key || null;
  };

  const resolveRawMaterialId = (name: string): string | null => {
    const n = name.trim().toLowerCase();
    const hit = rawMaterials.find((rm) => rm.name.toLowerCase() === n);
    return hit?.id || null;
  };

  const handleExcelUpload = async (file: File | null) => {
    if (!file) return;
    if (!variantOptions.length) {
      toast.error('No recipe-based products without recipes are available');
      return;
    }
    if (!rawMaterials.length) {
      toast.error('Add raw materials first, then import recipes');
      return;
    }

    setImporting(true);
    try {
      const parsed = await parseRecipeExcelFile(file);
      const nextRows: Row[] = [];
      const unmatched: string[] = [];

      parsed.forEach((item, index) => {
        const variantKey = resolveVariantKey(
          item.product_name,
          item.variant_name
        );
        const raw_material_id = resolveRawMaterialId(item.raw_material_name);
        if (!variantKey) {
          unmatched.push(
            `Row ${index + 1}: product/variant not found (${item.product_name} / ${item.variant_name})`
          );
          return;
        }
        if (!raw_material_id) {
          unmatched.push(
            `Row ${index + 1}: raw material not found (${item.raw_material_name})`
          );
          return;
        }
        const rm = rmById.get(raw_material_id);
        const compatible = getCompatibleUnits(rm?.unit || item.unit);
        const unit = normalizeUnit(item.unit);
        if (!compatible.map(normalizeUnit).includes(unit)) {
          unmatched.push(
            `Row ${index + 1}: unit "${item.unit}" incompatible with ${rm?.name || 'material'} (${rm?.unit})`
          );
          return;
        }
        nextRows.push({
          key: `excel-${Date.now()}-${index}`,
          variantKey,
          raw_material_id,
          quantity: String(item.quantity),
          unit,
        });
      });

      if (!nextRows.length) {
        throw new Error(
          unmatched[0] || 'No valid rows could be matched from Excel'
        );
      }

      setRows(nextRows);
      setRowErrors({});
      if (unmatched.length) {
        toast.warning(
          `Loaded ${nextRows.length} row(s). ${unmatched.length} skipped — check names/units.`
        );
      } else {
        toast.success(
          `${nextRows.length} row${nextRows.length === 1 ? '' : 's'} loaded from Excel`
        );
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to read Excel file');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const validateAndBuild = (): RecipePayload[] | null => {
    const errors: Record<string, string> = {};
    let ok = true;

    rows.forEach((row) => {
      if (!row.variantKey) {
        errors[row.key] = 'Select product/variant';
        ok = false;
        return;
      }
      if (!row.raw_material_id) {
        errors[row.key] = 'Select raw material';
        ok = false;
        return;
      }
      const qty = Number(row.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        errors[row.key] = 'Quantity must be > 0';
        ok = false;
        return;
      }
      if (!row.unit.trim()) {
        errors[row.key] = 'Unit required';
        ok = false;
      }
    });

    if (!ok) {
      setRowErrors(errors);
      return null;
    }

    const grouped = new Map<
      string,
      { variant_id: string; ingredients: RecipePayload['ingredients'] }
    >();

    for (const row of rows) {
      const variant = variantByKey.get(row.variantKey);
      if (!variant) continue;
      const existing = grouped.get(variant.variantId) || {
        variant_id: variant.variantId,
        ingredients: [],
      };
      if (
        existing.ingredients.some(
          (ing) => ing.raw_material_id === row.raw_material_id
        )
      ) {
        errors[row.key] = 'Duplicate material for this variant';
        ok = false;
        continue;
      }
      existing.ingredients.push({
        raw_material_id: row.raw_material_id,
        quantity: Number(row.quantity),
        unit: normalizeUnit(row.unit),
      });
      grouped.set(variant.variantId, existing);
    }

    if (!ok) {
      setRowErrors(errors);
      return null;
    }

    setRowErrors({});
    return [...grouped.values()];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payloads = validateAndBuild();
    if (!payloads?.length) return;
    await onSubmit(payloads);
  };

  const busy = saving || importing || loadingProducts || rmLoading;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)] transition hover:text-[var(--brand-icon)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Add Recipe
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Add Multiple Recipes
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              One ingredient per row. Same product/variant rows become one
              recipe.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => downloadRecipeExcelTemplate()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> Template
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload Excel
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              className="hidden"
              onChange={(e) => handleExcelUpload(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <FileSpreadsheet className="h-4 w-4 shrink-0 text-[var(--brand-icon)]" />
            <span>
              Columns: <strong>product_name</strong>,{' '}
              <strong>variant_name</strong>, <strong>raw_material_name</strong>,{' '}
              <strong>quantity</strong>, <strong>unit</strong>. Upload fills
              rows — review then create.
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <div className="min-w-[920px]">
              <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)_110px_100px_88px] gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Product / Variant *</span>
                <span>Raw Material *</span>
                <span>Qty *</span>
                <span>Unit *</span>
                <span className="text-center">Actions</span>
              </div>

              <div className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const rm = row.raw_material_id
                    ? rmById.get(row.raw_material_id)
                    : null;
                  const units = getCompatibleUnits(rm?.unit || row.unit || 'pcs');
                  const err = rowErrors[row.key];
                  return (
                    <div
                      key={row.key}
                      className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)_110px_100px_88px] items-start gap-2 px-3 py-3"
                    >
                      <div>
                        <Select
                          value={row.variantKey}
                          onChange={(v) =>
                            updateRow(row.key, { variantKey: v })
                          }
                          variant="form"
                          size="lg"
                          searchable
                          placeholder="Select product / variant"
                          options={variantOptions.map((o) => ({
                            value: o.key,
                            label: o.label,
                          }))}
                        />
                        {err && (
                          <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">
                            {err}
                          </p>
                        )}
                      </div>
                      <div>
                        <Select
                          value={row.raw_material_id}
                          onChange={(v) =>
                            updateRow(row.key, { raw_material_id: v })
                          }
                          variant="form"
                          size="lg"
                          searchable
                          placeholder="Select material"
                          options={rawMaterials.map((m) => ({
                            value: m.id,
                            label: `${m.name} (${m.unit})`,
                          }))}
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min={0.0001}
                          step="any"
                          value={row.quantity}
                          onChange={(e) =>
                            updateRow(row.key, { quantity: e.target.value })
                          }
                          placeholder="0"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <Select
                          value={row.unit}
                          onChange={(v) => updateRow(row.key, { unit: v })}
                          variant="form"
                          size="lg"
                          allowEmpty={false}
                          options={units.map((u) => ({
                            value: normalizeUnit(u),
                            label: normalizeUnit(u),
                          }))}
                        />
                      </div>
                      <div className="flex h-11 items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={addRow}
                          title="Add row"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--brand-primary)] bg-[var(--brand-icon-soft)] text-[var(--brand-icon)] transition hover:brightness-95"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRow(row.key)}
                          disabled={rows.length <= 1}
                          title="Remove row"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !variantOptions.length}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Recipes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
