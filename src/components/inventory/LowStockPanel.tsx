'use client';

import {
  AlertTriangle,
  Package,
  ArrowDownLeft,
  Truck,
  TrendingDown,
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
      case 'low': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'out': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'low': return 'Low Stock';
      case 'critical': return 'Critical';
      case 'out': return 'Out of Stock';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low': return <TrendingDown className="h-5 w-5 text-amber-600" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-rose-600" />;
      case 'out': return <Package className="h-5 w-5 text-slate-400" />;
      default: return <Package className="h-5 w-5 text-slate-400" />;
    }
  };

  const outOfStock = items.filter((item) => item.status === 'out');
  const critical = items.filter((item) => item.status === 'critical');
  const low = items.filter((item) => item.status === 'low');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-rose-700">Critical / Out of Stock</div>
          <div className="mt-1 text-2xl font-bold text-rose-800">{outOfStock.length + critical.length}</div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-amber-700">Low Stock Items</div>
          <div className="mt-1 text-2xl font-bold text-amber-800">{low.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Package className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Items Below Threshold</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{items.length}</div>
        </div>
      </div>

      {/* Alert List */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">All Stock Levels Optimal</h3>
          <p className="mt-1 text-sm text-slate-500">No items are currently below their minimum stock threshold.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${getStatusStyle(item.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80">
                    {getStatusIcon(item.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold">{item.productName}</h3>
                      <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-bold">
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs opacity-80">{item.sku} · {item.category}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        Current: <strong>{item.currentStock} {item.unit}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingDown className="h-3.5 w-3.5" />
                        Minimum: <strong>{item.minStock} {item.unit}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        Supplier: <strong>{item.supplier}</strong>
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-white/60">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.status === 'out' ? 'bg-slate-400 w-0' :
                          item.status === 'critical' ? 'bg-rose-500' :
                          'bg-amber-500'
                        }`}
                        style={{ width: item.status === 'out' ? '0%' : `${Math.min(100, (item.currentStock / item.minStock) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onStockIn(item)}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  Restock
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
