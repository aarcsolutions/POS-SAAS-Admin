'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  DollarSign,
  Loader2,
  Package,
  ShoppingCart,
  CreditCard,
  ArrowLeft,
  Star,
} from 'lucide-react';
import ProductPerformanceTable from '@/components/reports/ProductPerformanceTable';
import SalesPerformanceChart from '@/components/dashboard/SalesPerformanceChart';
import PaymentMixChart from '@/components/dashboard/PaymentMixChart';
import { Select } from '@/components/ui/Select';
import { useReportsQuery } from '@/hooks/reports';
import { DashboardPeriod } from '@/types/dashboard.types';

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

function formatChange(percent: number): string {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent}% vs prior period`;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products'>(
    'overview'
  );
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError } = useReportsQuery(period);
  const report = data?.data;
  const kpis = report?.kpis;
  const reviewsSummary = report?.reviews_summary;

  const productRows = useMemo(
    () =>
      (report?.top_products || []).map((p) => ({
        id: p.id,
        name: p.name,
        unitsSold: p.units_sold,
        revenue: p.revenue,
        revenueFormatted: p.revenue_formatted,
        orderCount: p.order_count,
      })),
    [report?.top_products]
  );

  const maxDowRevenue = Math.max(
    ...(report?.sales_by_day_of_week || []).map((d) => d.revenue),
    1
  );
  const maxCategoryRevenue = Math.max(
    ...(report?.sales_by_category || []).map((c) => c.revenue),
    1
  );
  const maxRatingCount = Math.max(
    ...(reviewsSummary?.rating_distribution || []).map((r) => r.count),
    1
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sales & Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Analyze sales performance and product metrics from live data.
          </p>
        </div>
        <div className="w-44">
          <Select
            value={period}
            onChange={(value) => setPeriod(value as DashboardPeriod)}
            size="lg"
            allowEmpty={false}
            options={PERIOD_OPTIONS}
          />
        </div>
      </div>

      {isLoading && !report ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          Failed to load reports. Please refresh and try again.
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-slate-500">
                Period Revenue
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {kpis?.period_revenue_formatted}
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--brand-primary)]">
                {formatChange(kpis?.period_change_percent ?? 0)}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-slate-500">
                Total Orders
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {kpis?.period_orders ?? 0}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {kpis?.today_orders ?? 0} today
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-slate-500">
                Avg Order Value
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {kpis?.period_avg_order_value_formatted}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-slate-500">
                All-time Sales
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {report?.total_sales_formatted}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                <Star className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-slate-500">
                Avg Rating
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {reviewsSummary?.review_count
                  ? reviewsSummary.avg_rating.toFixed(1)
                  : '—'}
              </div>
              <div className="mt-1 text-xs text-slate-500">out of 5 stars</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                <Star className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-slate-500">
                Review Count
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {reviewsSummary?.review_count ?? 0}
              </div>
              <div className="mt-1 text-xs text-slate-500">in selected period</div>
            </div>
          </div>

          <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'products', label: 'Product Performance', icon: Package },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id as typeof activeTab)
                  }
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-[var(--brand-primary)] text-white shadow-md shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)]'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-1 text-lg font-semibold text-slate-900">
                    Revenue Trend
                  </h2>
                  <p className="mb-6 text-sm text-slate-500">
                    Sales over the selected period
                  </p>
                  <SalesPerformanceChart
                    series={report?.sales_series || []}
                  />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-1 text-lg font-semibold text-slate-900">
                    Payment Mix
                  </h2>
                  <p className="mb-6 text-sm text-slate-500">
                    Payment methods breakdown
                  </p>
                  <PaymentMixChart items={report?.payment_mix || []} />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">
                    Sales by Day of Week
                  </h3>
                  <div className="space-y-3">
                    {(report?.sales_by_day_of_week || []).length === 0 ? (
                      <p className="text-sm text-slate-400">No data for period</p>
                    ) : (
                      report?.sales_by_day_of_week.map((day) => (
                        <div key={day.label} className="flex items-center gap-3">
                          <div className="w-12 text-xs font-medium text-slate-600">
                            {day.label}
                          </div>
                          <div className="flex-1">
                            <div className="h-6 overflow-hidden rounded-lg bg-slate-50">
                              <div
                                className="flex h-full items-center justify-end rounded-lg bg-[var(--brand-chart)] px-2 text-xs font-bold text-white"
                                style={{
                                  width: `${(day.revenue / maxDowRevenue) * 100}%`,
                                  minWidth: day.revenue > 0 ? '2rem' : 0,
                                }}
                              >
                                {day.revenue > 0 && day.revenue_formatted}
                              </div>
                            </div>
                          </div>
                          <div className="w-16 text-right text-xs text-slate-500">
                            {day.orders} orders
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">
                    Sales by Category
                  </h3>
                  <div className="space-y-3">
                    {(report?.sales_by_category || []).length === 0 ? (
                      <p className="text-sm text-slate-400">No data for period</p>
                    ) : (
                      report?.sales_by_category.map((cat) => {
                        return (
                          <div
                            key={cat.id}
                            className="flex items-center gap-3"
                          >
                            <div className="w-28 truncate text-xs font-medium text-slate-600">
                              {cat.category_name}
                            </div>
                            <div className="flex-1">
                              <div className="h-5 overflow-hidden rounded-full bg-slate-50">
                                <div
                                  className="h-full rounded-full bg-[var(--brand-primary)]"
                                  style={{
                                    width: `${(cat.revenue / maxCategoryRevenue) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="w-24 text-right text-xs font-bold text-slate-700">
                              {cat.revenue_formatted}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">
                    Rating Distribution
                  </h3>
                  <div className="space-y-3">
                    {(reviewsSummary?.rating_distribution || []).every(
                      (r) => r.count === 0
                    ) ? (
                      <p className="text-sm text-slate-400">No reviews for period</p>
                    ) : (
                      (reviewsSummary?.rating_distribution || []).map((row) => (
                        <div key={row.rating} className="flex items-center gap-3">
                          <div className="flex w-16 items-center gap-1 text-xs font-medium text-slate-600">
                            <Star className="h-3 w-3 fill-[#f5c518] text-[#f5c518]" />
                            {row.rating}
                          </div>
                          <div className="flex-1">
                            <div className="h-6 overflow-hidden rounded-lg bg-slate-50">
                              <div
                                className="flex h-full items-center justify-end rounded-lg bg-[var(--brand-primary)] px-2 text-xs font-bold text-white"
                                style={{
                                  width: `${(row.count / maxRatingCount) * 100}%`,
                                  minWidth: row.count > 0 ? '2rem' : 0,
                                }}
                              >
                                {row.count > 0 && row.count}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <ProductPerformanceTable
              products={productRows}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}
        </>
      )}
    </div>
  );
}
