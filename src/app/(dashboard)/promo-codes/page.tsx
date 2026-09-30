'use client';

import { useEffect, useState } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';
import PromoCodeForm, { toDatetimeLocal } from '@/components/promo-codes/PromoCodeForm';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  usePromoCodesQuery,
  useCreatePromoCodeMutation,
  useUpdatePromoCodeMutation,
  useDeletePromoCodeMutation,
  useTogglePromoCodeMutation,
} from '@/hooks/promo-codes';
import { useTenantBranchScope } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination, formatDate } from '@/utils/helpers';
import { PromoCode } from '@/types/promo-code.types';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 10;

type PromoStatus = 'Expired' | 'Maxed' | 'Scheduled' | 'Active' | 'Inactive';

function getPromoStatus(p: PromoCode): PromoStatus {
  const now = Date.now();
  if (p.expires_at && new Date(p.expires_at).getTime() < now) return 'Expired';
  if (
    p.usage_limit != null &&
    p.usage_limit > 0 &&
    p.used_count >= p.usage_limit
  ) {
    return 'Maxed';
  }
  if (p.starts_at && new Date(p.starts_at).getTime() > now) return 'Scheduled';
  return p.is_active ? 'Active' : 'Inactive';
}

const statusStyles: Record<PromoStatus, string> = {
  Expired: 'bg-rose-100 text-rose-700',
  Maxed: 'bg-amber-100 text-amber-700',
  Scheduled: 'bg-sky-100 text-sky-700',
  Active: 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]',
  Inactive: 'bg-slate-100 text-slate-500',
};

function formatValue(p: PromoCode) {
  if (p.type === 'percentage') return `${p.value}%`;
  return String(p.value);
}

function formatValidity(p: PromoCode) {
  const start = p.starts_at ? formatDate(p.starts_at) : '—';
  const end = p.expires_at ? formatDate(p.expires_at) : '—';
  return `${start} → ${end}`;
}

export default function PromoCodesPage() {
  const { isTenantAdmin, showBranchFilter, branchOptions } = useTenantBranchScope();

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.promo_codes.create);
  const canUpdate = usePermission(ENTITY_PERMS.promo_codes.update);
  const canDelete = usePermission(ENTITY_PERMS.promo_codes.delete);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter]);

  const { data, isLoading, isFetching } = usePromoCodesQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin && branchFilter ? branchFilter : undefined,
  });
  const createMutation = useCreatePromoCodeMutation();
  const updateMutation = useUpdatePromoCodeMutation();
  const deleteMutation = useDeletePromoCodeMutation();
  const toggleMutation = useTogglePromoCodeMutation();

  const promoCodes = extractListItems<PromoCode>(data, 'promo_codes');
  const pagination = extractPagination(data, LIMIT);
  const colSpan = showBranchFilter ? 10 : 9;

  const handleOpenForm = (
    mode: 'create' | 'edit' | 'view',
    promo?: PromoCode
  ) => {
    setFormMode(mode);
    setSelectedPromo(promo || null);
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete Coupon',
      message: 'This coupon will be removed from the list. Continue?',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  const handleToggle = async (promo: PromoCode) => {
    if (!canUpdate) return;
    setTogglingId(promo.id);
    try {
      await toggleMutation.mutateAsync({
        id: promo.id,
        is_active: !promo.is_active,
      });
    } finally {
      setTogglingId(null);
    }
  };

  if (formMode) {
    return (
      <PromoCodeForm
        mode={formMode}
        showBranchSelect={showBranchFilter}
        branchOptions={branchOptions}
        initialData={
          selectedPromo
            ? {
                code: selectedPromo.code,
                type: selectedPromo.type,
                value: String(selectedPromo.value),
                min_order_amount:
                  selectedPromo.min_order_amount != null
                    ? String(selectedPromo.min_order_amount)
                    : '',
                max_discount:
                  selectedPromo.max_discount != null
                    ? String(selectedPromo.max_discount)
                    : '',
                usage_limit:
                  selectedPromo.usage_limit != null
                    ? String(selectedPromo.usage_limit)
                    : '',
                starts_at: toDatetimeLocal(selectedPromo.starts_at),
                expires_at: toDatetimeLocal(selectedPromo.expires_at),
                branch_id: selectedPromo.branch_id || '',
                is_active: selectedPromo.is_active,
              }
            : undefined
        }
        saving={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormMode(null)}
        onSubmit={async (payload) => {
          if (formMode === 'create') {
            await createMutation.mutateAsync(payload);
          } else if (formMode === 'edit' && selectedPromo) {
            await updateMutation.mutateAsync({
              id: selectedPromo.id,
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
            Coupons & Offers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage discount coupons for your branches
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" /> Add Coupon
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by code..."
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

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Code</th>
              <th className="px-5 py-3 font-bold">Type</th>
              <th className="px-5 py-3 font-bold">Value</th>
              <th className="px-5 py-3 font-bold">Min order</th>
              <th className="px-5 py-3 font-bold">Usage</th>
              <th className="px-5 py-3 font-bold">Validity</th>
              {showBranchFilter && (
                <th className="px-5 py-3 font-bold">Branch</th>
              )}
              <th className="px-5 py-3 font-bold">Active</th>
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
            ) : promoCodes.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-slate-400">
                  <Ticket className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No coupons found
                </td>
              </tr>
            ) : (
              promoCodes.map((p) => {
                const status = getPromoStatus(p);
                return (
                  <tr key={p.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-slate-800">
                        {p.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 capitalize text-slate-600">
                      {p.type === 'percentage' ? '%' : 'Flat'}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">
                      {formatValue(p)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {p.min_order_amount ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {p.used_count}
                      {p.usage_limit != null ? ` / ${p.usage_limit}` : ''}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatValidity(p)}
                    </td>
                    {showBranchFilter && (
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                          {p.branch_name || 'All branches'}
                        </span>
                      </td>
                    )}
                    <td className="px-5 py-4">
                      {canUpdate ? (
                        <button
                          type="button"
                          onClick={() => handleToggle(p)}
                          disabled={togglingId === p.id}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                            p.is_active ? 'bg-[var(--brand-primary)]' : 'bg-slate-300'
                          } ${togglingId === p.id ? 'opacity-60' : ''}`}
                          aria-label={p.is_active ? 'Deactivate' : 'Activate'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                              p.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">
                          {p.is_active ? 'Yes' : 'No'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status]}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <RowActionsMenu
                        open={dropdownOpen === p.id}
                        onOpenChange={(open) =>
                          setDropdownOpen(open ? p.id : null)
                        }
                      >
                        <button
                          type="button"
                          onClick={() => handleOpenForm('view', p)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" /> View
                        </button>
                        {canUpdate && (
                          <button
                            type="button"
                            onClick={() => handleOpenForm('edit', p)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
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
        label="coupons"
        disabled={isLoading || isFetching}
      />
    </div>
  );
}
