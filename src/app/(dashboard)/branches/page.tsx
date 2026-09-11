'use client';

import { useMemo, useState } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import BranchForm from '@/components/branches/BranchForm';
import BranchDetail from '@/components/branches/BranchDetail';
import RequestBranchesModal from '@/components/branches/RequestBranchesModal';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import {
  useBranchesQuery,
  useBranchLicenseQuery,
  useBranchLicensedCatalogQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useRequestBranchesMutation,
} from '@/hooks/branches';
import { branchesApi } from '@/services/branches';
import type {
  Branch,
  BranchCreateBootstrapPayload,
  BranchModuleOption,
} from '@/types/branch.types';

function mapApiBranch(raw: any): Branch {
  return {
    id: raw.id,
    name: raw.name,
    code: raw.code,
    address: raw.address || '',
    phone: raw.phone || '',
    status: raw.is_active === false ? 'inactive' : 'active',
    enabledModuleIds: (raw.modules || []).map((m: any) => m.id),
    enabledModuleTitles: (raw.modules || []).map((m: any) => m.title || m.slug),
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

  const { data: listRes, isLoading } = useBranchesQuery({
    page: 1,
    limit: 100,
    search: searchQuery || undefined,
  });
  const { data: licenseRes } = useBranchLicenseQuery();
  const { data: catalogRes, isLoading: catalogLoading, isError: catalogError } =
    useBranchLicensedCatalogQuery(true);
  const createMutation = useCreateBranchMutation();
  const updateMutation = useUpdateBranchMutation();
  const deleteMutation = useDeleteBranchMutation();
  const requestMutation = useRequestBranchesMutation();

  const branches: Branch[] = useMemo(() => {
    const rows =
      listRes?.data?.data ||
      listRes?.data?.branches ||
      (Array.isArray(listRes?.data) ? listRes.data : []) ||
      [];
    return (rows as any[]).map(mapApiBranch);
  }, [listRes]);

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
    return (mods as any[]).map((m) => ({
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
          <div className="mt-1 text-2xl font-bold text-slate-900">{currentCount}</div>
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
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        branch.status === 'active'
                          ? 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {branch.status === 'active' ? 'Active' : 'Inactive'}
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
                          deleteMutation.mutate(branch.id);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Branch
                      </button>
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
