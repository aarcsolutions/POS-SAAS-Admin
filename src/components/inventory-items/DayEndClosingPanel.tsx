'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  ClipboardCheck,
  Warehouse,
} from 'lucide-react';
import { InventoryItem } from '@/types/inventory-item.types';

interface Props {
  items: InventoryItem[];
  loading?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (
    rows: Array<{ id: string; stock_quantity: number }>
  ) => Promise<void> | void;
}

export default function DayEndClosingPanel({
  items,
  loading = false,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const [qtyById, setQtyById] = useState<Record<string, number>>({});

  useEffect(() => {
    const next: Record<string, number> = {};
    items.forEach((item) => {
      next[item.id] = Number(item.stock_quantity || 0);
    });
    setQtyById(next);
  }, [items]);

  const changedCount = useMemo(() => {
    return items.filter((item) => {
      const current = Number(item.stock_quantity || 0);
      const next = Number(qtyById[item.id] ?? current);
      return next !== current;
    }).length;
  }, [items, qtyById]);

  const setQty = (id: string, value: number) => {
    const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
    setQtyById((prev) => ({ ...prev, [id]: safe }));
  };

  const bump = (id: string, delta: number) => {
    setQtyById((prev) => {
      const current = Number(prev[id] ?? 0);
      return { ...prev, [id]: Math.max(0, current + delta) };
    });
  };

  const handleUpdate = async () => {
    const payload = items
      .map((item) => ({
        id: item.id,
        stock_quantity: Number(qtyById[item.id] ?? item.stock_quantity ?? 0),
        previous: Number(item.stock_quantity || 0),
      }))
      .filter((row) => row.stock_quantity !== row.previous)
      .map(({ id, stock_quantity }) => ({ id, stock_quantity }));

    if (payload.length === 0) return;
    await onSubmit(payload);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-300">
      <div>
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Inventory Items
        </button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Day End Closing
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Adjust closing stock for every inventory item, then tap Update to
              save.
            </p>
          </div>
          <div className="text-sm text-slate-500">
            {changedCount > 0 ? (
              <span className="font-semibold text-[var(--brand-primary)]">
                {changedCount} change{changedCount === 1 ? '' : 's'} pending
              </span>
            ) : (
              'No changes yet'
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Item Name</th>
              <th className="px-5 py-4">Unit</th>
              <th className="px-5 py-4">Opening / Current</th>
              <th className="px-5 py-4 text-right">Closing Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  <Warehouse className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No inventory items found.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const current = Number(item.stock_quantity || 0);
                const next = Number(qtyById[item.id] ?? current);
                const changed = next !== current;
                return (
                  <tr
                    key={item.id}
                    className={`transition ${
                      changed
                        ? 'bg-[var(--brand-primary-soft)]/40'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {item.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.unit}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {current.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => bump(item.id, -1)}
                          disabled={saving || next <= 0}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--brand-primary-soft)] bg-white text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary-soft)] disabled:opacity-40"
                          aria-label={`Decrease ${item.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          step="1"
                          value={next}
                          disabled={saving}
                          onChange={(e) =>
                            setQty(item.id, Number(e.target.value))
                          }
                          className="h-9 w-20 rounded-xl border border-slate-200 bg-white px-2 text-center text-sm font-semibold text-slate-800 outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:opacity-60"
                        />
                        <button
                          type="button"
                          onClick={() => bump(item.id, 1)}
                          disabled={saving}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--brand-primary-soft)] bg-white text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary-soft)] disabled:opacity-40"
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUpdate}
          disabled={saving || loading || items.length === 0 || changedCount === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ClipboardCheck className="h-4 w-4" />
          )}
          {saving ? 'Updating…' : 'Update stock'}
        </button>
      </div>
    </div>
  );
}
