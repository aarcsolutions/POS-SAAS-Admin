'use client';

import { useEffect, useState } from 'react';
import { CircleDollarSign, Loader2, Search } from 'lucide-react';
import ListPager from '@/components/ui/ListPager';
import { Select } from '@/components/ui/Select';
import { useFinanceReceivablesQuery } from '@/hooks/finance-receivables';
import { useTenantBranchScope } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { CustomerReceivableRow } from '@/types/finance.types';
import { formatFinanceMoney } from '@/components/finance/FinancePeriodFilter';

const LIMIT = 10;

export default function ReceivablesPage() {
  const { isTenantAdmin, showBranchFilter, branchOptions } = useTenantBranchScope();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState('');

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter]);

  const { data, isLoading } = useFinanceReceivablesQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin ? branchFilter || undefined : undefined,
  });

  const receivables = extractListItems<CustomerReceivableRow>(data);
  const pagination = extractPagination(data, LIMIT);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Receivables</h1>
        <p className="mt-1 text-sm text-slate-500">
          Customer AR balances. Collections are recorded via order payments.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order or customer..."
            className="h-11 w-[260px] rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
          />
        </div>
        {showBranchFilter && (
          <Select
            value={branchFilter}
            onChange={setBranchFilter}
            options={[
              { value: '', label: 'All branches' },
              ...branchOptions,
            ]}
            className="w-[180px]"
          />
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Opened</th>
              <th className="px-5 py-4">Order</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Original</th>
              <th className="px-5 py-4 text-right">Paid</th>
              <th className="px-5 py-4 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                </td>
              </tr>
            ) : receivables.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <CircleDollarSign className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No receivables
                </td>
              </tr>
            ) : (
              receivables.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-slate-600">
                    {row.opened_at
                      ? new Date(row.opened_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-700">
                    {row.order_id?.slice(0, 8)}…
                  </td>
                  <td className="px-5 py-4 capitalize text-slate-600">
                    {row.status}
                  </td>
                  <td className="px-5 py-4 text-right font-medium">
                    {formatFinanceMoney(row.original_amount)}
                  </td>
                  <td className="px-5 py-4 text-right text-slate-600">
                    {formatFinanceMoney(row.paid_amount)}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {formatFinanceMoney(row.balance)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ListPager
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={LIMIT}
        onPageChange={setPage}
      />
    </div>
  );
}
