'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  Package,
  ArrowDownLeft,
  Truck,
  TrendingDown,
  ClipboardList,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  supplier: string;
  lastUpdated: string;
  status: 'optimal' | 'low' | 'critical' | 'out';
}

interface LowStockPanelProps {
  items: InventoryItem[];
  onStockIn: (item: InventoryItem) => void;
}

export default function LowStockPanel({ items, onStockIn }: LowStockPanelProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'low':
        return 'border-amber-200 bg-amber-50/60';
      case 'critical':
        return 'border-rose-200 bg-rose-50/60';
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
        return <TrendingDown className="h-5 w-5 text-amber-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-rose-600" />;
      case 'out':
        return <Package className="h-5 w-5 text-slate-400" />;
      default:
        return <Package className="h-5 w-5 text-slate-400" />;
    }
  };

  const outOfStock = items.filter((item) => item.status === 'out');
  const critical = items.filter((item) => item.status === 'critical');
  const low = items.filter((item) => item.status === 'low');
  const materialIds = items.map((i) => i.id).filter(Boolean).join(',');

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-sm text-amber-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="font-semibold text-amber-900">
                Stock is managed via Raw Materials &amp; Suppliers
              </p>
              <p className="mt-0.5 text-amber-800/80">
                Create a purchase order to restock. Inventory updates only after
                you receive the PO — not when it is drafted or ordered.
              </p>
            </div>
          </div>
          <Link
            href={
              materialIds
                ? `/suppliers?createPo=1&materials=${materialIds}`
                : '/suppliers?createPo=1'
            }
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
          >
            Create PO
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-rose-700">
            Critical / Out of Stock
          </div>
          <div className="mt-1 text-2xl font-bold text-rose-800">
            {outOfStock.length + critical.length}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-amber-700">
            Low Stock Items
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-800">
            {low.length}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <Package className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">
            Total Items Below Threshold
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {items.length}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-icon-soft)] text-[var(--brand-primary)]">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            All stock levels look healthy
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            No items are below their minimum threshold. When stock runs low,
            open Suppliers to create a purchase order, then receive goods to
            update Raw Materials inventory.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/raw-materials"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View Raw Materials
            </Link>
            <Link
              href="/suppliers?createPo=1"
              className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
            >
              Create Purchase Order
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${getStatusStyle(item.status)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/90">
                    {getStatusIcon(item.status)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {item.productName}
                      </h3>
                      <span className="rounded-full border border-white/80 bg-white/80 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.sku} · {item.category}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-700">
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        On hand:{' '}
                        <strong>
                          {item.currentStock} {item.unit}
                        </strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingDown className="h-3.5 w-3.5" />
                        Threshold:{' '}
                        <strong>
                          {item.minStock} {item.unit}
                        </strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        Supplier: <strong>{item.supplier || '—'}</strong>
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-white/70">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.status === 'out'
                            ? 'w-0 bg-slate-400'
                            : item.status === 'critical'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                        }`}
                        style={{
                          width:
                            item.status === 'out'
                              ? '0%'
                              : `${Math.min(
                                  100,
                                  (item.currentStock / Math.max(item.minStock, 1)) *
                                    100
                                )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Link
                    href={`/suppliers?createPo=1&materials=${item.id}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700"
                  >
                    Create PO
                  </Link>
                  <button
                    type="button"
                    onClick={() => onStockIn(item)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <ArrowDownLeft className="h-4 w-4" />
                    Adjust
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
