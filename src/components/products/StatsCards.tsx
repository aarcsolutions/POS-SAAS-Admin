'use client';

import { Package, Check, AlertTriangle, Boxes, DollarSign } from 'lucide-react';

interface Props {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
}

export default function StatsCards({ totalProducts, activeProducts, lowStockProducts, outOfStockProducts, totalValue }: Props) {
  const stats = [
    { label: 'Total Products', value: totalProducts, icon: Package, color: 'text-slate-900' },
    { label: 'Active Products', value: activeProducts, icon: Check, color: 'text-emerald-600' },
    { label: 'Low Stock', value: lowStockProducts, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Out of Stock', value: outOfStockProducts, icon: Boxes, color: 'text-rose-600' },
    { label: 'Inventory Value', value: `PKR ${(totalValue / 1000).toFixed(1)}K`, icon: DollarSign, color: 'text-slate-900' },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-sm font-medium text-slate-500">{stat.label}</div>
            <div className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        );
      })}
    </div>
  );
}
