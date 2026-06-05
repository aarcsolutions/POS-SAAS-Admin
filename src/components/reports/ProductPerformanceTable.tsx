'use client';

import { Search, Award, TrendingUp, TrendingDown } from 'lucide-react';

interface ProductPerf {
  id: string; name: string; sku: string; category: string;
  unitsSold: number; revenue: number; cost: number; profit: number;
  margin: number; growth: number;
}

interface Props { products: ProductPerf[]; searchQuery: string; onSearchChange: (v: string) => void; }

export default function ProductPerformanceTable({ products, searchQuery, onSearchChange }: Props) {
  const sorted = [...products].sort((a, b) => b.revenue - a.revenue);
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
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">Top Performer</div>
              <div className="text-lg font-bold text-emerald-800">{top.name}</div>
              <div className="text-sm text-emerald-600">PKR {top.revenue.toLocaleString()} revenue · {top.unitsSold} units · {top.margin}% margin</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-emerald-600">Growth</div>
              <div className={`text-lg font-bold flex items-center gap-1 ${top.growth >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {top.growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {top.growth > 0 ? '+' : ''}{top.growth}%
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products by name or SKU..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Rank</th>
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">Units Sold</th>
              <th className="px-5 py-4">Revenue</th>
              <th className="px-5 py-4">Profit</th>
              <th className="px-5 py-4">Margin</th>
              <th className="px-5 py-4">Growth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {sorted.map((p, i) => (
              <tr key={p.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                    i === 0 ? 'bg-emerald-100 text-emerald-700' : i === 1 ? 'bg-blue-100 text-blue-700' :
                    i === 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                  }`}>{i + 1}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">{p.name.charAt(0)}</div>
                    <div>
                      <div className="font-semibold text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.sku} · {p.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-bold text-slate-800">{p.unitsSold}</td>
                <td className="px-5 py-4 font-bold text-slate-800">PKR {p.revenue.toLocaleString()}</td>
                <td className="px-5 py-4 font-bold text-emerald-600">PKR {p.profit.toLocaleString()}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.margin >= 35 ? 'bg-emerald-100 text-emerald-700' : p.margin >= 25 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {p.margin}%
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${p.growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {p.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {p.growth > 0 ? '+' : ''}{p.growth}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <div className="py-12 text-center text-sm text-slate-400">No products found.</div>}
      </div>
    </div>
  );
}
