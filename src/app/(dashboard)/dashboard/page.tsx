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
import DateRangePicker, {
  defaultLastDaysRange,
} from '@/components/ui/DateRangePicker';
import { useDashboardQuery } from '@/hooks/dashboard';

function formatChange(percent: number): string {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent}%`;
}

export default function DashboardPage() {
  const [range, setRange] = useState(defaultLastDaysRange(30));
  const { data, isLoading, isError, isFetching } = useDashboardQuery(range, {
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
      },
      {
        label: 'Period Revenue',
        value: kpis.period_revenue_formatted,
        sublabel: formatChange(kpis.period_change_percent),
        icon: TrendingUp,
      },
      {
        label: 'Period Orders',
        value: String(kpis.period_orders),
        sublabel: `${kpis.period_orders} in range`,
        icon: ShoppingBag,
      },
      {
        label: 'Avg Order Value',
        value: kpis.period_avg_order_value_formatted,
        icon: ShoppingCart,
      },
      {
        label: 'Active Orders',
        value: String(kpis.active_orders_count),
        sublabel: 'In progress',
        icon: Package,
      },
      {
        label: 'Customers',
        value: String(kpis.totals.customers),
        sublabel: `${kpis.totals.products} products`,
        icon: Users,
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
          <DateRangePicker value={range} onChange={setRange} />
          <Link
            href="/reports"
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] hover:brightness-95"
          >
            View Reports
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {isLoading && !overview ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
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

          <div className="rounded-2xl border border-[var(--brand-primary-soft)] bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--brand-primary-soft)] bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Low Stock Alerts
                  </h2>
                  <p className="text-sm text-slate-500">
                    {overview?.low_stock_count ?? 0} item
                    {(overview?.low_stock_count ?? 0) === 1 ? '' : 's'} at or
                    below minimum quantity
                    {overview?.active_branches
                      ? ` · ${overview.branches_subtitle}`
                      : ''}
                  </p>
                </div>
              </div>
              {(overview?.low_stock_items || []).length > 0 && (
                <Link
                  href={`/suppliers?createPo=1&materials=${(overview?.low_stock_items || [])
                    .map((i) => i.id)
                    .join(',')}`}
                  className="inline-flex items-center gap-1.5 self-start rounded-xl bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-95 sm:self-auto"
                >
                  Create PO
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(overview?.low_stock_items || []).length === 0 ? (
                <p className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No low stock items right now. Stock is managed via Raw
                  Materials and supplier purchase orders.
                </p>
              ) : (
                overview?.low_stock_items.map((item) => {
                  const threshold =
                    item.min_stock_level ??
                    overview?.low_stock_threshold ??
                    10;
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[var(--brand-primary-soft)] bg-gradient-to-br from-[var(--brand-primary-soft)] to-white p-4"
                    >
                      <div className="font-semibold text-slate-800">
                        {item.name}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {item.unit || 'Raw material'}
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            On hand
                          </div>
                          <div className="text-lg font-bold text-[var(--brand-primary-dark)]">
                            {item.stock_quantity}
                            {item.unit ? (
                              <span className="ml-1 text-xs font-semibold text-slate-500">
                                {item.unit}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Min qty
                          </div>
                          <div className="text-sm font-semibold text-slate-600">
                            {threshold}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="inline-flex rounded-full border border-[var(--brand-primary-soft)] bg-[color-mix(in_srgb,var(--brand-primary)_14%,white)] px-2.5 py-0.5 text-xs font-bold text-[var(--brand-primary-dark)]">
                          {item.stock_label}
                        </span>
                        <Link
                          href={`/suppliers?createPo=1&materials=${item.id}`}
                          className="text-xs font-bold text-[var(--brand-primary)] hover:brightness-90"
                        >
                          Create PO →
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
