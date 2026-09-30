'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  Loader2,
  Landmark,
  RefreshCw,
} from 'lucide-react';
import ListPager from '@/components/ui/ListPager';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useFinanceAccountsQuery,
  useCreateFinanceAccountMutation,
  useUpdateFinanceAccountMutation,
  useDeleteFinanceAccountMutation,
  useRecalculateBalanceMutation,
} from '@/hooks/finance-accounts';
import { useTenantBranchScope } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import {
  FinanceAccountPayload,
  FinanceAccountRow,
  FinanceAccountType,
} from '@/types/finance.types';
import { confirmDialog } from '@/store/dialogStore';
import { formatFinanceMoney } from '@/components/finance/FinancePeriodFilter';

const LIMIT = 10;
const TYPE_OPTIONS: { value: FinanceAccountType; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'other', label: 'Other' },
];

function AccountForm({
  mode,
  initial,
  saving,
  showBranchFilter,
  branchOptions,
  onClose,
  onSubmit,
}: {
  mode: 'create' | 'edit' | 'view';
  initial: FinanceAccountRow | null;
  saving: boolean;
  showBranchFilter: boolean;
  branchOptions: { value: string; label: string }[];
  onClose: () => void;
  onSubmit: (payload: FinanceAccountPayload) => Promise<void>;
}) {
  const isReadOnly = mode === 'view';
  const [name, setName] = useState(initial?.name || '');
  const [type, setType] = useState<FinanceAccountType>(
    (initial?.type as FinanceAccountType) || 'cash'
  );
  const [currency, setCurrency] = useState(initial?.currency || 'PKR');
  const [opening, setOpening] = useState<number | ''>(
    initial ? Number(initial.opening_balance) : 0
  );
  const [defaultMethod, setDefaultMethod] = useState(
    initial?.is_default_for_method || ''
  );
  const [branchId, setBranchId] = useState(initial?.branch_id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    await onSubmit({
      name: name.trim(),
      type,
      currency: currency.trim() || 'PKR',
      opening_balance: Number(opening || 0),
      is_default_for_method: defaultMethod || null,
      branch_id: showBranchFilter && mode === 'create' ? branchId || undefined : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Accounts
      </button>
      <h1 className="text-2xl font-bold text-slate-900">
        {mode === 'create' ? 'Add Account' : mode === 'edit' ? 'Edit Account' : 'Account Details'}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
          <input
            value={name}
            disabled={isReadOnly}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
          <Select
            value={type}
            onChange={(v) => setType(v as FinanceAccountType)}
            options={TYPE_OPTIONS}
            disabled={isReadOnly}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Currency</label>
          <input
            value={currency}
            disabled={isReadOnly}
            onChange={(e) => setCurrency(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Opening balance
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={opening}
            disabled={isReadOnly || mode === 'edit'}
            onChange={(e) =>
              setOpening(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
          />
          {mode === 'edit' && (
            <p className="mt-1 text-xs text-slate-500">
              Opening balance is editable only when the account has no ledger rows (use API).
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Default for method
          </label>
          <Select
            value={defaultMethod}
            onChange={setDefaultMethod}
            options={[
              { value: '', label: 'None' },
              { value: 'cash', label: 'Cash' },
              { value: 'card', label: 'Card' },
              { value: 'wallet', label: 'Wallet' },
            ]}
            disabled={isReadOnly}
          />
        </div>
        {showBranchFilter && mode === 'create' && (
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
            <p className="mt-1 text-xs text-slate-500">
              Leave empty so this account belongs to the main portal
            </p>
          </div>
        )}
        {!isReadOnly && (
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
        )}
      </form>
    </div>
  );
}

export default function FinanceAccountsPage() {
  const { isTenantAdmin, showBranchFilter, branchOptions } = useTenantBranchScope();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<FinanceAccountRow | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.finance_accounts.create);
  const canUpdate = usePermission(ENTITY_PERMS.finance_accounts.update);
  const canDelete = usePermission(ENTITY_PERMS.finance_accounts.delete);
  const canRecalc = usePermission(
    ENTITY_PERMS.finance_accounts.extras.recalculateBalance
  );

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter]);

  const { data, isLoading } = useFinanceAccountsQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin ? branchFilter || undefined : undefined,
  });
  const createMutation = useCreateFinanceAccountMutation();
  const updateMutation = useUpdateFinanceAccountMutation();
  const deleteMutation = useDeleteFinanceAccountMutation();
  const recalcMutation = useRecalculateBalanceMutation();

  const accounts = extractListItems<FinanceAccountRow>(data);
  const pagination = extractPagination(data, LIMIT);

  if (formMode) {
    return (
      <AccountForm
        mode={formMode}
        initial={selected}
        saving={createMutation.isPending || updateMutation.isPending}
        showBranchFilter={showBranchFilter}
        branchOptions={branchOptions}
        onClose={() => setFormMode(null)}
        onSubmit={async (payload) => {
          if (formMode === 'create') {
            await createMutation.mutateAsync(payload);
          } else if (formMode === 'edit' && selected) {
            await updateMutation.mutateAsync({ id: selected.id, ...payload });
          }
          setFormMode(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cash, bank, and wallet accounts. Main Cash is seeded on first load per branch.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accounts..."
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
              placeholder="Branch"
              className="w-[180px]"
            />
          )}
          {canCreate && (
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setFormMode('create');
              }}
              className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" /> Add Account
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Currency</th>
              <th className="px-5 py-4 text-right">Balance</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <Landmark className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No accounts found
                </td>
              </tr>
            ) : (
              accounts.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {row.name}
                    {row.is_default_for_method && (
                      <span className="ml-2 rounded-full bg-[var(--brand-primary-soft)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--brand-primary)]">
                        {row.is_default_for_method}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 capitalize text-slate-600">{row.type}</td>
                  <td className="px-5 py-4 text-slate-600">{row.currency}</td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-900">
                    {formatFinanceMoney(row.current_balance)}
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
                          setSelected(row);
                          setFormMode('view');
                          setDropdownOpen(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(row);
                            setFormMode('edit');
                            setDropdownOpen(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      )}
                      {canRecalc && (
                        <button
                          type="button"
                          onClick={() => {
                            recalcMutation.mutate(row.id);
                            setDropdownOpen(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <RefreshCw className="h-4 w-4" /> Recalculate
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={async () => {
                            setDropdownOpen(null);
                            const ok = await confirmDialog({
                              title: 'Delete account',
                              message:
                                'Soft-delete this account? Accounts with ledger rows cannot be deleted.',
                              confirmLabel: 'Delete',
                              variant: 'danger',
                            });
                            if (ok) deleteMutation.mutate(row.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
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
