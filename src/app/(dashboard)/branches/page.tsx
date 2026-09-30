'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Check,
  Store,
  Send,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import BranchForm from '@/components/branches/BranchForm';
import BranchDetail from '@/components/branches/BranchDetail';
import RequestBranchesModal from '@/components/branches/RequestBranchesModal';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import { confirmDialog } from '@/store/dialogStore';
import {
  useBranchesQuery,
  useBranchLicenseQuery,
  useBranchLicensedCatalogQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useDeactivateBranchMutation,
  useActivateBranchMutation,
  useRequestBranchesMutation,
} from '@/hooks/branches';
import { branchesApi } from '@/services/branches';
import Link from 'next/link';
import type {
  Branch,
  BranchCreateBootstrapPayload,
  BranchModuleOption,
} from '@/types/branch.types';
import { INVENTORY_BRANCH_PICKER_HIDDEN_SLUGS, FINANCE_BRANCH_PICKER_HIDDEN_SLUGS } from '@/data/sidebar';

function mapApiBranch(raw: any): Branch {
  const purging = !!raw.purge_job_id;
  const modules = (raw.modules || []).filter(
    (m: any) => m.slug !== 'branches'
  );
  const inventoryParent = modules.find((m: any) => m.slug === 'inventory');
  const inventoryChildOn = modules.some((m: any) =>
    (INVENTORY_BRANCH_PICKER_HIDDEN_SLUGS as readonly string[]).includes(m.slug)
  );
  const financeParent = modules.find((m: any) => m.slug === 'finance');
  const financeChildOn = modules.some((m: any) =>
    (FINANCE_BRANCH_PICKER_HIDDEN_SLUGS as readonly string[]).includes(m.slug)
  );
  // Picker only shows Inventory / Finance Management — collapse children into parent
  const pickerModules = modules.filter(
    (m: any) =>
      !(INVENTORY_BRANCH_PICKER_HIDDEN_SLUGS as readonly string[]).includes(
        m.slug
      ) &&
      !(FINANCE_BRANCH_PICKER_HIDDEN_SLUGS as readonly string[]).includes(m.slug)
  );
  if (inventoryChildOn && inventoryParent) {
    // ensure parent id present when only children were stored historically
    if (!pickerModules.some((m: any) => m.id === inventoryParent.id)) {
      pickerModules.push(inventoryParent);
    }
  } else if (inventoryChildOn && !inventoryParent) {
    // orphan children without parent row — surface as inventory if we can find title
    // (parent missing: leave children filtered out; user must re-enable Inventory)
  }
  if (financeChildOn && financeParent) {
    if (!pickerModules.some((m: any) => m.id === financeParent.id)) {
      pickerModules.push(financeParent);
    }
  }

  return {
    id: raw.id,
    name: raw.name,
    code: raw.code,
    address: raw.address || '',
    phone: raw.phone || '',
    status: purging
      ? 'deleting'
      : raw.is_active === false
        ? 'inactive'
        : 'active',
    purgeJobId: raw.purge_job_id || null,
    enabledModuleIds: pickerModules.map((m: any) => m.id),
    enabledModuleTitles: pickerModules.map(
      (m: any) => m.title || m.slug
    ),
    roleTitle: raw.role?.title || raw.roleTitle || 'Branch Admin',
    permissionIds: Array.isArray(raw.permissionIds)
      ? raw.permissionIds
      : [],
    adminName: raw.adminUser?.name || raw.adminName || '',
    adminEmail: raw.adminUser?.email || raw.adminEmail || '',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

export default function BranchesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  /** Local optimistic ids so loader shows instantly without blocking the page */
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const knownDeletingRef = useRef<Map<string, string>>(new Map());

  const listParams = {
    page: 1,
    limit: 100,
    search: searchQuery || undefined,
  };

  const { data: listRes, isLoading } = useBranchesQuery(listParams, {
    // Background poll only while a purge is running — does not block UI
    refetchInterval: (query) => {
      const payload = query.state.data as any;
      const rows =
        payload?.data?.data ||
        payload?.data?.branches ||
        (Array.isArray(payload?.data) ? payload.data : []) ||
        [];
      const serverPurging = (rows as any[]).some((r) => !!r.purge_job_id);
      return serverPurging || pendingDeleteIds.length > 0 ? 2500 : false;
    },
  });
  const { data: licenseRes } = useBranchLicenseQuery();
  const { data: catalogRes, isLoading: catalogLoading, isError: catalogError } =
    useBranchLicensedCatalogQuery(true);
  const createMutation = useCreateBranchMutation();
  const updateMutation = useUpdateBranchMutation();
  const deleteMutation = useDeleteBranchMutation();
  const deactivateMutation = useDeactivateBranchMutation();
  const activateMutation = useActivateBranchMutation();
  const requestMutation = useRequestBranchesMutation();

  const branches: Branch[] = useMemo(() => {
    const rows =
      listRes?.data?.data ||
      listRes?.data?.branches ||
      (Array.isArray(listRes?.data) ? listRes.data : []) ||
      [];
    return (rows as any[]).map((raw) => {
      const mapped = mapApiBranch(raw);
      if (pendingDeleteIds.includes(mapped.id) && mapped.status !== 'deleting') {
        return { ...mapped, status: 'deleting' as const };
      }
      return mapped;
    });
  }, [listRes, pendingDeleteIds]);

  // When a deleting branch disappears or fails, notify — without blocking the user
  useEffect(() => {
    const currentIds = new Set(branches.map((b) => b.id));
    const deletingNow = new Map<string, string>();

    for (const b of branches) {
      if (b.status === 'deleting') {
        deletingNow.set(b.id, b.name);
        knownDeletingRef.current.set(b.id, b.name);
      }
    }

    for (const [id, name] of knownDeletingRef.current) {
      if (!currentIds.has(id)) {
        toast.success(`“${name}” permanently deleted`);
        knownDeletingRef.current.delete(id);
        setPendingDeleteIds((prev) => prev.filter((x) => x !== id));
      } else if (!deletingNow.has(id)) {
        // Row still there but no longer purging → job failed / unlocked
        toast.error(
          `Permanent delete failed for “${name}”. You can retry.`
        );
        knownDeletingRef.current.delete(id);
        setPendingDeleteIds((prev) => prev.filter((x) => x !== id));
      }
    }
  }, [branches]);

  const licensedBranches =
    licenseRes?.data?.licensed_branches ?? licenseRes?.data?.licensedBranches ?? 1;
  const currentCount =
    licenseRes?.data?.current_branches ?? branches.length;
  const atLicenseCap =
    licenseRes?.data?.can_create === false || currentCount >= licensedBranches;

  const licensedModules: BranchModuleOption[] = useMemo(() => {
    const mods =
      catalogRes?.data?.modulesWithPermissions ||
      catalogRes?.data?.modulesWithPermisssions ||
      [];
    return (mods as any[])
      .filter(
        (m) =>
          m.slug !== 'branches' &&
          !(INVENTORY_BRANCH_PICKER_HIDDEN_SLUGS as readonly string[]).includes(
            m.slug
          ) &&
          !(FINANCE_BRANCH_PICKER_HIDDEN_SLUGS as readonly string[]).includes(
            m.slug
          )
      )
      .map((m) => ({
        id: m.id,
        title: m.title,
        slug: m.slug,
        permissions: (m.permissions || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          is_allowed: false,
        })),
      }));
  }, [catalogRes]);

  const handleOpenAdd = () => {
    if (atLicenseCap) {
      toast.error('You are not allowed to create more branches');
      return;
    }
    if (catalogError) {
      toast.error('Could not load licensed modules. Restart system-users and retry.');
      return;
    }
    setEditingBranch(null);
    setShowForm(true);
  };

  const loadBranchForEdit = async (branchId: string) => {
    setEditLoading(true);
    try {
      const res = await branchesApi.getById(branchId);
      const raw = res?.data ?? res;
      if (!raw?.id) {
        toast.error('Failed to load branch details');
        return;
      }
      setEditingBranch(mapApiBranch(raw));
      setShowDetail(false);
      setSelectedBranch(null);
      setShowForm(true);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to load branch for edit'
      );
    } finally {
      setEditLoading(false);
    }
  };

  const loadBranchForDetail = async (branchId: string) => {
    setEditLoading(true);
    try {
      const res = await branchesApi.getById(branchId);
      const raw = res?.data ?? res;
      if (!raw?.id) {
        toast.error('Failed to load branch details');
        return;
      }
      setSelectedBranch(mapApiBranch(raw));
      setShowDetail(true);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to load branch details'
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleSubmit = async (payload: BranchCreateBootstrapPayload) => {
    if (editingBranch) {
      await updateMutation.mutateAsync({
        id: editingBranch.id,
        ...payload,
        moduleIds: payload.enabledModuleIds,
        permissionIds: payload.permissionIds,
      });
      setShowForm(false);
      setEditingBranch(null);
      return;
    }
    await createMutation.mutateAsync({
      ...payload,
      moduleIds: payload.enabledModuleIds,
      permissionIds: payload.permissionIds,
    });
    setShowForm(false);
    setEditingBranch(null);
  };

  if (editLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  if (showForm) {
    return (
      <BranchForm
        key={editingBranch?.id || 'create'}
        mode={editingBranch ? 'edit' : 'create'}
        initialData={editingBranch || undefined}
        licensedModules={licensedModules}
        catalogLoading={catalogLoading}
        onClose={() => {
          setShowForm(false);
          setEditingBranch(null);
        }}
        onSubmit={handleSubmit}
      />
    );
  }

  if (showDetail && selectedBranch) {
    return (
      <BranchDetail
        branch={selectedBranch}
        onClose={() => {
          setShowDetail(false);
          setSelectedBranch(null);
        }}
        onEdit={(branch) => {
          void loadBranchForEdit(branch.id);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Branch Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Licensed branches: {currentCount}/{licensedBranches}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/branches/history"
            className="flex items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Deleted History
          </Link>
          {atLicenseCap && (
            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--brand-icon-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-icon)] transition hover:bg-[var(--brand-icon-soft)]"
            >
              <Send className="h-4 w-4" />
              Request Branches
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenAdd}
            aria-disabled={atLicenseCap}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
              atLicenseCap
                ? 'cursor-not-allowed bg-[var(--brand-primary)]/50'
                : 'bg-[var(--brand-primary)] shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] hover:brightness-95'
            }`}
          >
            <Plus className="h-4 w-4" />
            Add Branch
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Branches</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {branches.length}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <Check className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Active</div>
          <div className="mt-1 text-2xl font-bold text-[var(--brand-primary)]">
            {branches.filter((b) => b.status === 'active').length}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Licensed Cap</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{licensedBranches}</div>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or code..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-primary)]" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Branch</th>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Branch Admin</th>
                <th className="px-5 py-4">Modules</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {branches.map((branch) => (
                <tr key={branch.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                        <Store className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{branch.name}</div>
                        <div className="max-w-[200px] truncate text-xs text-slate-400">
                          {branch.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-600">{branch.code}</td>
                  <td className="px-5 py-4 text-slate-600">{branch.phone}</td>
                  <td className="px-5 py-4">
                    <div className="text-slate-700">{branch.adminName || '—'}</div>
                    <div className="text-xs text-slate-400">{branch.adminEmail}</div>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                    {branch.enabledModuleTitles.length} enabled
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        branch.status === 'active'
                          ? 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]'
                          : branch.status === 'deleting'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {branch.status === 'deleting' && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                      {branch.status === 'active'
                        ? 'Active'
                        : branch.status === 'deleting'
                          ? 'Deleting…'
                          : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RowActionsMenu
                      open={dropdownOpen === branch.id}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? branch.id : null)
                      }
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(null);
                          void loadBranchForDetail(branch.id);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      {branch.status === 'deleting' ? (
                        <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-amber-700">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Permanent delete in progress…
                        </div>
                      ) : branch.status === 'active' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setDropdownOpen(null);
                              void loadBranchForEdit(branch.id);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit Branch
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDropdownOpen(null);
                              void (async () => {
                                const ok = await confirmDialog({
                                  title: 'Deactivate Branch',
                                  message:
                                    'Deactivate this branch? Staff will lose access. Data stays in place and you can activate it again later.',
                                  confirmLabel: 'Deactivate',
                                  variant: 'danger',
                                });
                                if (!ok) return;
                                deactivateMutation.mutate(branch.id);
                              })();
                            }}
                            disabled={deactivateMutation.isPending}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                          >
                            <Store className="h-4 w-4" />
                            Deactivate Branch
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(null);
                            if (atLicenseCap) {
                              toast.error(
                                'You are not allowed to activate more branches'
                              );
                              return;
                            }
                            activateMutation.mutate(branch.id);
                          }}
                          disabled={activateMutation.isPending}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)] disabled:opacity-60"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Activate Branch
                        </button>
                      )}
                      {branch.status !== 'deleting' && (
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(null);
                          void (async () => {
                            try {
                              const check = await branchesApi.purgeCheck(
                                branch.id
                              );
                              const payload = check?.data || check;
                              if (payload?.canDelete === false) {
                                const reason =
                                  payload?.reasons?.[0]?.message ||
                                  'This branch cannot be permanently deleted right now.';
                                toast.error(reason);
                                return;
                              }
                            } catch (err: any) {
                              toast.error(
                                err?.response?.data?.message ||
                                  'Could not verify branch delete eligibility'
                              );
                              return;
                            }
                            const ok = await confirmDialog({
                              title: 'Permanently Delete Branch',
                              message:
                                'This will archive historical sales data, then permanently remove the branch and its live data. This cannot be undone.',
                              confirmLabel: 'Permanently Delete',
                              variant: 'danger',
                            });
                            if (!ok) return;
                            setPendingDeleteIds((prev) =>
                              prev.includes(branch.id)
                                ? prev
                                : [...prev, branch.id]
                            );
                            knownDeletingRef.current.set(
                              branch.id,
                              branch.name
                            );
                            deleteMutation.mutate(branch.id, {
                              onError: () => {
                                setPendingDeleteIds((prev) =>
                                  prev.filter((x) => x !== branch.id)
                                );
                                knownDeletingRef.current.delete(branch.id);
                              },
                            });
                          })();
                        }}
                        disabled={
                          deleteMutation.isPending &&
                          deleteMutation.variables === branch.id
                        }
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        Permanently Delete Branch
                      </button>
                      )}
                    </RowActionsMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && branches.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            No branches found.
          </div>
        )}
      </div>

      <RequestBranchesModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        licensedBranches={licensedBranches}
        currentBranchCount={currentCount}
        onSubmit={({ requestedCount, message }) => {
          requestMutation.mutate({ requestedCount, message });
        }}
      />
    </div>
  );
}
