'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  DoorOpen,
  DoorClosed,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react';
import ListPager from '@/components/ui/ListPager';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useCashRegistersQuery,
  useCreateCashRegisterMutation,
  useUpdateCashRegisterMutation,
  useDeleteCashRegisterMutation,
  useOpenShiftMutation,
  useCloseShiftMutation,
  useCashDropMutation,
  useCashAddMutation,
} from '@/hooks/cash-registers';
import { useFinanceAccountsQuery } from '@/hooks/finance-accounts';
import { useTenantBranchScope } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import {
  CashRegisterPayload,
  CashRegisterRow,
  FinanceAccountRow,
} from '@/types/finance.types';
import { confirmDialog } from '@/store/dialogStore';
import { formatFinanceMoney } from '@/components/finance/FinancePeriodFilter';

const LIMIT = 10;

type ShiftAction = 'open' | 'close' | 'drop' | 'add' | null;

export default function CashRegistersPage() {
  const { isTenantAdmin, showBranchFilter, branchOptions } = useTenantBranchScope();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<CashRegisterRow | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [shiftAction, setShiftAction] = useState<ShiftAction>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [branchId, setBranchId] = useState('');

  const canCreate = usePermission(ENTITY_PERMS.cash_registers.create);
  const canUpdate = usePermission(ENTITY_PERMS.cash_registers.update);
  const canDelete = usePermission(ENTITY_PERMS.cash_registers.delete);
  const canOpen = usePermission(ENTITY_PERMS.cash_registers.extras.openShift);
  const canClose = usePermission(ENTITY_PERMS.cash_registers.extras.closeShift);
  const canDrop = usePermission(ENTITY_PERMS.cash_registers.extras.cashDrop);
  const canAdd = usePermission(ENTITY_PERMS.cash_registers.extras.cashAdd);

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
  const cashAccounts = extractListItems<FinanceAccountRow>(accountsRes).filter(
    (a) => a.type === 'cash'
  );

  const { data, isLoading } = useCashRegistersQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin ? branchFilter || undefined : undefined,
  });

  const createMutation = useCreateCashRegisterMutation();
  const updateMutation = useUpdateCashRegisterMutation();
  const deleteMutation = useDeleteCashRegisterMutation();
  const openMutation = useOpenShiftMutation();
  const closeMutation = useCloseShiftMutation();
  const dropMutation = useCashDropMutation();
  const addMutation = useCashAddMutation();

  const registers = extractListItems<CashRegisterRow>(data);
  const pagination = extractPagination(data, LIMIT);

  const resetShift = () => {
    setShiftAction(null);
    setSelected(null);
    setAmount('');
    setDescription('');
  };

  const submitShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || amount === '') return;
    if (shiftAction === 'open') {
      await openMutation.mutateAsync({
        register_id: selected.id,
        opening_cash: Number(amount),
      });
    } else if (shiftAction === 'close' && selected.open_shift) {
      await closeMutation.mutateAsync({
        shift_id: selected.open_shift.id,
        actual_cash: Number(amount),
      });
    } else if (shiftAction === 'drop' && selected.open_shift) {
      await dropMutation.mutateAsync({
        shift_id: selected.open_shift.id,
        amount: Number(amount),
        description: description || undefined,
      });
    } else if (shiftAction === 'add' && selected.open_shift) {
      await addMutation.mutateAsync({
        shift_id: selected.open_shift.id,
        amount: Number(amount),
        description: description || undefined,
      });
    }
    resetShift();
  };

  if (formMode) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setFormMode(null)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Registers
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          {formMode === 'create' ? 'Add Cash Register' : 'Edit Cash Register'}
        </h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const payload: CashRegisterPayload = {
              name: name.trim(),
              finance_account_id: accountId,
              branch_id:
                isTenantAdmin && formMode === 'create'
                  ? branchId || undefined
                  : undefined,
            };
            if (formMode === 'create') {
              await createMutation.mutateAsync(payload);
            } else if (selected) {
              await updateMutation.mutateAsync({ id: selected.id, ...payload });
            }
            setFormMode(null);
          }}
          className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Cash account
            </label>
            <Select
              value={accountId}
              onChange={setAccountId}
              options={cashAccounts.map((a) => ({
                value: a.id,
                label: `${a.name} (${formatFinanceMoney(a.current_balance)})`,
              }))}
              placeholder="Select cash account"
            />
          </div>
          {showBranchFilter && formMode === 'create' && (
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
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
          >
            Save
          </button>
        </form>
      </div>
    );
  }

  if (shiftAction && selected) {
    const titles: Record<string, string> = {
      open: 'Open Shift',
      close: 'Close Shift',
      drop: 'Cash Drop',
      add: 'Cash Add',
    };
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={resetShift}
          className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          {titles[shiftAction]} — {selected.name}
        </h1>
        <form
          onSubmit={submitShift}
          className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {shiftAction === 'open'
                ? 'Opening cash'
                : shiftAction === 'close'
                  ? 'Actual cash counted'
                  : 'Amount'}
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value === '' ? '' : Number(e.target.value))
              }
              required
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
            />
          </div>
          {(shiftAction === 'drop' || shiftAction === 'add') && (
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
          )}
          <button
            type="submit"
            className="rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
          >
            Confirm
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash Registers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registers, shifts, cash drops and adds.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search registers..."
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
          {canCreate && (
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setName('');
                setAccountId('');
                setBranchId(branchFilter);
                setFormMode('create');
              }}
              className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" /> Add Register
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Shift</th>
              <th className="px-5 py-4 text-right">Opening</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                </td>
              </tr>
            ) : registers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  <Banknote className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No cash registers
                </td>
              </tr>
            ) : (
              registers.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {row.name}
                  </td>
                  <td className="px-5 py-4">
                    {row.open_shift ? (
                      <span className="rounded-full bg-[var(--brand-icon-soft)] px-2.5 py-1 text-xs font-bold text-[var(--brand-icon)]">
                        Open
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                        Closed
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-slate-800">
                    {row.open_shift
                      ? formatFinanceMoney(row.open_shift.opening_cash)
                      : '—'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RowActionsMenu
                      open={dropdownOpen === row.id}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? row.id : null)
                      }
                    >
                      {canOpen && !row.open_shift && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(row);
                            setShiftAction('open');
                            setAmount('');
                            setDropdownOpen(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <DoorOpen className="h-4 w-4" /> Open shift
                        </button>
                      )}
                      {canClose && row.open_shift && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(row);
                            setShiftAction('close');
                            setAmount('');
                            setDropdownOpen(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <DoorClosed className="h-4 w-4" /> Close shift
                        </button>
                      )}
                      {canDrop && row.open_shift && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(row);
                            setShiftAction('drop');
                            setAmount('');
                            setDropdownOpen(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <ArrowDownToLine className="h-4 w-4" /> Cash drop
                        </button>
                      )}
                      {canAdd && row.open_shift && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(row);
                            setShiftAction('add');
                            setAmount('');
                            setDropdownOpen(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <ArrowUpFromLine className="h-4 w-4" /> Cash add
                        </button>
                      )}
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(row);
                            setName(row.name);
                            setAccountId(row.finance_account_id);
                            setFormMode('edit');
                            setDropdownOpen(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={async () => {
                            setDropdownOpen(null);
                            const ok = await confirmDialog({
                              title: 'Delete register',
                              message:
                                'Soft-delete this register? Open shifts must be closed first.',
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
