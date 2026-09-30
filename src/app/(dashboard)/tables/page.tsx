'use client';

import { useEffect, useState } from 'react'
import {
  LayoutGrid,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  CalendarPlus,
} from 'lucide-react';
import TableForm from '@/components/tables/TableForm';
import QuickReserveModal from '@/components/reservations/QuickReserveModal';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useTablesQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
} from '@/hooks/tables';
import { useQuickCreateReservationMutation } from '@/hooks/reservations';
import { useTenantBranchScope } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { RestaurantTableRow } from '@/types/table.types';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 10;

const STATUS_BADGE: Record<string, string> = {
  available: 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]',
  occupied: 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]',
  reserved: 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]',
};

export default function TablesPage() {
  const { isTenantAdmin, showBranchFilter, branchOptions } = useTenantBranchScope();

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedTable, setSelectedTable] =
    useState<RestaurantTableRow | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [quickReserveTable, setQuickReserveTable] =
    useState<RestaurantTableRow | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.tables.create);
  const canUpdate = usePermission(ENTITY_PERMS.tables.update);
  const canDelete = usePermission(ENTITY_PERMS.tables.delete);
  const canQuickReserve = usePermission(ENTITY_PERMS.reservations.create);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter]);

  const { data, isLoading, isFetching } = useTablesQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin && branchFilter ? branchFilter : undefined,
  });
  const createMutation = useCreateTableMutation();
  const updateMutation = useUpdateTableMutation();
  const deleteMutation = useDeleteTableMutation();
  const quickReserveMutation = useQuickCreateReservationMutation();

  const tables = extractListItems<RestaurantTableRow>(data, 'tables');
  const pagination = extractPagination(data, LIMIT);
  const colSpan = showBranchFilter ? 6 : 5;

  const handleOpenForm = (
    mode: 'create' | 'edit' | 'view',
    table?: RestaurantTableRow
  ) => {
    setFormMode(mode);
    setSelectedTable(table || null);
    setDropdownOpen(null);
  };

  const handleQuickReserve = (table: RestaurantTableRow) => {
    setDropdownOpen(null);
    setQuickReserveTable(table);
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete Table',
      message: 'Delete this table?',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  if (formMode) {
    return (
      <TableForm
        mode={formMode}
        showBranchSelect={showBranchFilter}
        branchOptions={branchOptions}
        initialData={
          selectedTable
            ? {
                name: selectedTable.name,
                code: selectedTable.code || '',
                capacity:
                  selectedTable.capacity != null
                    ? String(selectedTable.capacity)
                    : '',
                status: selectedTable.status || 'available',
                branch_id: selectedTable.branch_id || '',
                is_active: selectedTable.is_active !== false,
              }
            : undefined
        }
        saving={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormMode(null)}
        onSubmit={async (payload) => {
          if (formMode === 'create') {
            await createMutation.mutateAsync(payload);
          } else if (formMode === 'edit' && selectedTable) {
            await updateMutation.mutateAsync({
              id: selectedTable.id,
              ...payload,
            });
          }
          setFormMode(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tables
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage restaurant floor tables by branch
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" /> Add Table
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or code..."
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
              options={branchOptions}
            />
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Table</th>
              <th className="px-5 py-3 font-bold">Code</th>
              <th className="px-5 py-3 font-bold">Capacity</th>
              {showBranchFilter && (
                <th className="px-5 py-3 font-bold">Branch</th>
              )}
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-slate-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : tables.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-slate-400">
                  <LayoutGrid className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No tables found
                </td>
              </tr>
            ) : (
              tables.map((t) => (
                <tr key={t.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800">{t.name}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {t.code || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {t.capacity ?? <span className="text-slate-300">—</span>}
                  </td>
                  {showBranchFilter && (
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-[var(--brand-primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                        {t.branch_name || 'Branch'}
                      </span>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        STATUS_BADGE[t.status] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RowActionsMenu
                      open={dropdownOpen === t.id}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? t.id : null)
                      }
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenForm('view', t)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      {canQuickReserve && t.status === 'available' && (
                        <button
                          type="button"
                          onClick={() => handleQuickReserve(t)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <CalendarPlus className="h-4 w-4" /> Quick Reserve
                        </button>
                      )}
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => handleOpenForm('edit', t)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
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

      <QuickReserveModal
        open={Boolean(quickReserveTable)}
        initialTableId={quickReserveTable?.id}
        initialBranchId={quickReserveTable?.branch_id}
        saving={quickReserveMutation.isPending}
        onClose={() => setQuickReserveTable(null)}
        onSubmit={async (payload) => {
          await quickReserveMutation.mutateAsync(payload);
          setQuickReserveTable(null);
        }}
      />
    </div>
  );
}
