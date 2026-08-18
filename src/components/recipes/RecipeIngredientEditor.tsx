'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, Trash2, Check } from 'lucide-react';
import { useRawMaterialsQuery } from '@/hooks/raw-materials';
import {
  RecipeIngredientPayload,
  RecipeIngredient,
} from '@/types/recipe.types';
import { getCompatibleUnits, normalizeUnit } from '@/utils/unit-conversion';
import { Select } from '@/components/ui/Select';

type Line = {
  raw_material_id: string;
  name: string;
  rm_unit: string;
  quantity: string;
  unit: string;
  compatible_units: string[];
};

interface Props {
  mode: 'create' | 'edit';
  variantId: string;
  variantName: string;
  productName: string;
  initialIngredients?: RecipeIngredient[];
  saving?: boolean;
  onClose: () => void;
  onSubmit: (ingredients: RecipeIngredientPayload[]) => Promise<void> | void;
}

export default function RecipeIngredientEditor({
  mode,
  variantId,
  variantName,
  productName,
  initialIngredients = [],
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const { data: rmData, isLoading: rmLoading } = useRawMaterialsQuery({
    page: 1,
    limit: 100,
  });
  const rawMaterials = rmData?.data?.data ?? [];

  const [lines, setLines] = useState<Line[]>([]);
  const [materialsError, setMaterialsError] = useState('');
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialIngredients.length) {
      setLines([]);
      return;
    }
    setLines(
      initialIngredients.map((ing) => {
        const rmUnit = ing.raw_material?.unit || ing.input_unit || 'pcs';
        const compatible =
          ing.raw_material?.compatible_units || getCompatibleUnits(rmUnit);
        return {
          raw_material_id: ing.raw_material_id,
          name: ing.raw_material?.name || 'Raw material',
          rm_unit: rmUnit,
          quantity: String(ing.input_quantity ?? ing.quantity_required ?? ''),
          unit: normalizeUnit(ing.input_unit || rmUnit),
          compatible_units: compatible,
        };
      })
    );
  }, [initialIngredients]);

  const selectedIds = useMemo(
    () => new Set(lines.map((l) => l.raw_material_id)),
    [lines]
  );

  const toggleMaterial = (rm: {
    id: string;
    name: string;
    unit: string;
  }) => {
    if (materialsError) setMaterialsError('');
    if (selectedIds.has(rm.id)) {
      setLines((prev) => prev.filter((l) => l.raw_material_id !== rm.id));
      return;
    }
    const compatible = getCompatibleUnits(rm.unit);
    setLines((prev) => [
      ...prev,
      {
        raw_material_id: rm.id,
        name: rm.name,
        rm_unit: rm.unit,
        quantity: '',
        unit: compatible[0] || normalizeUnit(rm.unit),
        compatible_units: compatible,
      },
    ]);
  };

  const updateLine = (id: string, patch: Partial<Line>) => {
    if (lineErrors[id]) {
      setLineErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    setLines((prev) =>
      prev.map((l) => (l.raw_material_id === id ? { ...l, ...patch } : l))
    );
  };

  const handleSubmit = async () => {
    setMaterialsError('');
    setLineErrors({});

    if (lines.length === 0) {
      setMaterialsError('Select at least one raw material');
      return;
    }

    const nextLineErrors: Record<string, string> = {};
    for (const line of lines) {
      const qty = Number(line.quantity);
      if (!line.quantity || Number.isNaN(qty) || qty <= 0) {
        nextLineErrors[line.raw_material_id] = 'Quantity is required';
      }
    }
    if (Object.keys(nextLineErrors).length > 0) {
      setLineErrors(nextLineErrors);
      return;
    }

    await onSubmit(
      lines.map((l) => ({
        raw_material_id: l.raw_material_id,
        quantity: Number(l.quantity),
        unit: l.unit,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === 'create' ? 'Add Recipe' : 'Edit Recipe'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {productName}
          {variantName ? ` · ${variantName}` : ''}
        </p>
      </div>

      <div
        className={`rounded-2xl border bg-white p-6 shadow-sm ${
          materialsError ? 'border-rose-300' : 'border-slate-200'
        }`}
      >
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          Select Raw Materials
        </h2>
        {rmLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rawMaterials.map((rm) => {
              const active = selectedIds.has(rm.id);
              return (
                <button
                  key={rm.id}
                  type="button"
                  onClick={() =>
                    toggleMaterial({
                      id: rm.id,
                      name: rm.name,
                      unit: rm.unit,
                    })
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    active
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{rm.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Stock: {Number(rm.stock_quantity).toLocaleString()}{' '}
                        {rm.unit}
                      </p>
                    </div>
                    {active && (
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {materialsError && (
          <p className="mt-3 text-xs text-rose-600">{materialsError}</p>
        )}
      </div>

      {lines.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            Quantities
          </h2>
          <div className="space-y-4">
            {lines.map((line) => (
              <div
                key={line.raw_material_id}
                className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[1fr_140px_140px_40px] md:items-end"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {line.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Stored as {line.rm_unit}
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(line.raw_material_id, {
                        quantity: e.target.value,
                      })
                    }
                    className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${
                      lineErrors[line.raw_material_id]
                        ? 'border-rose-400'
                        : 'border-slate-200'
                    }`}
                  />
                  {lineErrors[line.raw_material_id] && (
                    <p className="mt-1 text-xs text-rose-600">
                      {lineErrors[line.raw_material_id]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Unit
                  </label>
                  <Select
                    value={line.unit}
                    onChange={(value) =>
                      updateLine(line.raw_material_id, { unit: value })
                    }
                    variant="form"
                    size="lg"
                    allowEmpty={false}
                    options={line.compatible_units.map((u) => ({
                      value: u,
                      label: u,
                    }))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLines((prev) =>
                      prev.filter(
                        (l) => l.raw_material_id !== line.raw_material_id
                      )
                    )
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Save Recipe' : 'Update Recipe'}
        </button>
      </div>
    </div>
  );
}
