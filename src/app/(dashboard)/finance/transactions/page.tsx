'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowLeftRight,
  Loader2,
  Plus,
  Search,
  Ban,
} from 'lucide-react';
import ListPager from '@/components/ui/ListPager';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useFinanceTransactionsQuery,
  useTransferMutation,
  useVoidFinanceTransactionMutation,
} from '@/hooks/finance-transactions';
import { useFinanceAccountsQuery } from '@/hooks/finance-accounts';
import { useTenantBranchScope } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  extractListItems,
  extractPagination,
  formatDate,
} from '@/utils/helpers';
import {
  FinanceAccountRow,
  FinanceTransactionRow,
} from '@/types/finance.types';
import { confirmDialog } from '@/store/dialogStore';
import { formatFinanceMoney } from '@/components/finance/FinancePeriodFilter';

const LIMIT = 10;

export default function FinanceTransactionsPage() {
  const { isTenantAdmin, showBranchFilter, branchOptions } = useTenantBranchScope();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState('');
  const [direction, setDirection] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canTransfer = usePermission(
    ENTITY_PERMS.finance_transactions.extras.transfer
  );
  const canVoid = usePermission(ENTITY_PERMS.finance_transactions.extras.void);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter, direction]);

  const { data: accountsRes } = useFinanceAccountsQuery({
    page: 1,
    limit: 100,
    branch_id: isTenantAdmin ? branchFilter || undefined : undefined,
  });
  const accounts = extractListItems<FinanceAccountRow>(accountsRes);

  const { data, isLoading } = useFinanceTransactionsQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin ? branchFilter || undefined : undefined,
    direction: direction || undefined,
  });

  const transferMutation = useTransferMutation();
  const voidMutation = useVoidFinanceTransactionMutation();

  const rows = extractListItems<FinanceTransactionRow>(data);
  const pagination = extractPagination(data, LIMIT);

  if (showTransfer) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setShowTransfer(false)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Transactions
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Transfer</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!fromId || !toId || amount === '') return;
            await transferMutation.mutateAsync({
              from_account_id: fromId,
              to_account_id: toId,
              amount: Number(amount),
              description: description || undefined,
              branch_id: isTenantAdmin ? branchFilter || undefined : undefined,
            });
            setShowTransfer(false);
            setFromId('');
            setToId('');
            setAmount('');
            setDescription('');
          }}
          className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">From</label>
            <Select
              value={fromId}
              onChange={setFromId}
              options={accounts.map((a) => ({
                value: a.id,
                label: `${a.name} (${formatFinanceMoney(a.current_balance)})`,
              }))}
              placeholder="From account"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">To</label>
            <Select
              value={toId}
              onChange={setToId}
              options={accounts
                .filter((a) => a.id !== fromId)
                .map((a) => ({
                  value: a.id,
                  label: `${a.name} (${formatFinanceMoney(a.current_balance)})`,
                }))}
              placeholder="To account"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount</label>
            <input
              type="number"
              min={0.01}
              step="0.01"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value === '' ? '' : Number(e.target.value))
              }
              required
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
            />
          </div>
          <button
            type="submit"
            disabled={transferMutation.isPending}
            className="rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
          >
            Transfer
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Finance ledger, transfers, and voids.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-11 w-[200px] rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
            />
          </div>
          <Select
            value={direction}
            onChange={setDirection}
            options={[
              { value: '', label: 'All directions' },
              { value: 'in', label: 'In' },
              { value: 'out', label: 'Out' },
            ]}
            className="w-[150px]"
          />
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
          {canTransfer && (
            <button
              type="button"
              onClick={() => setShowTransfer(true)}
              className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" /> Transfer
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Direction</th>
              <th className="px-5 py-4">Description</th>
              <th className="px-5 py-4 text-right">Amount</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <ArrowLeftRight className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No transactions
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(row.occurred_at)}
                  </td>
                  <td className="px-5 py-4 capitalize text-slate-700">
                    {String(row.transaction_type).replace(/_/g, ' ')}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        row.direction === 'in'
                          ? 'font-semibold text-[var(--brand-icon)]'
                          : 'font-semibold text-rose-600'
                      }
                    >
                      {row.direction}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {row.description || row.reference || '—'}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-900">
                    {formatFinanceMoney(row.amount)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {canVoid ? (
                      <RowActionsMenu
                        open={dropdownOpen === row.id}
                        onOpenChange={(open) =>
                          setDropdownOpen(open ? row.id : null)
                        }
                      >
                        <button
                          type="button"
                          onClick={async () => {
                            setDropdownOpen(null);
                            const ok = await confirmDialog({
                              title: 'Void transaction',
                              message:
                                'Void this ledger row and reverse the account balance?',
                              confirmLabel: 'Void',
                              variant: 'danger',
                            });
                            if (ok) voidMutation.mutate(row.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                        >
                          <Ban className="h-4 w-4" /> Void
                        </button>
                      </RowActionsMenu>
                    ) : (
                      '—'
                    )}
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
