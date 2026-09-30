'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import FinancePeriodFilter, {
  defaultLastDaysRange,
  formatFinanceMoney,
} from '@/components/finance/FinancePeriodFilter';
import { useCashFlowQuery } from '@/hooks/finance-reports';
import { FinanceReportEnvelope } from '@/types/finance.types';

export default function CashFlowPage() {
  const [range, setRange] = useState(defaultLastDaysRange(30));
  const params = { date_from: range.from, date_to: range.to };

  const { data, isLoading } = useCashFlowQuery(params);
  const report = (data?.data || {}) as FinanceReportEnvelope;

  const rows = [
    { label: 'Cash in', value: report.cash_in },
    { label: 'Cash out', value: report.cash_out },
    { label: 'Net cash flow', value: report.net_cash_flow },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash Flow</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ledger-based cash movement
            {report.period_label ? ` · ${report.period_label}` : ''}
          </p>
        </div>
        <FinancePeriodFilter value={range} onChange={setRange} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {row.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatFinanceMoney(row.value as number | undefined)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
