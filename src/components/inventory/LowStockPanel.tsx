'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  Package,
  TrendingDown,
  ClipboardList,
} from 'lucide-react';
import {
  InventoryBalance,
  InventoryBalanceItemType,
} from '@/types/inventory.types';
import { createPoHref, itemTypeLabel } from '@/utils/inventory-po-links';

interface LowStockPanelProps {
  items: InventoryBalance[];
}

const TYPE_LABELS: Record<InventoryBalanceItemType, string> = {
  raw_material: 'Raw Material',
  product_variant: 'Product (Direct Stock)',
  inventory_item: 'Inventory Item',
};

export default function LowStockPanel({ items }: LowStockPanelProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'low':
        return 'border-[var(--brand-primary-soft)] bg-[var(--brand-primary-soft)]/60';
      case 'critical':
        return 'border-[color-mix(in_srgb,var(--brand-primary)_28%,white)] bg-[color-mix(in_srgb,var(--brand-primary)_14%,white)]';
      case 'out':
        return 'border-slate-200 bg-slate-50';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'low':
        return 'Low Stock';
      case 'critical':
        return 'Critical';
      case 'out':
        return 'Out of Stock';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low':
        return (
          <TrendingDown className="h-5 w-5 text-[var(--brand-primary)]" />
        );
      case 'critical':
        return (
          <AlertTriangle className="h-5 w-5 text-[var(--brand-primary-dark)]" />
        );
      case 'out':
        return <Package className="h-5 w-5 text-slate-400" />;
      default:
        return <Package className="h-5 w-5 text-slate-400" />;
    }
  };

  const outOfStock = items.filter((item) => item.status === 'out');
  const critical = items.filter((item) => item.status === 'critical');
  const low = items.filter((item) => item.status === 'low');

  const types = [...new Set(items.map((i) => i.item_type))];
  const bulkHref =
    types.length === 1
      ? createPoHref({
          lineType: types[0],
          ids: items.map((i) => i.id),
        })
      : '/suppliers?createPo=1';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--brand-primary-soft)] bg-[var(--brand-primary-soft)] px-5 py-4 text-sm text-[var(--brand-primary-dark)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-primary)]" />
            <div>
              <p className="font-semibold text-[var(--brand-primary-dark)]">
                Restock via purchase orders
              </p>
              <p className="mt-0.5 text-[var(--brand-primary-dark)]/80">
                Create a PO for the matching line type. Stock updates after you
                receive the PO.
              </p>
            </div>
          </div>
          <Link
            href={bulkHref}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white hover:brightness-95"
          >
            Create purchase order
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Out of stock
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-800">
            {outOfStock.length}
          </div>
        </div>
        <div className="rounded-2xl border border-[color-mix(in_srgb,var(--brand-primary)_20%,white)] bg-[color-mix(in_srgb,var(--brand-primary)_10%,white)] p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary-dark)]/60">
            Critical
          </div>
          <div className="mt-1 text-2xl font-bold text-[var(--brand-primary-dark)]">
            {critical.length}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--brand-primary-soft)] bg-[var(--brand-primary-soft)]/50 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)]">
            Low
          </div>
          <div className="mt-1 text-2xl font-bold text-[var(--brand-primary)]">
            {low.length}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No low-stock items right now.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={`${item.item_type}-${item.id}`}
              className={`rounded-2xl border p-4 ${getStatusStyle(item.status)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-800">
                    {item.name}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {TYPE_LABELS[item.item_type] ||
                      itemTypeLabel(item.item_type)}{' '}
                    · {item.unit || 'units'}
                  </div>
                </div>
                {getStatusIcon(item.status)}
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    On hand
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    {item.stock_quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Min
                  </div>
                  <div className="text-sm font-semibold text-slate-600">
                    {item.min_stock_level}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-600">
                  {getStatusLabel(item.status)}
                </span>
                <Link
                  href={createPoHref({
                    lineType: item.item_type,
                    ids: [item.id],
                  })}
                  className="text-xs font-bold text-[var(--brand-primary)] hover:underline"
                >
                  Create PO →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
