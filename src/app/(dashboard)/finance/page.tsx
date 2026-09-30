'use client';

import { useState } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import FinancePeriodFilter, {
  defaultLastDaysRange,
  formatFinanceMoney,
} from '@/components/finance/FinancePeriodFilter';
import { useFinanceDashboardQuery } from '@/hooks/finance-reports';
import { FinanceReportEnvelope } from '@/types/finance.types';

export default function FinanceDashboardPage() {
  const [range, setRange] = useState(defaultLastDaysRange(30));
  const params = { date_from: range.from, date_to: range.to };

  const { data, isLoading } = useFinanceDashboardQuery(params);
  const report = (data?.data || {}) as FinanceReportEnvelope;
  const kpis = report.kpis || {};

  const cards = [
    { label: 'Net sales', value: kpis.net_sales },
    { label: 'Est. COGS', value: kpis.estimated_cogs },
    { label: 'Gross profit', value: kpis.gross_profit },
    { label: 'Expenses', value: kpis.expenses },
    { label: 'Est. net profit', value: kpis.estimated_net_profit },
    { label: 'Cash in', value: kpis.cash_in },
    { label: 'Cash out', value: kpis.cash_out },
    { label: 'Net cash flow', value: kpis.net_cash_flow },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Branch finance KPIs
            {report.period_label ? ` · ${report.period_label}` : ''}
          </p>
        </div>
        <FinancePeriodFilter value={range} onChange={setRange} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
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

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Current balances</h2>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Bucket</th>
                  <th className="px-5 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(() => {
                  const bal = (kpis.current_balances || {}) as Record<
                    string,
                    number
                  >;
                  const balanceRows = [
                    { label: 'Total', value: bal.total_balance },
                    { label: 'Cash', value: bal.cash_balance },
                    { label: 'Bank', value: bal.bank_balance },
                    { label: 'Wallet', value: bal.wallet_balance },
                  ];
                  if (
                    balanceRows.every(
                      (r) => r.value == null || Number(r.value) === 0
                    )
                  ) {
                    return (
                      <tr>
                        <td
                          colSpan={2}
                          className="py-10 text-center text-slate-400"
                        >
                          <Wallet className="mx-auto mb-2 h-8 w-8 opacity-40" />
                          No account balances
                        </td>
                      </tr>
                    );
                  }
                  return balanceRows.map((row) => (
                    <tr key={row.label} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {row.label}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-900">
                        {formatFinanceMoney(row.value)}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
