'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Scale,
  Search,
  Link2,
  Unlink,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import ListPager from '@/components/ui/ListPager';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useFinanceReconciliationQuery,
  useFinanceStatementQuery,
  useCreateBankStatementMutation,
  useMatchStatementLineMutation,
  useUnmatchStatementLineMutation,
  useReconcileStatementMutation,
  useReopenStatementMutation,
} from '@/hooks/finance-reconciliation';
import { useFinanceAccountsQuery } from '@/hooks/finance-accounts';
import { useTenantBranchScope } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import {
  BankStatementLinePayload,
  BankStatementLineRow,
  BankStatementRow,
  FinanceAccountRow,
} from '@/types/finance.types';
import { confirmDialog } from '@/store/dialogStore';
import { formatFinanceMoney } from '@/components/finance/FinancePeriodFilter';

const LIMIT = 10;

const emptyLine = (): BankStatementLinePayload => ({
  line_date: new Date().toISOString().slice(0, 10),
  amount: 0,
  description: '',
});

export default function ReconciliationPage() {
  const { isTenantAdmin, showBranchFilter, branchOptions } = useTenantBranchScope();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [formMode, setFormMode] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [matchLineId, setMatchLineId] = useState<string | null>(null);
  const [txId, setTxId] = useState('');

  const [accountId, setAccountId] = useState('');
  const [periodStart, setPeriodStart] = useState(
    new Date().toISOString().slice(0, 8) + '01'
  );
  const [periodEnd, setPeriodEnd] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [sourceLabel, setSourceLabel] = useState('');
  const [branchId, setBranchId] = useState('');
  const [lines, setLines] = useState<BankStatementLinePayload[]>([
    emptyLine(),
    emptyLine(),
  ]);

  const canCreate = usePermission(ENTITY_PERMS.finance_reconciliation.create);
  const canMatch = usePermission(
    ENTITY_PERMS.finance_reconciliation.extras.match
  );
  const canUnmatch = usePermission(
    ENTITY_PERMS.finance_reconciliation.extras.unmatch
  );
  const canReconcile = usePermission(
    ENTITY_PERMS.finance_reconciliation.extras.reconcile
  );
  const canReopen = usePermission(
    ENTITY_PERMS.finance_reconciliation.extras.reopen
  );

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter]);

  const { data: accountsRes } = useFinanceAccountsQuery({
    page: 1,
    limit: 100,
    branch_id: isTenantAdmin
      ? branchFilter || branchId || undefined
      : undefined,
  });
  const accounts = extractListItems<FinanceAccountRow>(accountsRes).filter(
    (a) => a.type === 'bank'
  );

  const { data, isLoading } = useFinanceReconciliationQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin ? branchFilter || undefined : undefined,
  });

  const { data: detailRes, isLoading: detailLoading } =
    useFinanceStatementQuery(detailId);
  const detail = (detailRes?.data || null) as BankStatementRow | null;

  const createMutation = useCreateBankStatementMutation();
  const matchMutation = useMatchStatementLineMutation();
  const unmatchMutation = useUnmatchStatementLineMutation();
  const reconcileMutation = useReconcileStatementMutation();
  const reopenMutation = useReopenStatementMutation();

  const statements = extractListItems<BankStatementRow>(data);
  const pagination = extractPagination(data, LIMIT);
  const accountName = (id: string) =>
    accounts.find((a) => a.id === id)?.name || id.slice(0, 8);

  if (formMode) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setFormMode(false)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Reconciliation
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          New Bank Statement
        </h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const validLines = lines.filter(
              (l) => l.line_date && Number(l.amount) !== 0
            );
            if (validLines.length === 0) return;
            await createMutation.mutateAsync({
              finance_account_id: accountId,
              period_start: periodStart,
              period_end: periodEnd,
              source_label: sourceLabel || undefined,
              branch_id:
                isTenantAdmin && branchId ? branchId : undefined,
              lines: validLines.map((l) => ({
                line_date: l.line_date,
                amount: Number(l.amount),
                description: l.description || undefined,
              })),
            });
            setFormMode(false);
          }}
          className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Bank account
            </label>
            <Select
              value={accountId}
              onChange={setAccountId}
              options={accounts.map((a) => ({
                value: a.id,
                label: `${a.name} (${formatFinanceMoney(a.current_balance)})`,
              }))}
              placeholder="Select bank account"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Period start
              </label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Period end
              </label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Source label
            </label>
            <input
              value={sourceLabel}
              onChange={(e) => setSourceLabel(e.target.value)}
              placeholder="e.g. September CSV export"
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
            />
          </div>
          {showBranchFilter && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Branch (optional)
              </label>
              <Select
                value={branchId}
                onChange={setBranchId}
                options={[
                  { value: '', label: 'Main portal (no branch)' },
                  ...branchOptions,
                ]}
                placeholder="Main portal (no branch)"
              />
            </div>
          )}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Statement lines
              </label>
              <button
                type="button"
                onClick={() => setLines((prev) => [...prev, emptyLine()])}
                className="text-sm font-semibold text-[var(--brand-primary)]"
              >
                + Add line
              </button>
            </div>
            {lines.map((line, idx) => (
              <div
                key={idx}
                className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:grid-cols-3"
              >
                <input
                  type="date"
                  value={line.line_date}
                  onChange={(e) => {
                    const next = [...lines];
                    next[idx] = { ...next[idx], line_date: e.target.value };
                    setLines(next);
                  }}
                  className="h-10 rounded-lg border border-slate-200 px-2 text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  value={line.amount || ''}
                  onChange={(e) => {
                    const next = [...lines];
                    next[idx] = {
                      ...next[idx],
                      amount:
                        e.target.value === '' ? 0 : Number(e.target.value),
                    };
                    setLines(next);
                  }}
                  placeholder="Amount (+ credit / − debit)"
                  className="h-10 rounded-lg border border-slate-200 px-2 text-sm"
                />
                <input
                  value={line.description || ''}
                  onChange={(e) => {
                    const next = [...lines];
                    next[idx] = {
                      ...next[idx],
                      description: e.target.value,
                    };
                    setLines(next);
                  }}
                  placeholder="Description"
                  className="h-10 rounded-lg border border-slate-200 px-2 text-sm"
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={!accountId || createMutation.isPending}
            className="rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            Create Statement
          </button>
        </form>
      </div>
    );
  }

  if (detailId) {
    const statementLines = (detail?.lines ||
      []) as BankStatementLineRow[];
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => {
            setDetailId(null);
            setMatchLineId(null);
            setTxId('');
          }}
          className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Reconciliation
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Statement Detail
            </h1>
            {detail && (
              <p className="mt-1 text-sm text-slate-500">
                {detail.period_start} → {detail.period_end} ·{' '}
                <span className="capitalize">{detail.status}</span>
                {detail.source_label ? ` · ${detail.source_label}` : ''}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {detail &&
              canReconcile &&
              detail.status !== 'reconciled' && (
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await confirmDialog({
                      title: 'Reconcile statement',
                      message:
                        'Mark this statement reconciled? All non-ignored lines must be matched.',
                      confirmLabel: 'Reconcile',
                    });
                    if (ok) reconcileMutation.mutate(detail.id);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <CheckCircle2 className="h-4 w-4" /> Reconcile
                </button>
              )}
            {detail && canReopen && detail.status === 'reconciled' && (
              <button
                type="button"
                onClick={async () => {
                  const ok = await confirmDialog({
                    title: 'Reopen statement',
                    message: 'Reopen this reconciled statement?',
                    confirmLabel: 'Reopen',
                  });
                  if (ok) reopenMutation.mutate(detail.id);
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                <RotateCcw className="h-4 w-4" /> Reopen
              </button>
            )}
          </div>
        </div>

        {matchLineId && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await matchMutation.mutateAsync({
                line_id: matchLineId,
                finance_transaction_id: txId.trim(),
              });
              setMatchLineId(null);
              setTxId('');
            }}
            className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="min-w-[280px] flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Finance transaction ID
              </label>
              <input
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                required
                placeholder="UUID of ledger transaction"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
              />
            </div>
            <button
              type="submit"
              className="h-10 rounded-xl bg-[var(--brand-primary)] px-4 text-sm font-bold text-white"
            >
              Match
            </button>
            <button
              type="button"
              onClick={() => {
                setMatchLineId(null);
                setTxId('');
              }}
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {detailLoading || !detail ? (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {statementLines.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-slate-400"
                    >
                      No lines
                    </td>
                  </tr>
                ) : (
                  statementLines.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-slate-600">
                        {line.line_date}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {line.description || '—'}
                        {line.matched_finance_transaction_id && (
                          <span className="mt-0.5 block font-mono text-xs text-slate-400">
                            tx {line.matched_finance_transaction_id.slice(0, 8)}
                            …
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 capitalize text-slate-600">
                        {line.status}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold">
                        {formatFinanceMoney(line.amount)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {detail.status !== 'reconciled' && (
                          <div className="flex justify-end gap-2">
                            {canMatch && line.status !== 'matched' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMatchLineId(line.id);
                                  setTxId('');
                                }}
                                className="inline-flex items-center gap-1 text-sm text-[var(--brand-primary)] hover:underline"
                              >
                                <Link2 className="h-4 w-4" /> Match
                              </button>
                            )}
                            {canUnmatch && line.status === 'matched' && (
                              <button
                                type="button"
                                onClick={() =>
                                  unmatchMutation.mutate(line.id)
                                }
                                className="inline-flex items-center gap-1 text-sm text-rose-600 hover:underline"
                              >
                                <Unlink className="h-4 w-4" /> Unmatch
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bank Reconciliation
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Import statement lines and match them to ledger transactions.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => {
              setAccountId('');
              setSourceLabel('');
              setBranchId(branchFilter);
              setLines([emptyLine(), emptyLine()]);
              setFormMode(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" /> New Statement
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search statements..."
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
              <th className="px-5 py-4">Period</th>
              <th className="px-5 py-4">Account</th>
              <th className="px-5 py-4">Source</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                </td>
              </tr>
            ) : statements.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <Scale className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No statements
                </td>
              </tr>
            ) : (
              statements.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-slate-600">
                    {row.period_start} → {row.period_end}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-800">
                    {accountName(row.finance_account_id)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {row.source_label || '—'}
                  </td>
                  <td className="px-5 py-4 capitalize text-slate-600">
                    {row.status}
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
                        Open
                      </button>
                      {canReconcile && row.status !== 'reconciled' && (
                        <button
                          type="button"
                          onClick={async () => {
                            setDropdownOpen(null);
                            const ok = await confirmDialog({
                              title: 'Reconcile statement',
                              message:
                                'Mark this statement reconciled? All non-ignored lines must be matched.',
                              confirmLabel: 'Reconcile',
                            });
                            if (ok) reconcileMutation.mutate(row.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Reconcile
                        </button>
                      )}
                      {canReopen && row.status === 'reconciled' && (
                        <button
                          type="button"
                          onClick={async () => {
                            setDropdownOpen(null);
                            const ok = await confirmDialog({
                              title: 'Reopen statement',
                              message: 'Reopen this reconciled statement?',
                              confirmLabel: 'Reopen',
                            });
                            if (ok) reopenMutation.mutate(row.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <RotateCcw className="h-4 w-4" /> Reopen
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
