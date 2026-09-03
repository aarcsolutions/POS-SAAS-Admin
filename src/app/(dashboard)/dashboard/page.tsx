'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  Package,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import SalesPerformanceChart from '@/components/dashboard/SalesPerformanceChart';
import KpiStrip, { KpiItem } from '@/components/dashboard/KpiStrip';
import LiveOrdersWidget from '@/components/dashboard/LiveOrdersWidget';
import PaymentMixChart from '@/components/dashboard/PaymentMixChart';
import { Select } from '@/components/ui/Select';
import { useDashboardQuery } from '@/hooks/dashboard';
import { DashboardPeriod } from '@/types/dashboard.types';

function formatChange(percent: number): string {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent}%`;
}

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
];

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const { data, isLoading, isError, isFetching } = useDashboardQuery(period, {
    poll: true,
  });

  const overview = data?.data;
  const kpis = overview?.kpis;

  const kpiItems: KpiItem[] = useMemo(() => {
    if (!kpis) return [];
    return [
      {
        label: 'Today Revenue',
        value: kpis.today_revenue_formatted,
        sublabel: `${kpis.today_orders} orders`,
        icon: Wallet,
        accent: 'emerald',
      },
      {
        label: 'Period Revenue',
        value: kpis.period_revenue_formatted,
        sublabel: formatChange(kpis.period_change_percent),
        icon: TrendingUp,
        accent: 'sky',
      },
      {
        label: 'Period Orders',
        value: String(kpis.period_orders),
        sublabel: `${kpis.period_orders} in range`,
        icon: ShoppingBag,
        accent: 'violet',
      },
      {
        label: 'Avg Order Value',
        value: kpis.period_avg_order_value_formatted,
        icon: ShoppingCart,
        accent: 'amber',
      },
      {
        label: 'Active Orders',
        value: String(kpis.active_orders_count),
        sublabel: 'In progress',
        icon: Package,
        accent: 'violet',
      },
      {
        label: 'Customers',
        value: String(kpis.totals.customers),
        sublabel: `${kpis.totals.products} products`,
        icon: Users,
        accent: 'emerald',
      },
    ];
  }, [kpis]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live overview of sales, orders, and performance
            {isFetching ? ' · updating…' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-44">
            <Select
              value={period}
              onChange={(value) => setPeriod(value as DashboardPeriod)}
              size="md"
              allowEmpty={false}
              options={PERIOD_OPTIONS}
            />
          </div>
          <Link
            href="/reports"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
          >
            View Reports
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
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
          <KpiStrip items={kpiItems} />

          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Sales Performance
                </h2>
                <p className="text-sm text-slate-500">
                  Revenue trend for selected period
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <SalesPerformanceChart
                  series={overview?.sales_series || []}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Payment Mix
                </h2>
                <p className="text-sm text-slate-500">
                  How customers paid this period
                </p>
              </div>
              <PaymentMixChart items={overview?.payment_mix || []} />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <LiveOrdersWidget orders={overview?.live_orders || []} />

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Top Items
                  </h2>
                  <p className="text-sm text-slate-500">
                    Best sellers in selected period
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Units</th>
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
                          No product sales in this period.
                        </td>
                      </tr>
                    ) : (
                      overview?.top_products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-4 py-4 font-semibold text-slate-800">
                            {product.name}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {product.units_sold}
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
                  {overview?.low_stock_count ?? 0} items at or below{' '}
                  {overview?.low_stock_threshold ?? 10} units
                  {overview?.active_branches
                    ? ` · ${overview.branches_subtitle}`
                    : ''}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(overview?.low_stock_items || []).length === 0 ? (
                <p className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No low stock items right now.
                </p>
              ) : (
                overview?.low_stock_items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="font-semibold text-slate-800">
                      {item.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{item.sku}</div>
                    <div className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                      {item.stock_label}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
