'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Loader2,
  Package,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import SalesPerformanceChart from '@/components/dashboard/SalesPerformanceChart';
import { Select } from '@/components/ui/Select';
import { useDashboardQuery } from '@/hooks/dashboard';
import { DashboardPeriod } from '@/types/dashboard.types';

function formatChange(percent: number): string {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent}%`;
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const { data, isLoading, isError, isFetching } = useDashboardQuery(period);

  const overview = data?.data;

  const stats = useMemo(() => {
    if (!overview) return [];

    return [
      {
        label: 'Total Sales',
        value: overview.total_sales_formatted,
        change: formatChange(overview.total_sales_change_percent),
        icon: Wallet,
      },
      {
        label: 'Monthly Revenue',
        value: overview.monthly_revenue_formatted,
        change: formatChange(overview.monthly_change_percent),
        icon: TrendingUp,
      },
      {
        label: 'Active Branches',
        value: String(overview.active_branches).padStart(2, '0'),
        change: overview.branches_subtitle,
        icon: Building2,
      },
      {
        label: 'Low Stock Alerts',
        value: String(overview.low_stock_count),
        change:
          overview.low_stock_count > 0 ? 'Needs review' : 'All good',
        icon: AlertTriangle,
      },
    ];
  }, [overview]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of sales, revenue, stock, and branches.
          </p>
        </div>
        <Link
          href="/reports"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
        >
          View Reports
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading && !overview ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          Failed to load dashboard. Please refresh and try again.
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Sales Performance
                  </h2>
                  <p className="text-sm text-slate-500">
                    Daily and monthly sales trend
                    {isFetching ? ' · updating…' : ''}
                  </p>
                </div>
                <Select
                  value={period}
                  onChange={(value) => setPeriod(value as DashboardPeriod)}
                  size="md"
                  allowEmpty={false}
                  options={[
                    { value: '30d', label: 'Last 30 days' },
                    { value: 'month', label: 'This month' },
                    { value: 'year', label: 'This year' },
                  ]}
                />
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <SalesPerformanceChart
                  series={overview?.sales_series || []}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Low Stock Alerts
                  </h2>
                  <p className="text-sm text-slate-500">
                    Items at or below {overview?.low_stock_threshold ?? 10}{' '}
                    units
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {(overview?.low_stock_items || []).length === 0 ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No low stock items right now.
                  </p>
                ) : (
                  overview?.low_stock_items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold text-slate-800">
                            {item.name}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {item.sku}
                          </div>
                        </div>
                        <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                          {item.stock_label}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Top Products
                </h2>
                <p className="text-sm text-slate-500">
                  Product performance summary
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Sales</th>
                    <th className="px-4 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {(overview?.top_products || []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-slate-400"
                      >
                        No product sales yet.
                      </td>
                    </tr>
                  ) : (
                    overview?.top_products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-4 font-semibold text-slate-800">
                          {product.name}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {product.sales_label}
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-900">
                          {product.revenue_formatted}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
