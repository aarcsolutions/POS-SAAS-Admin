'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Receipt,
  Search,
  Trash2,
  Pencil,
} from 'lucide-react';
import ListPager from '@/components/ui/ListPager';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useExpensesQuery,
  useExpenseCategoriesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useCreateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
} from '@/hooks/expenses';
import { useFinanceAccountsQuery } from '@/hooks/finance-accounts';
import { useTenantBranchScope } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import {
  ExpenseCategoryRow,
  ExpensePayload,
  ExpenseRow,
  FinanceAccountRow,
} from '@/types/finance.types';
import { confirmDialog } from '@/store/dialogStore';
import { formatFinanceMoney } from '@/components/finance/FinancePeriodFilter';

const LIMIT = 10;

export default function ExpensesPage() {
  const { isTenantAdmin, showBranchFilter, branchOptions } = useTenantBranchScope();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState('');
  const [tab, setTab] = useState<'expenses' | 'categories'>('expenses');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<ExpenseRow | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [branchId, setBranchId] = useState('');

  const canCreate = usePermission(ENTITY_PERMS.expenses.create);
  const canUpdate = usePermission(ENTITY_PERMS.expenses.update);
  const canDelete = usePermission(ENTITY_PERMS.expenses.delete);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter]);

  const { data: categoriesRes } = useExpenseCategoriesQuery({
    page: 1,
    limit: 100,
  });
  const categories = extractListItems<ExpenseCategoryRow>(categoriesRes);

  const { data: accountsRes } = useFinanceAccountsQuery({
    page: 1,
    limit: 100,
    branch_id: isTenantAdmin
      ? branchFilter || branchId || undefined
      : undefined,
  });
  const accounts = extractListItems<FinanceAccountRow>(accountsRes);

  const { data, isLoading } = useExpensesQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin ? branchFilter || undefined : undefined,
  });

  const createMutation = useCreateExpenseMutation();
  const updateMutation = useUpdateExpenseMutation();
  const deleteMutation = useDeleteExpenseMutation();
  const createCatMutation = useCreateExpenseCategoryMutation();
  const deleteCatMutation = useDeleteExpenseCategoryMutation();

  const expenses = extractListItems<ExpenseRow>(data);
  const pagination = extractPagination(data, LIMIT);
  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name || id.slice(0, 8);

  if (formMode) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setFormMode(null)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Expenses
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          {formMode === 'create' ? 'Add Expense' : 'Edit Expense'}
        </h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const payload: ExpensePayload = {
              category_id: categoryId,
              amount: Number(amount),
              expense_date: expenseDate,
              finance_account_id: accountId,
              description: description || undefined,
              reference: reference || undefined,
              branch_id:
                isTenantAdmin && formMode === 'create'
                  ? branchId || undefined
                  : undefined,
            };
            if (formMode === 'create') {
              await createMutation.mutateAsync(payload);
            } else if (selected) {
              await updateMutation.mutateAsync({
                id: selected.id,
                category_id: categoryId,
                expense_date: expenseDate,
                description: description || undefined,
                reference: reference || undefined,
                amount: Number(selected.amount),
                finance_account_id: selected.finance_account_id,
              });
            }
            setFormMode(null);
          }}
          className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Category
            </label>
            <Select
              value={categoryId}
              onChange={setCategoryId}
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              placeholder="Select category"
            />
          </div>
          {formMode === 'create' && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Account
                </label>
                <Select
                  value={accountId}
                  onChange={setAccountId}
                  options={accounts.map((a) => ({
                    value: a.id,
                    label: `${a.name} (${formatFinanceMoney(a.current_balance)})`,
                  }))}
                  placeholder="Pay from account"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Amount
                </label>
                <input
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  required
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
            </>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Date
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
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
          <button
            type="submit"
            className="rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
          >
            Save
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Operating expenses and categories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setTab('expenses')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                tab === 'expenses'
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'text-slate-600'
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setTab('categories')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                tab === 'categories'
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'text-slate-600'
              }`}
            >
              Categories
            </button>
          </div>
          {tab === 'expenses' && canCreate && (
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setCategoryId('');
                setAccountId('');
                setAmount('');
                setDescription('');
                setReference('');
                setBranchId(branchFilter);
                setExpenseDate(new Date().toISOString().slice(0, 10));
                setFormMode('create');
              }}
              className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" /> Add Expense
            </button>
          )}
          {tab === 'categories' && canCreate && (
            <button
              type="button"
              onClick={() => {
                setCatName('');
                setCatDesc('');
                setShowCatForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" /> Add Category
            </button>
          )}
        </div>
      </div>

      {tab === 'expenses' && (
        <>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search expenses..."
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
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Status</th>
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
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Receipt className="mx-auto mb-2 h-8 w-8 opacity-40" />
                      No expenses
                    </td>
                  </tr>
                ) : (
                  expenses.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-slate-600">
                        {row.expense_date}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {categoryName(row.category_id)}
                      </td>
                      <td className="px-5 py-4 capitalize text-slate-600">
                        {row.status}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {row.description || row.reference || '—'}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold">
                        {formatFinanceMoney(row.amount)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <RowActionsMenu
                          open={dropdownOpen === row.id}
                          onOpenChange={(open) =>
                            setDropdownOpen(open ? row.id : null)
                          }
                        >
                          {canUpdate && row.status !== 'void' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelected(row);
                                setCategoryId(row.category_id);
                                setExpenseDate(row.expense_date);
                                setDescription(row.description || '');
                                setReference(row.reference || '');
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
                                  title: 'Delete expense',
                                  message:
                                    'Delete this expense? Recorded ledger posts will be voided.',
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
        </>
      )}

      {tab === 'categories' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {showCatForm && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createCatMutation.mutateAsync({
                  name: catName.trim(),
                  description: catDesc || undefined,
                });
                setShowCatForm(false);
              }}
              className="flex flex-wrap items-end gap-3 border-b border-slate-100 p-4"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Name
                </label>
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Description
                </label>
                <input
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                />
              </div>
              <button
                type="submit"
                className="h-10 rounded-xl bg-[var(--brand-primary)] px-4 text-sm font-bold text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowCatForm(false)}
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600"
              >
                Cancel
              </button>
            </form>
          )}
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400">
                    No categories yet
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {cat.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {cat.description || '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {canDelete && (
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = await confirmDialog({
                              title: 'Delete category',
                              message: 'Soft-delete this expense category?',
                              confirmLabel: 'Delete',
                              variant: 'danger',
                            });
                            if (ok) deleteCatMutation.mutate(cat.id);
                          }}
                          className="inline-flex items-center gap-1 text-sm text-rose-600 hover:underline"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
