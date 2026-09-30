'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  HandCoins,
  Loader2,
  Search,
  Ban,
  Eye,
} from 'lucide-react';
import ListPager from '@/components/ui/ListPager';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useFinancePayablesQuery,
  useFinancePayableQuery,
  usePayPayableMutation,
  useVoidPayablePaymentMutation,
} from '@/hooks/finance-payables';
import { useFinanceAccountsQuery } from '@/hooks/finance-accounts';
import { useTenantBranchScope } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import {
  FinanceAccountRow,
  SupplierPayableRow,
  SupplierPaymentRow,
} from '@/types/finance.types';
import { confirmDialog } from '@/store/dialogStore';
import { formatFinanceMoney } from '@/components/finance/FinancePeriodFilter';

const LIMIT = 10;

export default function PayablesPage() {
  const { isTenantAdmin, showBranchFilter, branchOptions } = useTenantBranchScope();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [payTarget, setPayTarget] = useState<SupplierPayableRow | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const canPay = usePermission(ENTITY_PERMS.finance_payables.extras.pay);
  const canVoid = usePermission(
    ENTITY_PERMS.finance_payables.extras.voidPayment
  );

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter]);

  const { data: accountsRes } = useFinanceAccountsQuery({
    page: 1,
    limit: 100,
    branch_id: isTenantAdmin ? branchFilter || undefined : undefined,
  });
  const accounts = extractListItems<FinanceAccountRow>(accountsRes);

  const { data, isLoading } = useFinancePayablesQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin ? branchFilter || undefined : undefined,
  });

  const { data: detailRes, isLoading: detailLoading } = useFinancePayableQuery(
    detailId
  );
  const detail = (detailRes?.data || null) as
    | (SupplierPayableRow & { payments?: SupplierPaymentRow[] })
    | null;

  const payMutation = usePayPayableMutation();
  const voidMutation = useVoidPayablePaymentMutation();

  const payables = extractListItems<SupplierPayableRow>(data);
  const pagination = extractPagination(data, LIMIT);

  const canPayRow = (row: SupplierPayableRow) =>
    canPay &&
    row.status !== 'void' &&
    row.status !== 'paid' &&
    Number(row.balance) > 0;

  if (detailId) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setDetailId(null)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Payables
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Payable Detail</h1>
        {detailLoading || !detail ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-slate-500">Status</p>
                  <p className="font-semibold capitalize text-slate-900">
                    {detail.status}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Original</p>
                  <p className="font-semibold">
                    {formatFinanceMoney(detail.original_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Balance</p>
                  <p className="font-semibold">
                    {formatFinanceMoney(detail.balance)}
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Paid at</th>
                    <th className="px-5 py-4">Reference</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Amount</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(detail.payments || []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-10 text-center text-slate-400"
                      >
                        No payments yet
                      </td>
                    </tr>
                  ) : (
                    (detail.payments || []).map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 text-slate-600">
                          {payment.paid_at
                            ? new Date(payment.paid_at).toLocaleString()
                            : '—'}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {payment.reference || payment.notes || '—'}
                        </td>
                        <td className="px-5 py-4 capitalize text-slate-600">
                          {payment.status}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold">
                          {formatFinanceMoney(payment.amount)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {canVoid &&
                            payment.status !== 'void' &&
                            payment.is_active !== false && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const ok = await confirmDialog({
                                    title: 'Void payment',
                                    message:
                                      'Void this supplier payment and reverse the ledger entry?',
                                    confirmLabel: 'Void',
                                    variant: 'danger',
                                  });
                                  if (ok) voidMutation.mutate(payment.id);
                                }}
                                className="inline-flex items-center gap-1 text-sm text-rose-600 hover:underline"
                              >
                                <Ban className="h-4 w-4" /> Void
                              </button>
                            )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (payTarget) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setPayTarget(null)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Payables
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Pay Payable</h1>
        <p className="text-sm text-slate-500">
          Balance due: {formatFinanceMoney(payTarget.balance)}
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await payMutation.mutateAsync({
              payable_id: payTarget.id,
              finance_account_id: accountId,
              amount: Number(amount),
              reference: reference || undefined,
              notes: notes || undefined,
            });
            setPayTarget(null);
          }}
          className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Pay from account
            </label>
            <Select
              value={accountId}
              onChange={setAccountId}
              options={accounts.map((a) => ({
                value: a.id,
                label: `${a.name} (${formatFinanceMoney(a.current_balance)})`,
              }))}
              placeholder="Select account"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Amount
            </label>
            <input
              type="number"
              min={0.01}
              max={Number(payTarget.balance)}
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
              Reference
            </label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Notes
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
            />
          </div>
          <button
            type="submit"
            disabled={!accountId || !amount || payMutation.isPending}
            className="rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {payMutation.isPending ? 'Paying…' : 'Record Payment'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payables</h1>
        <p className="mt-1 text-sm text-slate-500">
          Supplier accounts payable from purchase receives.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payables..."
            className="h-11 w-[220px] rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
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
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Original</th>
              <th className="px-5 py-4 text-right">Paid</th>
              <th className="px-5 py-4 text-right">Balance</th>
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
            ) : payables.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <HandCoins className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No payables
                </td>
              </tr>
            ) : (
              payables.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-slate-600">
                    {row.payable_date}
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
                  <td className="px-5 py-4 text-right">
                    <RowActionsMenu
                      open={dropdownOpen === row.id}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? row.id : null)
                      }
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setDetailId(row.id);
                          setDropdownOpen(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" /> View payments
                      </button>
                      {canPayRow(row) && (
                        <button
                          type="button"
                          onClick={() => {
                            setPayTarget(row);
                            setAccountId('');
                            setAmount(Number(row.balance));
                            setReference('');
                            setNotes('');
                            setDropdownOpen(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <HandCoins className="h-4 w-4" /> Pay
                        </button>
                      )}
                    </RowActionsMenu>
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
