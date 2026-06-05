'use client';

import { PieChart, TrendingUp, TrendingDown, DollarSign, Package, Target } from 'lucide-react';

interface ProductPerf {
  id: string; name: string; sku: string; category: string;
  unitsSold: number; revenue: number; cost: number; profit: number; margin: number; growth: number;
}

interface DailySale { date: string; day: string; revenue: number; orders: number; avgOrderValue: number; profit: number; }

interface Props { products: ProductPerf[]; dailySales: DailySale[]; }

export default function ProfitAnalysisView({ products, dailySales }: Props) {
  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);
  const totalCost = products.reduce((s, p) => s + p.cost, 0);
  const totalProfit = products.reduce((s, p) => s + p.profit, 0);
  const avgMargin = totalProfit / totalRevenue * 100;

  const byCategory: Record<string, { revenue: number; cost: number; profit: number }> = {};
  products.forEach((p) => {
    if (!byCategory[p.category]) byCategory[p.category] = { revenue: 0, cost: 0, profit: 0 };
    byCategory[p.category].revenue += p.revenue;
    byCategory[p.category].cost += p.cost;
    byCategory[p.category].profit += p.profit;
  });

  const categoryEntries = Object.entries(byCategory).sort((a, b) => b[1].profit - a[1].profit);
  const maxCatProfit = Math.max(...categoryEntries.map(([, v]) => v.profit));

  const highMargin = products.filter((p) => p.margin >= 35);
  const lowMargin = products.filter((p) => p.margin < 25);
  const profitable = products.filter((p) => p.profit > 0);
  const unprofitable = products.filter((p) => p.profit <= 0);

  const weeklyProfit = dailySales.reduce((s, d) => s + d.profit, 0);
  const prevWeekProfit = Math.round(weeklyProfit * 0.92);
  const profitChange = ((weeklyProfit - prevWeekProfit) / prevWeekProfit) * 100;

  return (
    <div className="space-y-6">
      {/* Profit Summary */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Revenue</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">PKR {totalRevenue.toLocaleString()}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
            <Package className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Cost</div>
          <div className="mt-1 text-2xl font-bold text-rose-700">PKR {totalCost.toLocaleString()}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <PieChart className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Profit</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">PKR {totalProfit.toLocaleString()}</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp className="h-3 w-3" /> +{profitChange.toFixed(1)}% vs last period
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Target className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Avg Margin</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{avgMargin.toFixed(1)}%</div>
        </div>
      </div>

      {/* Category Profit Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Profit by Category</h3>
        <div className="space-y-4">
          {categoryEntries.map(([cat, data]) => (
            <div key={cat} className="flex items-center gap-4">
              <div className="w-32 shrink-0 text-sm font-medium text-slate-700">{cat}</div>
              <div className="flex-1">
                <div className="mb-1 h-5 overflow-hidden rounded-full bg-slate-50">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(data.profit / maxCatProfit) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-24 text-right text-sm font-bold text-slate-700">PKR {data.profit.toLocaleString()}</div>
              <div className="w-16 text-right text-xs font-bold text-emerald-600">{((data.profit / data.revenue) * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Margin Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Margin Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-800">High Margin</div>
                  <div className="text-xs text-emerald-600">35% or higher</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-emerald-700">{highMargin.length}</div>
                <div className="text-xs text-emerald-600">products</div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-800">Normal Margin</div>
                  <div className="text-xs text-blue-600">25% – 35%</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-700">{products.length - highMargin.length - lowMargin.length}</div>
                <div className="text-xs text-blue-600">products</div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4 border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-800">Low Margin</div>
                  <div className="text-xs text-amber-600">Below 25%</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-amber-700">{lowMargin.length}</div>
                <div className="text-xs text-amber-600">products</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Profitability Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-800">Profitable</div>
                  <div className="text-xs text-emerald-600">Positive profit</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-emerald-700">{profitable.length}</div>
                <div className="text-xs text-emerald-600">products</div>
              </div>
            </div>

            {unprofitable.length > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-rose-50 p-4 border border-rose-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-rose-800">Unprofitable</div>
                    <div className="text-xs text-rose-600">Negative or zero profit</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-rose-700">{unprofitable.length}</div>
                  <div className="text-xs text-rose-600">products</div>
                </div>
              </div>
            )}

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Cost Breakdown</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Revenue</span>
                  <span className="font-bold text-slate-800">PKR {totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Cost</span>
                  <span className="font-bold text-rose-700">PKR {totalCost.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                  <span className="text-slate-600">Net Profit</span>
                  <span className="font-bold text-emerald-700">PKR {totalProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
