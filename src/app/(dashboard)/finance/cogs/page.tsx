'use client';

import { useState } from 'react';
import { Loader2, PieChart } from 'lucide-react';
import FinancePeriodFilter, {
  defaultLastDaysRange,
  formatFinanceMoney,
} from '@/components/finance/FinancePeriodFilter';
import { useCogsReportQuery } from '@/hooks/finance-reports';
import { FinanceReportEnvelope } from '@/types/finance.types';

export default function CogsPage() {
  const [range, setRange] = useState(defaultLastDaysRange(30));
  const params = { date_from: range.from, date_to: range.to };

  const { data, isLoading } = useCogsReportQuery(params);
  const report = (data?.data || {}) as FinanceReportEnvelope;

  const rows = [
    { label: 'Net sales', value: report.net_sales },
    { label: 'Estimated COGS', value: report.estimated_cogs },
    { label: 'Gross profit', value: report.gross_profit },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">COGS</h1>
          <p className="mt-1 text-sm text-slate-500">
            Estimated cost of goods sold
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
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Metric</th>
                <th className="px-5 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row) => (
                <tr key={row.label} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium text-slate-800">
                    {row.label}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-900">
                    {formatFinanceMoney(row.value as number | undefined)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {report.note && (
            <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              <PieChart className="mr-1 inline h-3.5 w-3.5" />
              {report.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
