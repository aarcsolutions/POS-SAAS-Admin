'use client';

import { useEffect, useState } from 'react';
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  Loader2,
  Receipt,
} from 'lucide-react';
import TaxForm from '@/components/taxes/TaxForm';
import ListPager from '@/components/ui/ListPager';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useTaxesQuery,
  useCreateTaxMutation,
  useUpdateTaxMutation,
  useDeleteTaxMutation,
} from '@/hooks/taxes';
import { useTenantBranchScope } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { TaxRow } from '@/types/tax.types';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 10;

export default function TaxesPage() {
  const { isTenantAdmin, showBranchFilter, branchOptions } = useTenantBranchScope();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selected, setSelected] = useState<TaxRow | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.taxes.create);
  const canUpdate = usePermission(ENTITY_PERMS.taxes.update);
  const canDelete = usePermission(ENTITY_PERMS.taxes.delete);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter]);

  const { data, isLoading } = useTaxesQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin
      ? branchFilter || undefined
      : undefined,
  });
  const createMutation = useCreateTaxMutation();
  const updateMutation = useUpdateTaxMutation();
  const deleteMutation = useDeleteTaxMutation();

  const taxes = extractListItems<TaxRow>(data, 'taxes');
  const pagination = extractPagination(data, LIMIT);

  const handleOpen = (
    mode: 'create' | 'edit' | 'view',
    tax?: TaxRow
  ) => {
    setFormMode(mode);
    setSelected(tax || null);
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({
      title: 'Delete tax',
      message: 'Soft-delete this tax? Existing orders keep their tax snapshot.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  if (formMode) {
    return (
      <TaxForm
        mode={formMode}
        initial={selected}
        saving={createMutation.isPending || updateMutation.isPending}
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
          <h1 className="text-2xl font-bold text-slate-900">Taxes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage percentage and flat taxes used on orders.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search taxes..."
              className="h-11 w-[220px] rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
            />
          </div>
          {showBranchFilter && (
            <Select
              value={branchFilter}
              onChange={setBranchFilter}
              options={[
                { value: '', label: 'All branches' },
                { value: 'tenant', label: 'Tenant level' },
                ...branchOptions,
              ]}
              placeholder="Branch"
              className="w-[180px]"
            />
          )}
          {canCreate && (
            <button
              type="button"
              onClick={() => handleOpen('create')}
              className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95"
            >
              <Plus className="h-4 w-4" /> Add Tax
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
              <th className="px-5 py-4">Value</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : taxes.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  <Receipt className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No taxes found
                </td>
              </tr>
            ) : (
              taxes.map((tax) => (
                <tr key={tax.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {tax.name}
                  </td>
                  <td className="px-5 py-4 capitalize text-slate-600">
                    {tax.type}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {tax.type === 'percentage'
                      ? `${Number(tax.value)}%`
                      : Number(tax.value).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RowActionsMenu
                      open={dropdownOpen === tax.id}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? tax.id : null)
                      }
                    >
                      <button
                        type="button"
                        onClick={() => handleOpen('view', tax)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => handleOpen('edit', tax)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(tax.id)}
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
