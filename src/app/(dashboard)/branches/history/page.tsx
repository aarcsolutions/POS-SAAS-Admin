'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, History } from 'lucide-react';
import {
  useBranchHistoryQuery,
  useBranchHistoryReportQuery,
} from '@/hooks/branches';

export default function BranchHistoryPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: listRes, isLoading } = useBranchHistoryQuery({
    page: 1,
    limit: 50,
  });
  const { data: reportRes, isLoading: reportLoading } =
    useBranchHistoryReportQuery(selectedId);

  const items = useMemo(() => {
    const rows =
      listRes?.data?.items ||
      listRes?.data?.data ||
      (Array.isArray(listRes?.data) ? listRes.data : []) ||
      [];
    return rows as any[];
  }, [listRes]);

  const report = reportRes?.data || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/branches"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Deleted Branch History
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Archived sales data for permanently deleted branches
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-400">
              Loading history…
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No permanently deleted branches yet.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Deleted</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr
                    key={row.id}
                    className={`cursor-pointer border-b border-slate-50 hover:bg-slate-50 ${
                      selectedId === row.id ? 'bg-[var(--brand-primary-soft)]' : ''
                    }`}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {row.branch_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {row.branch_code}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">{row.status}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.deleted_at
                        ? new Date(row.deleted_at).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {!selectedId ? (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-slate-400">
              <History className="h-8 w-8" />
              <p className="text-sm">Select a history row to view report</p>
            </div>
          ) : reportLoading ? (
            <p className="text-sm text-slate-400">Loading report…</p>
          ) : !report ? (
            <p className="text-sm text-slate-400">No report available</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {report.history?.branch_name}
                </h2>
                <p className="text-sm text-slate-500">
                  {report.history?.branch_code} · {report.history?.status}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">Total sales</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">
                    {report.total_sales_formatted}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">Orders</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">
                    {report.period_orders}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 col-span-2">
                  <div className="text-xs text-slate-500">Avg order value</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">
                    {report.period_avg_order_value_formatted}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-800">
                  Payment mix
                </h3>
                <ul className="space-y-2">
                  {(report.payment_mix || []).map((row: any) => (
                    <li
                      key={row.method}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                    >
                      <span className="capitalize text-slate-700">
                        {row.method} ({row.count})
                      </span>
                      <span className="font-medium text-slate-900">
                        {row.amount_formatted} · {row.percent}%
                      </span>
                    </li>
                  ))}
                  {(report.payment_mix || []).length === 0 && (
                    <li className="text-sm text-slate-400">No payments</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
