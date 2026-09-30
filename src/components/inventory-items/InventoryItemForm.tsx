'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  InventoryItem,
  InventoryItemPayload,
} from '@/types/inventory-item.types';
import { Select } from '@/components/ui/Select';

interface Props {
  mode: 'create' | 'edit' | 'view';
  initial?: InventoryItem | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: InventoryItemPayload) => Promise<void> | void;
}

const UNITS = ['kg', 'g', 'liter', 'ml', 'pcs', 'box', 'packet'];

export default function InventoryItemForm({
  mode,
  initial,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const isReadOnly = mode === 'view';
  const [name, setName] = useState('');
  const [unit, setUnit] = useState(UNITS[0]);
  const [stock, setStock] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setUnit(initial.unit || UNITS[0]);
      setStock(Number(initial.stock_quantity ?? 0));
      setMinStock(Number(initial.min_stock_level ?? 0));
    } else {
      setName('');
      setUnit(UNITS[0]);
      setStock('');
      setMinStock('');
    }
  }, [initial]);

  const title =
    mode === 'create'
      ? 'Add Inventory Item'
      : mode === 'edit'
        ? 'Edit Inventory Item'
        : 'Inventory Item Details';

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Item name is required';
    if (!unit.trim()) next.unit = 'Unit is required';
    if (stock !== '' && Number(stock) < 0) {
      next.stock_quantity = 'Stock cannot be negative';
    }
    if (minStock !== '' && Number(minStock) < 0) {
      next.min_stock_level = 'Minimum quantity cannot be negative';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!validate()) return;
    await onSubmit({
      name: name.trim(),
      unit: unit.trim(),
      stock_quantity: Number(stock === '' ? 0 : stock),
      min_stock_level: Number(minStock === '' ? 0 : minStock),
    });
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)] transition hover:text-[var(--brand-icon)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Inventory Items
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">{title}</h1>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Item Name {!isReadOnly && <span className="text-[var(--brand-primary)]">*</span>}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={isReadOnly}
              placeholder="e.g. Tissue"
              className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] ${
                isReadOnly ? 'opacity-70' : ''
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Unit {!isReadOnly && <span className="text-[var(--brand-primary)]">*</span>}
            </label>
            <Select
              value={unit}
              onChange={setUnit}
              disabled={isReadOnly}
              variant="form"
              size="lg"
              allowEmpty={false}
              triggerClassName={isReadOnly ? 'opacity-70' : ''}
              options={[
                ...(!UNITS.includes(unit) && unit
                  ? [{ value: unit, label: unit }]
                  : []),
                ...UNITS.map((u) => ({ value: u, label: u })),
              ]}
            />
            {errors.unit && (
              <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">{errors.unit}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {mode === 'create' ? 'Opening Stock' : 'Stock Quantity'}
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={stock}
              onChange={(e) =>
                setStock(e.target.value === '' ? '' : Number(e.target.value))
              }
              readOnly={isReadOnly}
              placeholder="0"
              className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] ${
                isReadOnly ? 'opacity-70' : ''
              }`}
            />
            {errors.stock_quantity && (
              <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">{errors.stock_quantity}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Minimum Quantity
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={minStock}
              onChange={(e) =>
                setMinStock(e.target.value === '' ? '' : Number(e.target.value))
              }
              readOnly={isReadOnly}
              placeholder="0"
              className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] ${
                isReadOnly ? 'opacity-70' : ''
              }`}
            />
            <p className="mt-1 text-xs text-slate-500">
              Low-stock alert when current stock reaches this level
            </p>
            {errors.min_stock_level && (
              <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">{errors.min_stock_level}</p>
            )}
          </div>

          {!isReadOnly && (
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
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Create Item' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
