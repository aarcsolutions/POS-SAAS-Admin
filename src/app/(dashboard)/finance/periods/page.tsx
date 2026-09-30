'use client';

import { useEffect, useState } from 'react';
import {
  CalendarRange,
  Loader2,
  Plus,
  Lock,
  Unlock,
  Search,
} from 'lucide-react';
import ListPager from '@/components/ui/ListPager';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useFinancePeriodsQuery,
  useCreateFinancePeriodMutation,
  useCloseFinancePeriodMutation,
  useReopenFinancePeriodMutation,
} from '@/hooks/finance-periods';
import { useTenantBranchScope } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { FinancePeriodRow } from '@/types/finance.types';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 10;

export default function PeriodsPage() {
  const { isTenantAdmin, showBranchFilter, branchOptions } = useTenantBranchScope();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [periodStart, setPeriodStart] = useState(
    new Date().toISOString().slice(0, 8) + '01'
  );
  const [periodEnd, setPeriodEnd] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');
  const [branchId, setBranchId] = useState('');

  const canCreate = usePermission(ENTITY_PERMS.finance_periods.create);
  const canClose = usePermission(ENTITY_PERMS.finance_periods.extras.close);
  const canReopen = usePermission(ENTITY_PERMS.finance_periods.extras.reopen);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter]);

  const { data, isLoading } = useFinancePeriodsQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin ? branchFilter || undefined : undefined,
  });

  const createMutation = useCreateFinancePeriodMutation();
  const closeMutation = useCloseFinancePeriodMutation();
  const reopenMutation = useReopenFinancePeriodMutation();

  const periods = extractListItems<FinancePeriodRow>(data);
  const pagination = extractPagination(data, LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance Periods</h1>
          <p className="mt-1 text-sm text-slate-500">
            Open and close accounting periods to lock historical writes.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => {
              setNotes('');
              setBranchId(branchFilter);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" /> New Period
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await createMutation.mutateAsync({
              period_start: periodStart,
              period_end: periodEnd,
              notes: notes || undefined,
              branch_id:
                isTenantAdmin && branchId ? branchId : undefined,
            });
            setShowForm(false);
          }}
          className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Start
            </label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              required
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              End
            </label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              required
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Notes
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
            />
          </div>
          {showBranchFilter && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Branch
              </label>
              <Select
                value={branchId}
                onChange={setBranchId}
                options={[
                  { value: '', label: 'Main portal (no branch)' },
                  ...branchOptions,
                ]}
                className="w-[180px]"
              />
            </div>
          )}
          <button
            type="submit"
            className="h-10 rounded-xl bg-[var(--brand-primary)] px-4 text-sm font-bold text-white"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search periods..."
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
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Notes</th>
              <th className="px-5 py-4">Closed at</th>
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
            ) : periods.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <CalendarRange className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No periods
                </td>
              </tr>
            ) : (
              periods.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium text-slate-800">
                    {row.period_start} → {row.period_end}
                  </td>
                  <td className="px-5 py-4 capitalize text-slate-600">
                    {row.status}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {row.notes || '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {row.closed_at
                      ? new Date(row.closed_at).toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RowActionsMenu
                      open={dropdownOpen === row.id}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? row.id : null)
                      }
                    >
                      {canClose && row.status === 'open' && (
                        <button
                          type="button"
                          onClick={async () => {
                            setDropdownOpen(null);
                            const ok = await confirmDialog({
                              title: 'Close period',
                              message:
                                'Close this period? Writes dated in this range will be locked.',
                              confirmLabel: 'Close',
                              variant: 'danger',
                            });
                            if (ok) closeMutation.mutate(row.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                        >
                          <Lock className="h-4 w-4" /> Close
                        </button>
                      )}
                      {canReopen && row.status === 'closed' && (
                        <button
                          type="button"
                          onClick={async () => {
                            setDropdownOpen(null);
                            const ok = await confirmDialog({
                              title: 'Reopen period',
                              message: 'Reopen this closed finance period?',
                              confirmLabel: 'Reopen',
                            });
                            if (ok) reopenMutation.mutate(row.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Unlock className="h-4 w-4" /> Reopen
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
