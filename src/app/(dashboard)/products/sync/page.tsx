'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckSquare,
  Loader2,
  RefreshCw,
  Square,
} from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useProductsQuery,
  useProductSyncJobQuery,
  useProductSyncMutation,
} from '@/hooks/products';
import { useBranchesQuery } from '@/hooks/branches';
import { useAuthStore } from '@/store/authStore';
import { extractListItems } from '@/utils/helpers';
import { Product } from '@/types/product.types';
import { toast } from 'sonner';

const SYNC_PRODUCT_LIMIT = 500;
const TENANT_SOURCE = '__tenant__';

type SyncJob = {
  id: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  total_products: number;
  processed_products: number;
  created_count: number;
  updated_count: number;
  skipped_count: number;
  failed_count: number;
  results?: Array<{
    source_product_id: string;
    product_name: string;
    action: string;
    reasons: string[];
  }>;
  error?: string | null;
};

export default function ProductSyncPage() {
  const user = useAuthStore((s) => s.user);
  const isTenantAdmin = !user?.branchId;
  const canSync = usePermission(ENTITY_PERMS.products.sync);

  const [sourceKey, setSourceKey] = useState(TENANT_SOURCE);
  const [targetBranchId, setTargetBranchId] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [jobId, setJobId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const syncMutation = useProductSyncMutation();

  const { data: jobRes, isFetching: jobFetching } = useProductSyncJobQuery(
    jobId,
    {
      refetchInterval: (query) => {
        const job = (query.state.data as any)?.data as SyncJob | undefined;
        if (!job) return 1500;
        if (job.status === 'done' || job.status === 'failed') return false;
        return 1500;
      },
    }
  );

  const job = (jobRes?.data as SyncJob | undefined) || null;
  const jobActive =
    !!jobId && job?.status !== 'done' && job?.status !== 'failed';

  const { data: branchesRes, isLoading: branchesLoading } = useBranchesQuery(
    { page: 1, limit: 100 },
    isTenantAdmin && canSync
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

  const sourceOptions = useMemo(
    () => [
      { value: TENANT_SOURCE, label: 'Tenant catalog' },
      ...branchOptions,
    ],
    [branchOptions]
  );

  const sourceBranchId =
    sourceKey === TENANT_SOURCE ? null : sourceKey || null;

  const productBranchFilter =
    sourceKey === TENANT_SOURCE ? 'tenant' : sourceKey || undefined;

  const { data: productsRes, isLoading: productsLoading, isError: productsError } =
    useProductsQuery(
      {
        page: 1,
        limit: SYNC_PRODUCT_LIMIT,
        search: search.trim() || undefined,
        branch_id: productBranchFilter,
      },
      isTenantAdmin && canSync && !!sourceKey
    );

  const products = useMemo(
    () => extractListItems<Product>(productsRes),
    [productsRes]
  );

  const filteredProducts = products;

  const targetOptions = useMemo(
    () =>
      branchOptions.filter((b) =>
        sourceKey === TENANT_SOURCE ? true : b.value !== sourceKey
      ),
    [branchOptions, sourceKey]
  );

  useEffect(() => {
    setSelectedIds(new Set());
    setJobId(null);
  }, [sourceKey]);

  useEffect(() => {
    if (targetBranchId && sourceKey !== TENANT_SOURCE && targetBranchId === sourceKey) {
      setTargetBranchId('');
    }
  }, [sourceKey, targetBranchId]);

  const allSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.has(p.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStart = async () => {
    if (!targetBranchId) {
      toast.error('Select a target branch');
      return;
    }
    if (selectedIds.size === 0) {
      toast.error('Select at least one product');
      return;
    }

    try {
      const res = await syncMutation.mutateAsync({
        source_branch_id: sourceBranchId,
        product_ids: [...selectedIds],
        target_branch_id: targetBranchId,
      });
      const queuedId = res?.data?.job_id || res?.data?.id;
      if (!queuedId) {
        toast.error('Sync queued but no job id returned');
        return;
      }
      toast.success(res?.message || 'Product sync queued');
      setJobId(queuedId);
    } catch {
      // toast handled in mutation
    }
  };

  if (!isTenantAdmin) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-600">
          Only tenant admins can sync products to branches.
        </p>
        <Link
          href="/products"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
      </div>
    );
  }

  if (!canSync) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-600">
          You do not have permission to sync products.
        </p>
        <Link
          href="/products"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
      </div>
    );
  }

  const total = job?.total_products || selectedIds.size || 0;
  const processed = job?.processed_products || 0;
  const pct =
    total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/products"
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Products
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sync Products
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Copy selected products into one target branch. Matching is by
            product name in that branch.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Source
            </label>
            <Select
              value={sourceKey}
              onChange={setSourceKey}
              options={sourceOptions}
              allowEmpty={false}
              loading={branchesLoading}
              searchable
              variant="form"
              aria-label="Source catalog"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Target branch
            </label>
            <Select
              value={targetBranchId}
              onChange={setTargetBranchId}
              options={targetOptions}
              placeholder="Select target branch"
              allowEmpty
              loading={branchesLoading}
              searchable
              variant="form"
              aria-label="Target branch"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Products ({selectedIds.size} selected)
              </label>
              <button
                type="button"
                onClick={toggleAll}
                disabled={filteredProducts.length === 0 || !!jobActive}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-primary)] disabled:opacity-50"
              >
                {allSelected ? (
                  <CheckSquare className="h-3.5 w-3.5" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
                Select all
              </button>
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter products…"
              disabled={!!jobActive}
              className="mb-3 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary-soft)]"
            />
            <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-100">
              {productsLoading ? (
                <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : productsError ? (
                <p className="p-6 text-center text-sm text-rose-600">
                  Failed to load products. Refresh and try again.
                </p>
              ) : filteredProducts.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-500">
                  {sourceKey === TENANT_SOURCE
                    ? 'No products in the tenant catalog.'
                    : 'No products in this branch. Try “Tenant catalog” if products were created without a branch.'}
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const checked = selectedIds.has(p.id);
                    return (
                      <li key={p.id}>
                        <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!!jobActive}
                            onChange={() => toggleOne(p.id)}
                            className="h-4 w-4 rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                          />
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                            {p.name}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Up to {SYNC_PRODUCT_LIMIT} products loaded per source.
            </p>
          </div>

          <button
            type="button"
            onClick={handleStart}
            disabled={
              syncMutation.isPending ||
              !!jobActive ||
              !targetBranchId ||
              selectedIds.size === 0
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-50"
          >
            {syncMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Start sync
          </button>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">Progress</h2>
          {!jobId ? (
            <p className="text-sm text-slate-500">
              Choose source, products, and target, then start sync to see
              progress here.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  {processed}/{total} processed
                  {jobFetching && jobActive ? (
                    <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-slate-400" />
                  ) : null}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    job?.status === 'done'
                      ? 'bg-emerald-50 text-emerald-700'
                      : job?.status === 'failed'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-[color-mix(in_srgb,var(--brand-primary)_12%,white)] text-[var(--brand-primary)]'
                  }`}
                >
                  {job?.status || 'queued'}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Created', job?.created_count ?? 0],
                  ['Updated', job?.updated_count ?? 0],
                  ['Skipped', job?.skipped_count ?? 0],
                  ['Failed', job?.failed_count ?? 0],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-xl bg-slate-50 px-3 py-2 text-center"
                  >
                    <div className="text-lg font-bold text-slate-900">
                      {value}
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
              {job?.error ? (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {job.error}
                </p>
              ) : null}
              {job?.results && job.results.length > 0 ? (
                <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-100">
                  <ul className="divide-y divide-slate-100 text-sm">
                    {job.results.map((r) => (
                      <li key={r.source_product_id} className="px-3 py-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-slate-800">
                            {r.product_name}
                          </span>
                          <span className="shrink-0 text-xs font-semibold uppercase text-slate-500">
                            {r.action}
                          </span>
                        </div>
                        {r.reasons?.length ? (
                          <ul className="mt-1 list-inside list-disc text-xs text-slate-500">
                            {r.reasons.slice(0, 4).map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                            {r.reasons.length > 4 ? (
                              <li>+{r.reasons.length - 4} more</li>
                            ) : null}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
