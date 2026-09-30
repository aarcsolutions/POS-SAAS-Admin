'use client';

import { useEffect, useState } from 'react'
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Loader2,
  Eye,
  Banknote,
  Clock,
} from 'lucide-react';
import ListPager from '@/components/ui/ListPager';
import { Select } from '@/components/ui/Select';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import { usePaymentsQuery, usePaymentDetailQuery } from '@/hooks/payments';
import { useTenantBranchScope } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination, formatDate } from '@/utils/helpers';
import { PaymentListItem, PaymentTab } from '@/types/payment.types';

const LIMIT = 10;

const TAB_OPTIONS: { value: PaymentTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'collected', label: 'Collected' },
  { value: 'pending_cod', label: 'Pending COD' },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function statusBadge(status: string, source: PaymentListItem['source']) {
  if (source === 'pending_cod') {
    return 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]';
  }
  switch (status) {
    case 'completed':
      return 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]';
    case 'pending':
      return 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]';
    case 'failed':
      return 'bg-rose-100 text-rose-700';
    case 'refunded':
      return 'bg-slate-200 text-slate-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function statusLabel(row: PaymentListItem) {
  if (row.source === 'pending_cod') return 'Pending COD';
  return row.status.replace(/_/g, ' ');
}

export default function PaymentsPage() {
  const { isTenantAdmin, showBranchFilter, branchOptions } = useTenantBranchScope();

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [tab, setTab] = useState<PaymentTab>('collected');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter, tab]);

  const { data, isLoading, isFetching, isError, refetch } = usePaymentsQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    tab,
    branch_id: isTenantAdmin && branchFilter ? branchFilter : undefined,
  });

  const detailQuery = usePaymentDetailQuery(
    selectedId && selectedId !== 'pending' ? selectedId : null
  );

  const payments = extractListItems<PaymentListItem>(data, 'payments');
  const pagination = extractPagination(data, LIMIT);
  const colSpan = showBranchFilter ? 8 : 7;

  const selectedRow = payments.find((p) => p.id === selectedId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Payments
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Order payments and pending cash-on-delivery collections
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TAB_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTab(opt.value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === opt.value
                ? 'bg-[var(--brand-primary)] text-white shadow-md shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)]'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order #, customer, or transaction no..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
          />
        </div>
        {showBranchFilter && (
          <div className="w-full sm:w-56">
            <Select
              value={branchFilter}
              onChange={setBranchFilter}
              variant="filter"
              size="lg"
              allowEmpty
              placeholder="All branches"
              aria-label="Filter by branch"
              options={[
                { value: 'tenant', label: 'Tenant-level' },
                ...branchOptions,
              ]}
            />
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Order #</th>
              <th className="px-5 py-3 font-bold">Customer</th>
              <th className="px-5 py-3 font-bold">Method</th>
              <th className="px-5 py-3 font-bold">Amount</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold">Date</th>
              {showBranchFilter && (
                <th className="px-5 py-3 font-bold">Branch</th>
              )}
              <th className="px-5 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isError ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center">
                  <div className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    Failed to load payments. The server may be busy — please try
                    again.
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="ml-2 font-semibold underline hover:text-rose-900"
                    >
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            ) : isLoading || isFetching ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-slate-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-slate-400">
                  <CreditCard className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((row) => (
                <tr key={`${row.source}-${row.id}`} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {row.order_number || row.order_id.slice(0, 8)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {row.customer_name || '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 capitalize text-slate-700">
                      {row.method === 'cod' ? (
                        <Clock className="h-3.5 w-3.5 text-[var(--brand-icon)]" />
                      ) : (
                        <Banknote className="h-3.5 w-3.5 text-[var(--brand-icon)]" />
                      )}
                      {row.method}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {formatMoney(row.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusBadge(row.status, row.source)}`}
                    >
                      {statusLabel(row)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(row.created_at)}
                  </td>
                  {showBranchFilter && (
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-[var(--brand-primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                        {row.branch_name || 'Branch'}
                      </span>
                    </td>
                  )}
                  <td className="px-5 py-4 text-right">
                    <RowActionsMenu
                      open={dropdownOpen === row.id}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? row.id : null)
                      }
                    >
                      {row.source === 'payment' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(row.id);
                            setDropdownOpen(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" /> View payment
                        </button>
                      ) : null}
                      <Link
                        href="/orders"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setDropdownOpen(null)}
                      >
                        <Eye className="h-4 w-4" /> Open orders
                      </Link>
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
        label="payments"
        disabled={isLoading || isFetching}
      />

      {selectedId && selectedRow?.source === 'payment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Payment Details
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedRow.order_number || selectedRow.order_id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            {detailQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-primary)]" />
              </div>
            ) : (
              <dl className="grid gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Customer</dt>
                  <dd className="font-medium text-slate-800">
                    {detailQuery.data?.data?.customer_name || '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Method</dt>
                  <dd className="font-medium capitalize text-slate-800">
                    {detailQuery.data?.data?.method}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Amount</dt>
                  <dd className="font-semibold text-slate-900">
                    {formatMoney(Number(detailQuery.data?.data?.amount || 0))}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="font-medium capitalize text-slate-800">
                    {detailQuery.data?.data?.status}
                  </dd>
                </div>
                {detailQuery.data?.data?.transaction_no && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Transaction #</dt>
                    <dd className="font-medium text-slate-800">
                      {detailQuery.data.data.transaction_no}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Date</dt>
                  <dd className="font-medium text-slate-800">
                    {detailQuery.data?.data?.created_at
                      ? formatDate(detailQuery.data.data.created_at)
                      : '—'}
                  </dd>
                </div>
              </dl>
            )}

            <div className="mt-6 flex justify-end">
              <Link
                href="/orders"
                className="rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-sm font-bold text-white hover:brightness-95"
                onClick={() => setSelectedId(null)}
              >
                Collect on Orders page
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
