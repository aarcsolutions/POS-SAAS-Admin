'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  UserRound,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Phone,
  FileText,
} from 'lucide-react';
import DriverForm from '@/components/drivers/DriverForm';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useDriversQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
  useDeleteDriverMutation,
} from '@/hooks/drivers';
import { useBranchesQuery } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAuthStore } from '@/store/authStore';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { Driver } from '@/types/driver.types';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 10;

export default function DriversPage() {
  const user = useAuthStore((s) => s.user);
  const isTenantAdmin = !user?.branchId;

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.drivers.create);
  const canUpdate = usePermission(ENTITY_PERMS.drivers.update);
  const canDelete = usePermission(ENTITY_PERMS.drivers.delete);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter]);

  const { data: branchesRes } = useBranchesQuery(
    { page: 1, limit: 100 },
    isTenantAdmin
  );

  const branchOptions = useMemo(() => {
    const rows =
      branchesRes?.data?.data ||
      branchesRes?.data?.branches ||
      (Array.isArray(branchesRes?.data) ? branchesRes.data : []) ||
      [];
    return (rows as { id: string; name: string; code?: string }[]).map((b) => ({
      value: b.id,
      label: b.name || b.code || b.id,
    }));
  }, [branchesRes]);

  const { data, isLoading, isFetching } = useDriversQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin && branchFilter ? branchFilter : undefined,
  });
  const createMutation = useCreateDriverMutation();
  const updateMutation = useUpdateDriverMutation();
  const deleteMutation = useDeleteDriverMutation();

  const drivers = extractListItems<Driver>(data, 'drivers');
  const pagination = extractPagination(data, LIMIT);
  const colSpan = isTenantAdmin ? 6 : 5;

  const handleOpenForm = (
    mode: 'create' | 'edit' | 'view',
    driver?: Driver
  ) => {
    setFormMode(mode);
    setSelectedDriver(driver || null);
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete Driver',
      message: 'Delete this driver?',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  if (formMode) {
    return (
      <DriverForm
        mode={formMode}
        showBranchSelect={isTenantAdmin}
        branchOptions={branchOptions}
        initialData={
          selectedDriver
            ? {
                name: selectedDriver.name,
                phone: selectedDriver.phone,
                branch_id: selectedDriver.branch_id,
                notes: selectedDriver.notes || '',
                is_active: selectedDriver.is_active,
              }
            : undefined
        }
        saving={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormMode(null)}
        onSubmit={async (payload) => {
          if (formMode === 'create') {
            await createMutation.mutateAsync(payload);
          } else if (formMode === 'edit' && selectedDriver) {
            await updateMutation.mutateAsync({
              id: selectedDriver.id,
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
            Delivery Drivers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage delivery drivers by branch
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" /> Add Driver
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, or notes..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
          />
        </div>
        {isTenantAdmin && (
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
              <th className="px-5 py-3 font-bold">Driver</th>
              <th className="px-5 py-3 font-bold">Phone</th>
              <th className="px-5 py-3 font-bold">Notes</th>
              {isTenantAdmin && (
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
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-slate-400">
                  <UserRound className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No drivers found
                </td>
              </tr>
            ) : (
              drivers.map((d) => (
                <tr key={d.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-sm font-bold text-amber-700">
                        {d.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-semibold text-slate-800">{d.name}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {d.phone}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {d.notes ? (
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        <span className="line-clamp-1">{d.notes}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  {isTenantAdmin && (
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                        {d.branch_name || 'Branch'}
                      </span>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        d.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {d.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RowActionsMenu
                      open={dropdownOpen === d.id}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? d.id : null)
                      }
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenForm('view', d)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => handleOpenForm('edit', d)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
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
        label="drivers"
        disabled={isLoading || isFetching}
      />
    </div>
  );
}
