'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  FileBarChart,
  Loader2,
  PieChart,
  TrendingUp,
  Waves,
  Wallet,
} from 'lucide-react';
import FinancePeriodFilter, {
  defaultLastDaysRange,
  formatFinanceMoney,
} from '@/components/finance/FinancePeriodFilter';
import {
  useFinanceDashboardQuery,
  useTaxSummaryQuery,
  useRegisterSummaryQuery,
} from '@/hooks/finance-reports';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import { FinanceReportEnvelope } from '@/types/finance.types';

const LINKS = [
  {
    href: '/finance',
    label: 'Finance Dashboard',
    icon: Wallet,
    perm: ENTITY_PERMS.finance.list,
  },
  {
    href: '/finance/cogs',
    label: 'COGS',
    icon: PieChart,
    perm: ENTITY_PERMS.finance_reports.extras.cogs,
  },
  {
    href: '/finance/profit-loss',
    label: 'P&L',
    icon: TrendingUp,
    perm: ENTITY_PERMS.finance_reports.extras.profitLoss,
  },
  {
    href: '/finance/cash-flow',
    label: 'Cash Flow',
    icon: Waves,
    perm: ENTITY_PERMS.finance_reports.extras.cashFlow,
  },
];

function ReportLink({
  href,
  label,
  icon: Icon,
  perm,
}: {
  href: string;
  label: string;
  icon: typeof Wallet;
  perm: string;
}) {
  const allowed = usePermission(perm);
  if (!allowed) return null;
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)]"
    >
      <Icon className="h-5 w-5 text-[var(--brand-primary)]" />
      <span className="font-semibold text-slate-800">{label}</span>
    </Link>
  );
}

export default function FinancialReportsHubPage() {
  const [range, setRange] = useState(defaultLastDaysRange(30));
  const params = { date_from: range.from, date_to: range.to };

  const canTax = usePermission(
    ENTITY_PERMS.finance_reports.extras.taxSummary
  );
  const canRegister = usePermission(
    ENTITY_PERMS.finance_reports.extras.registerSummary
  );

  const { data: dashData, isLoading: dashLoading } =
    useFinanceDashboardQuery(params);
  const { data: taxData, isLoading: taxLoading } = useTaxSummaryQuery(
    params,
    canTax
  );
  const { data: regData, isLoading: regLoading } = useRegisterSummaryQuery(
    params,
    canRegister
  );

  const dash = (dashData?.data || {}) as FinanceReportEnvelope;
  const tax = (taxData?.data || {}) as Record<string, unknown>;
  const reg = (regData?.data || {}) as Record<string, unknown>;
  const kpis = dash.kpis || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Financial Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Hub for finance reports
            {dash.period_label ? ` · ${dash.period_label}` : ''}
          </p>
        </div>
        <FinancePeriodFilter value={range} onChange={setRange} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map((link) => (
          <ReportLink key={link.href} {...link} />
        ))}
      </div>

      {dashLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Net sales', value: kpis.net_sales },
            { label: 'Est. COGS', value: kpis.estimated_cogs },
            { label: 'Gross profit', value: kpis.gross_profit },
            { label: 'Est. net profit', value: kpis.estimated_net_profit },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatFinanceMoney(card.value as number | undefined)}
              </p>
            </div>
          ))}
        </div>
      )}

      {canTax && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <FileBarChart className="h-4 w-4 text-[var(--brand-primary)]" />
            <h2 className="font-semibold text-slate-900">Tax summary</h2>
          </div>
          {taxLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="px-5 py-4 text-sm text-slate-700">
              Tax collected:{' '}
              <span className="font-semibold">
                {formatFinanceMoney(tax.tax_collected as number | undefined)}
              </span>
              {tax.order_count != null && (
                <span className="ml-2 text-slate-500">
                  · {String(tax.order_count)} orders
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {canRegister && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Register summary</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Open = currently running shifts. Closed / expected = shifts closed
              in the selected date range.
            </p>
          </div>
          {regLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              <div className="grid gap-3 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                <div>
                  <p className="text-xs uppercase text-slate-500">Open shifts</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {String(reg.open_shifts ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">
                    Closed shifts
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {String(reg.closed_shifts ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">
                    Expected cash
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatFinanceMoney(
                      reg.expected_cash as number | undefined
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Actual cash</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatFinanceMoney(reg.actual_cash as number | undefined)}
                  </p>
                </div>
              </div>
              {Array.isArray(reg.shifts) &&
                (reg.shifts as Array<Record<string, unknown>>).length > 0 && (
                  <div className="overflow-x-auto border-t border-slate-100">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-5 py-2.5 font-semibold">Register</th>
                          <th className="px-5 py-2.5 font-semibold">Status</th>
                          <th className="px-5 py-2.5 font-semibold">Opened</th>
                          <th className="px-5 py-2.5 font-semibold text-right">
                            Expected
                          </th>
                          <th className="px-5 py-2.5 font-semibold text-right">
                            Actual
                          </th>
                          <th className="px-5 py-2.5 font-semibold text-right">
                            Diff
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(
                          reg.shifts as Array<Record<string, unknown>>
                        ).map((row) => (
                          <tr key={String(row.id)} className="text-slate-700">
                            <td className="px-5 py-2.5">
                              {String(row.register_name ?? '—')}
                            </td>
                            <td className="px-5 py-2.5 capitalize">
                              {String(row.status ?? '—')}
                            </td>
                            <td className="px-5 py-2.5 text-slate-500">
                              {row.opened_at
                                ? new Date(
                                    String(row.opened_at)
                                  ).toLocaleString()
                                : '—'}
                            </td>
                            <td className="px-5 py-2.5 text-right">
                              {formatFinanceMoney(
                                row.expected_cash as number | undefined
                              )}
                            </td>
                            <td className="px-5 py-2.5 text-right">
                              {formatFinanceMoney(
                                row.actual_cash as number | undefined
                              )}
                            </td>
                            <td className="px-5 py-2.5 text-right">
                              {formatFinanceMoney(
                                row.difference as number | undefined
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
