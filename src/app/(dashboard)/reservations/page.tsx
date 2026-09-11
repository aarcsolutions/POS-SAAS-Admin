'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Users,
  Phone,
} from 'lucide-react';
import ReservationForm from '@/components/reservations/ReservationForm';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useReservationsQuery,
  useReservationByIdQuery,
  useReservationTablesQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useDeleteReservationMutation,
} from '@/hooks/reservations';
import { useBranchesQuery } from '@/hooks/branches';
import { useCustomersQuery } from '@/hooks/customers';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAuthStore } from '@/store/authStore';
import { extractListItems, extractPagination } from '@/utils/helpers';
import {
  Reservation,
  RESERVATION_STATUS_OPTIONS,
  STATUS_BADGE,
} from '@/types/reservation.types';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 10;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function ReservationsPage() {
  const user = useAuthStore((s) => s.user);
  const isTenantAdmin = !user?.branchId;

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formBranchId, setFormBranchId] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.reservations.create);
  const canUpdate = usePermission(ENTITY_PERMS.reservations.update);
  const canDelete = usePermission(ENTITY_PERMS.reservations.delete);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter, statusFilter, dateFrom, dateTo]);

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

  const effectiveFormBranch =
    formBranchId || branchFilter || user?.branchId || '';

  const { data: customersRes } = useCustomersQuery({
    page: 1,
    limit: 200,
    branch_id: isTenantAdmin && effectiveFormBranch ? effectiveFormBranch : undefined,
  });

  const customerOptions = useMemo(() => {
    const rows = extractListItems<{ id: string; name: string }>(
      customersRes,
      'customers'
    );
    return rows.map((c) => ({ value: c.id, label: c.name }));
  }, [customersRes]);

  const { data: tablesRes } = useReservationTablesQuery(
    isTenantAdmin ? effectiveFormBranch || undefined : undefined,
    Boolean(formMode)
  );

  const tableOptions = useMemo(() => {
    const rows = tablesRes?.data || [];
    return rows.map((t) => ({
      value: t.id,
      label: t.code ? `${t.name} (${t.code})` : t.name,
    }));
  }, [tablesRes]);

  const { data, isLoading, isFetching } = useReservationsQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin && branchFilter ? branchFilter : undefined,
    status: statusFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  const { data: detailRes, isLoading: detailLoading } = useReservationByIdQuery(
    selectedId,
    Boolean(formMode && selectedId && formMode !== 'create')
  );

  const createMutation = useCreateReservationMutation();
  const updateMutation = useUpdateReservationMutation();
  const deleteMutation = useDeleteReservationMutation();

  const reservations = extractListItems<Reservation>(data, 'reservations');
  const pagination = extractPagination(data, LIMIT);
  const colSpan = isTenantAdmin ? 7 : 6;

  const statusFilterOptions = useMemo(
    () => [
      { value: '', label: 'All statuses' },
      ...RESERVATION_STATUS_OPTIONS.map((s) => ({
        value: s.value,
        label: s.label,
      })),
    ],
    []
  );

  const handleOpenForm = (
    mode: 'create' | 'edit' | 'view',
    reservation?: Reservation
  ) => {
    setFormMode(mode);
    setSelectedId(reservation?.id || null);
    setFormBranchId(reservation?.branch_id || branchFilter || '');
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete Reservation',
      message: 'Delete this reservation?',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  const selectedReservation = detailRes?.data;

  if (formMode) {
    if (detailLoading && selectedId && formMode !== 'create') {
      return (
        <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    const initialData = selectedReservation
      ? {
          branch_id: selectedReservation.branch_id || '',
          customer_id: selectedReservation.customer_id || '',
          guest_name: selectedReservation.guest_name,
          guest_phone: selectedReservation.guest_phone || '',
          restaurant_table_id: selectedReservation.restaurant_table_id || '',
          party_size: String(selectedReservation.party_size),
          reserved_at: selectedReservation.reserved_at,
          duration_minutes: String(selectedReservation.duration_minutes),
          status: selectedReservation.status,
          notes: selectedReservation.notes || '',
        }
      : undefined;

    return (
      <ReservationForm
        mode={formMode}
        showBranchSelect={isTenantAdmin}
        branchOptions={branchOptions}
        customerOptions={customerOptions}
        tableOptions={tableOptions}
        initialData={initialData}
        saving={createMutation.isPending || updateMutation.isPending}
        onBranchChange={setFormBranchId}
        onClose={() => {
          setFormMode(null);
          setSelectedId(null);
        }}
        onSubmit={async (payload) => {
          if (formMode === 'create') {
            await createMutation.mutateAsync(payload);
          } else if (formMode === 'edit' && selectedId) {
            await updateMutation.mutateAsync({ id: selectedId, ...payload });
          }
          setFormMode(null);
          setSelectedId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reservations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage table reservations by branch
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" /> Add Reservation
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guest name or phone..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
          />
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
          aria-label="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
          aria-label="To date"
        />
        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            variant="filter"
            size="lg"
            options={statusFilterOptions}
            aria-label="Filter by status"
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
              <th className="px-5 py-3 font-bold">Guest</th>
              <th className="px-5 py-3 font-bold">When</th>
              <th className="px-5 py-3 font-bold">Party</th>
              <th className="px-5 py-3 font-bold">Table</th>
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
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-slate-400">
                  <CalendarDays className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No reservations found
                </td>
              </tr>
            ) : (
              reservations.map((r) => {
                const badge = STATUS_BADGE[r.status] || STATUS_BADGE.pending;
                return (
                  <tr key={r.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">
                        {r.guest_name}
                      </div>
                      {r.guest_phone && (
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="h-3 w-3" />
                          {r.guest_phone}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {formatDateTime(r.reserved_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {r.party_size}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {r.table_name || '—'}
                    </td>
                    {isTenantAdmin && (
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-[var(--brand-primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                          {r.branch_name || 'Branch'}
                        </span>
                      </td>
                    )}
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <RowActionsMenu
                        open={dropdownOpen === r.id}
                        onOpenChange={(open) =>
                          setDropdownOpen(open ? r.id : null)
                        }
                      >
                        <button
                          type="button"
                          onClick={() => handleOpenForm('view', r)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" /> View
                        </button>
                        {canUpdate && (
                          <button
                            type="button"
                            onClick={() => handleOpenForm('edit', r)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(r.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        )}
                      </RowActionsMenu>
                    </td>
                  </tr>
                );
              })
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
        label="reservations"
        disabled={isLoading || isFetching}
      />
    </div>
  );
}
