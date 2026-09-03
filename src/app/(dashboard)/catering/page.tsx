'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Users,
  Phone,
  MapPin,
} from 'lucide-react';
import CateringForm from '@/components/catering/CateringForm';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useCateringEventsQuery,
  useCateringEventByIdQuery,
  useCreateCateringEventMutation,
  useUpdateCateringEventMutation,
  useDeleteCateringEventMutation,
} from '@/hooks/catering';
import { useBranchesQuery } from '@/hooks/branches';
import { useCustomersQuery } from '@/hooks/customers';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAuthStore } from '@/store/authStore';
import { extractListItems, extractPagination } from '@/utils/helpers';
import {
  CateringEvent,
  CATERING_STATUS_OPTIONS,
  STATUS_BADGE,
  VENUE_TYPE_OPTIONS,
} from '@/types/catering.types';
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

function formatMoney(value?: number | null) {
  if (value == null) return '—';
  return `$${Number(value).toFixed(2)}`;
}

export default function CateringPage() {
  const user = useAuthStore((s) => s.user);
  const isTenantAdmin = !user?.branchId;

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formBranchId, setFormBranchId] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.catering.create);
  const canUpdate = usePermission(ENTITY_PERMS.catering.update);
  const canDelete = usePermission(ENTITY_PERMS.catering.delete);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter, statusFilter, venueFilter, dateFrom, dateTo]);

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

  const { data, isLoading, isFetching } = useCateringEventsQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin && branchFilter ? branchFilter : undefined,
    status: statusFilter || undefined,
    venue_type: venueFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  const { data: detailRes, isLoading: detailLoading } =
    useCateringEventByIdQuery(
      selectedId,
      Boolean(formMode && selectedId && formMode !== 'create')
    );

  const createMutation = useCreateCateringEventMutation();
  const updateMutation = useUpdateCateringEventMutation();
  const deleteMutation = useDeleteCateringEventMutation();

  const events = extractListItems<CateringEvent>(data);
  const pagination = extractPagination(data, LIMIT);
  const colSpan = isTenantAdmin ? 8 : 7;

  const statusFilterOptions = useMemo(
    () => [
      { value: '', label: 'All statuses' },
      ...CATERING_STATUS_OPTIONS.map((s) => ({
        value: s.value,
        label: s.label,
      })),
    ],
    []
  );

  const venueFilterOptions = useMemo(
    () => [
      { value: '', label: 'All venues' },
      ...VENUE_TYPE_OPTIONS.map((v) => ({
        value: v.value,
        label: v.label,
      })),
    ],
    []
  );

  const handleOpenForm = (
    mode: 'create' | 'edit' | 'view',
    event?: CateringEvent
  ) => {
    setFormMode(mode);
    setSelectedId(event?.id || null);
    setFormBranchId(event?.branch_id || branchFilter || '');
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete Catering Event',
      message: 'Delete this catering event?',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  const selectedEvent = detailRes?.data;

  if (formMode) {
    if (detailLoading && selectedId && formMode !== 'create') {
      return (
        <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    const initialData = selectedEvent
      ? {
          branch_id: selectedEvent.branch_id || '',
          customer_id: selectedEvent.customer_id || '',
          contact_name: selectedEvent.contact_name,
          contact_phone: selectedEvent.contact_phone || '',
          event_name: selectedEvent.event_name || '',
          event_at: selectedEvent.event_at,
          party_size: String(selectedEvent.party_size),
          venue_type: selectedEvent.venue_type,
          venue_address: selectedEvent.venue_address || '',
          status: selectedEvent.status,
          estimated_total:
            selectedEvent.estimated_total != null
              ? String(selectedEvent.estimated_total)
              : '',
          notes: selectedEvent.notes || '',
        }
      : {
          branch_id: effectiveFormBranch,
        };

    return (
      <CateringForm
        mode={formMode}
        showBranchSelect={isTenantAdmin}
        branchOptions={branchOptions}
        customerOptions={customerOptions}
        initialData={initialData}
        onBranchChange={setFormBranchId}
        saving={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormMode(null)}
        onSubmit={async (payload) => {
          if (formMode === 'create') {
            await createMutation.mutateAsync(payload);
          } else if (formMode === 'edit' && selectedEvent) {
            await updateMutation.mutateAsync({
              id: selectedEvent.id,
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
            Catering Events
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage catering inquiries, quotes, and confirmed events by branch
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" /> Add Event
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contact, event, or notes..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            variant="filter"
            size="lg"
            allowEmpty={false}
            options={statusFilterOptions}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            value={venueFilter}
            onChange={setVenueFilter}
            variant="filter"
            size="lg"
            allowEmpty={false}
            options={venueFilterOptions}
          />
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-amber-500"
          aria-label="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-amber-500"
          aria-label="To date"
        />
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
              <th className="px-5 py-3 font-bold">Event</th>
              <th className="px-5 py-3 font-bold">Contact</th>
              <th className="px-5 py-3 font-bold">When</th>
              <th className="px-5 py-3 font-bold">Covers</th>
              <th className="px-5 py-3 font-bold">Venue</th>
              <th className="px-5 py-3 font-bold">Quote</th>
              <th className="px-5 py-3 font-bold">Status</th>
              {isTenantAdmin && (
                <th className="px-5 py-3 font-bold">Branch</th>
              )}
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
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-slate-400">
                  <UtensilsCrossed className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No catering events found
                </td>
              </tr>
            ) : (
              events.map((ev) => {
                const badge = STATUS_BADGE[ev.status];
                return (
                  <tr key={ev.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">
                        {ev.event_name || 'Untitled event'}
                      </div>
                      {ev.customer_name && (
                        <div className="text-xs text-slate-500">
                          {ev.customer_name}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-700">
                        {ev.contact_name}
                      </div>
                      {ev.contact_phone && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="h-3 w-3" />
                          {ev.contact_phone}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDateTime(ev.event_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {ev.party_size}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <div className="flex items-center gap-1 capitalize">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {ev.venue_type.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">
                      {formatMoney(ev.estimated_total)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    {isTenantAdmin && (
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                          {ev.branch_name || 'Branch'}
                        </span>
                      </td>
                    )}
                    <td className="px-5 py-4 text-right">
                      <RowActionsMenu
                        open={dropdownOpen === ev.id}
                        onOpenChange={(open) =>
                          setDropdownOpen(open ? ev.id : null)
                        }
                      >
                        <button
                          type="button"
                          onClick={() => handleOpenForm('view', ev)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" /> View
                        </button>
                        {canUpdate && (
                          <button
                            type="button"
                            onClick={() => handleOpenForm('edit', ev)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(ev.id)}
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
        label="events"
        disabled={isLoading || isFetching}
      />
    </div>
  );
}
