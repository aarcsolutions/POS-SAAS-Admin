'use client';

import { Search, Award } from 'lucide-react';

export interface ReportProductRow {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
  revenueFormatted: string;
  orderCount: number;
}

interface Props {
  products: ReportProductRow[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
}

export default function ProductPerformanceTable({
  products,
  searchQuery,
  onSearchChange,
}: Props) {
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => b.revenue - a.revenue);
  const top = sorted[0];

  return (
    <div className="space-y-6">
      {top && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Award className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Top Performer
              </div>
              <div className="text-lg font-bold text-emerald-800">{top.name}</div>
              <div className="text-sm text-emerald-600">
                {top.revenueFormatted} · {top.unitsSold} units ·{' '}
                {top.orderCount} orders
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products by name..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Rank</th>
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">Units Sold</th>
              <th className="px-5 py-4">Orders</th>
              <th className="px-5 py-4">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {sorted.map((p, i) => (
              <tr key={p.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                      i === 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : i === 1
                          ? 'bg-blue-100 text-blue-700'
                          : i === 2
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                      {p.name.charAt(0)}
                    </div>
                    <div className="font-semibold text-slate-800">{p.name}</div>
                  </div>
                </td>
                <td className="px-5 py-4 font-bold text-slate-800">
                  {p.unitsSold}
                </td>
                <td className="px-5 py-4 text-slate-600">{p.orderCount}</td>
                <td className="px-5 py-4 font-bold text-slate-800">
                  {p.revenueFormatted}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            No products found for this period.
          </div>
        )}
      </div>
    </div>
  );
}
