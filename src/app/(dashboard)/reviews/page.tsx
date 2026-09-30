'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Star,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import ReviewForm from '@/components/reviews/ReviewForm';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useReviewsQuery,
  useEligibleOrdersQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from '@/hooks/reviews';
import { useTenantBranchScope } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { Review } from '@/types/review.types';
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

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${
            n <= rating
              ? 'fill-[#f5c518] text-[#f5c518]'
              : 'fill-transparent text-[var(--brand-primary)]'
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { showBranchFilter, branchOptions } = useTenantBranchScope();

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [formBranchId, setFormBranchId] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.reviews.create);
  const canUpdate = usePermission(ENTITY_PERMS.reviews.update);
  const canDelete = usePermission(ENTITY_PERMS.reviews.delete);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter, ratingFilter, dateFrom, dateTo]);

  const effectiveFormBranch = formBranchId || branchFilter || '';

  const { data: eligibleRes } = useEligibleOrdersQuery(
    effectiveFormBranch || undefined,
    formMode === 'create'
  );

  const orderOptions = useMemo(() => {
    const rows = eligibleRes?.data || [];
    return (rows as {
      id: string;
      order_number: string;
      customer_name: string;
      final_total: number;
    }[]).map((o) => ({
      value: o.id,
      label: `${o.order_number} — ${o.customer_name} ($${Number(o.final_total).toFixed(2)})`,
    }));
  }, [eligibleRes]);

  const { data, isLoading, isFetching } = useReviewsQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: branchFilter || undefined,
    rating: ratingFilter ? Number(ratingFilter) : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  const createMutation = useCreateReviewMutation();
  const updateMutation = useUpdateReviewMutation();
  const deleteMutation = useDeleteReviewMutation();

  const reviews = extractListItems<Review>(data, 'reviews');
  const pagination = extractPagination(data, LIMIT);
  const colSpan = 7;

  const handleOpenForm = (
    mode: 'create' | 'edit' | 'view',
    review?: Review
  ) => {
    setFormMode(mode);
    setSelectedReview(review || null);
    setFormBranchId(review?.branch_id || effectiveFormBranch || '');
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete Review',
      message: 'Delete this review?',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  if (formMode) {
    const editOrderLabel = selectedReview
      ? `${selectedReview.order_number || selectedReview.order_id}${
          selectedReview.customer_name
            ? ` — ${selectedReview.customer_name}`
            : ''
        }`
      : '';

    return (
      <ReviewForm
        mode={formMode}
        showBranchSelect={showBranchFilter && formMode === 'create'}
        branchFilterOptional
        branchOptions={branchOptions}
        orderOptions={
          formMode === 'create'
            ? orderOptions
            : [{ value: selectedReview?.order_id || '', label: editOrderLabel }]
        }
        initialData={
          selectedReview
            ? {
                branch_id: selectedReview.branch_id || '',
                order_id: selectedReview.order_id,
                rating: String(selectedReview.rating),
                comment: selectedReview.comment || '',
                reviewed_at: selectedReview.reviewed_at,
              }
            : undefined
        }
        onBranchChange={setFormBranchId}
        saving={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormMode(null)}
        onSubmit={async (payload) => {
          if (formMode === 'create') {
            await createMutation.mutateAsync(payload);
          } else if (formMode === 'edit' && selectedReview) {
            await updateMutation.mutateAsync({
              id: selectedReview.id,
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
            Order Reviews
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tenant-wide order feedback — branch is optional and taken from the
            order when available
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" /> Add Review
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:flex-wrap">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search comment or customer..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
          />
        </div>
        <div
          className="flex h-11 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3"
          role="group"
          aria-label="Filter by rating"
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const active = ratingFilter === String(n);
            const filled =
              ratingFilter === '' ? false : Number(ratingFilter) >= n;
            return (
              <button
                key={n}
                type="button"
                onClick={() =>
                  setRatingFilter(ratingFilter === String(n) ? '' : String(n))
                }
                className="rounded p-0.5 transition hover:scale-110"
                aria-label={`${n} stars`}
                aria-pressed={active}
                title={active ? 'Clear rating filter' : `Filter ${n} stars`}
              >
                <Star
                  className={`h-5 w-5 ${
                    filled || active
                      ? 'fill-[#f5c518] text-[#f5c518]'
                      : 'fill-transparent text-[var(--brand-primary)]'
                  }`}
                />
              </button>
            );
          })}
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
              <th className="px-5 py-3 font-bold">Order</th>
              <th className="px-5 py-3 font-bold">Customer</th>
              <th className="px-5 py-3 font-bold">Rating</th>
              <th className="px-5 py-3 font-bold">Comment</th>
              <th className="px-5 py-3 font-bold">Reviewed</th>
              <th className="px-5 py-3 font-bold">Branch</th>
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
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-slate-400">
                  <Star className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No reviews found
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {r.order_number || r.order_id.slice(0, 8)}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {r.customer_name || '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <RatingStars rating={r.rating} />
                      <span className="text-xs font-bold text-slate-500">
                        {r.rating}/5
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {r.comment ? (
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="line-clamp-1">{r.comment}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {formatDateTime(r.reviewed_at)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-[var(--brand-primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                      {r.branch_name || '—'}
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
        label="reviews"
        disabled={isLoading || isFetching}
      />
    </div>
  );
}
