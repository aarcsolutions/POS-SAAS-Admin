'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Truck,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  PackagePlus,
  Link2,
  ClipboardList,
} from 'lucide-react';
import SupplierForm from '@/components/suppliers/SupplierForm';
import AssignMaterialsPanel from '@/components/suppliers/AssignMaterialsPanel';
import PurchaseForm from '@/components/suppliers/PurchaseForm';
import PurchaseReceipt from '@/components/suppliers/PurchaseReceipt';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  usePurchasesQuery,
} from '@/hooks/suppliers';
import { useBranchesQuery } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAuthStore } from '@/store/authStore';
import { extractListItems, extractPagination } from '@/utils/helpers';
import {
  PurchaseRow,
  PurchaseStatus,
  SupplierRow,
} from '@/types/supplier.types';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 10;

const STATUS_BADGE: Record<PurchaseStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  ordered: 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]',
  received: 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]',
  cancelled: 'bg-rose-100 text-rose-700',
};

export default function SuppliersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <SuppliersPageInner />
    </Suspense>
  );
}

function SuppliersPageInner() {
  const user = useAuthStore((s) => s.user);
  const isTenantAdmin = !user?.branchId;
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [poSearchTerm, setPoSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage] = useState(1);
  const [poPage, setPoPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [assignMode, setAssignMode] = useState(false);
  const [createPoMode, setCreatePoMode] = useState(false);
  const [initialPoMaterialIds, setInitialPoMaterialIds] = useState<string[]>(
    []
  );
  const [receiptPurchase, setReceiptPurchase] = useState<PurchaseRow | null>(
    null
  );
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierRow | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [queryHandled, setQueryHandled] = useState(false);

  const canCreate = usePermission(ENTITY_PERMS.suppliers.create);
  const canUpdate = usePermission(ENTITY_PERMS.suppliers.update);
  const canDelete = usePermission(ENTITY_PERMS.suppliers.delete);
  const canPurchase = usePermission(
    ENTITY_PERMS.suppliers.extras.createPurchase
  );
  const canListPurchases = usePermission(
    ENTITY_PERMS.suppliers.extras.getAllPurchases
  );
  const canAssign = usePermission(
    ENTITY_PERMS.suppliers.extras.assignRawMaterials
  );

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);
  const debouncedPoSearch = useDebouncedValue(poSearchTerm.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, branchFilter]);
  useEffect(() => {
    setPoPage(1);
  }, [debouncedPoSearch, branchFilter]);

  useEffect(() => {
    if (queryHandled) return;
    const createPo = searchParams.get('createPo');
    if (createPo === '1' && canPurchase) {
      const materialsParam = searchParams.get('materials') || '';
      const ids = materialsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      setInitialPoMaterialIds(ids);
      setCreatePoMode(true);
      setFormMode(null);
      setAssignMode(false);
      setReceiptPurchase(null);
    }
    setQueryHandled(true);
  }, [searchParams, canPurchase, queryHandled]);

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

  const { data, isLoading, isFetching } = useSuppliersQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin && branchFilter ? branchFilter : undefined,
  });

  const { data: purchasesRes, isLoading: purchasesLoading, isFetching: purchasesFetching } =
    usePurchasesQuery(
      {
        page: poPage,
        limit: LIMIT,
        search: debouncedPoSearch || undefined,
        branch_id: isTenantAdmin && branchFilter ? branchFilter : undefined,
      },
      canListPurchases
    );

  const createMutation = useCreateSupplierMutation();
  const updateMutation = useUpdateSupplierMutation();
  const deleteMutation = useDeleteSupplierMutation();

  const suppliers = extractListItems<SupplierRow>(data, 'suppliers');
  const pagination = extractPagination(data, LIMIT);
  const purchases = extractListItems<PurchaseRow>(purchasesRes, 'purchases');
  const purchasesPagination = extractPagination(purchasesRes, LIMIT);
  const colSpan = isTenantAdmin ? 6 : 5;

  const resetPanels = () => {
    setFormMode(null);
    setAssignMode(false);
    setCreatePoMode(false);
    setReceiptPurchase(null);
    setSelectedSupplier(null);
    setInitialPoMaterialIds([]);
  };

  const handleOpenForm = (
    mode: 'create' | 'edit' | 'view',
    supplier?: SupplierRow
  ) => {
    resetPanels();
    setFormMode(mode);
    setSelectedSupplier(supplier || null);
    setDropdownOpen(null);
  };

  const handleOpenAssign = (supplier: SupplierRow) => {
    resetPanels();
    setSelectedSupplier(supplier);
    setAssignMode(true);
    setDropdownOpen(null);
  };

  const handleOpenCreatePo = (materialIds: string[] = []) => {
    resetPanels();
    setInitialPoMaterialIds(materialIds);
    setCreatePoMode(true);
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete Supplier',
      message: 'Delete this supplier? Existing purchase orders are kept.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  if (receiptPurchase) {
    return (
      <PurchaseReceipt
        purchase={receiptPurchase}
        onClose={() => setReceiptPurchase(null)}
      />
    );
  }

  if (createPoMode && canPurchase) {
    return (
      <PurchaseForm
        initialMaterialIds={initialPoMaterialIds}
        onClose={resetPanels}
        onCreated={(purchase) => {
          setCreatePoMode(false);
          setInitialPoMaterialIds([]);
          if (purchase?.id) setReceiptPurchase(purchase);
          else resetPanels();
        }}
      />
    );
  }

  if (assignMode && selectedSupplier && canAssign) {
    return (
      <AssignMaterialsPanel
        supplier={selectedSupplier}
        onClose={resetPanels}
      />
    );
  }

  if (formMode) {
    return (
      <SupplierForm
        mode={formMode}
        showBranchSelect={isTenantAdmin}
        branchOptions={branchOptions}
        initialData={
          selectedSupplier
            ? {
                name: selectedSupplier.name,
                phone: selectedSupplier.phone || '',
                email: selectedSupplier.email || '',
                address: selectedSupplier.address || '',
                branch_id: selectedSupplier.branch_id || '',
              }
            : undefined
        }
        saving={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormMode(null)}
        onSubmit={async (payload) => {
          if (formMode === 'create') {
            await createMutation.mutateAsync(payload);
          } else if (formMode === 'edit' && selectedSupplier) {
            await updateMutation.mutateAsync({
              id: selectedSupplier.id,
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Suppliers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage suppliers, material mappings, and purchase orders
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canPurchase && (
            <button
              onClick={() => handleOpenCreatePo()}
              className="flex items-center gap-2 rounded-xl border border-[var(--brand-primary-soft)] bg-[var(--brand-primary-soft)] px-4 py-2.5 text-sm font-bold text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary-soft)]"
            >
              <ClipboardList className="h-4 w-4" /> Create Purchase Order
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => handleOpenForm('create')}
              className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95"
            >
              <Plus className="h-4 w-4" /> Add Supplier
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, email, or address..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
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
              <th className="px-5 py-3 font-bold">Supplier</th>
              <th className="px-5 py-3 font-bold">Phone</th>
              <th className="px-5 py-3 font-bold">Email</th>
              <th className="px-5 py-3 font-bold">Address</th>
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
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-slate-400">
                  <Truck className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No suppliers found
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800">{s.name}</div>
                    {s.created_at && (
                      <div className="mt-0.5 text-xs text-slate-400">
                        Added {new Date(s.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {s.phone || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {s.email || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {s.address || <span className="text-slate-300">—</span>}
                  </td>
                  {isTenantAdmin && (
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-[var(--brand-primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                        {s.branch_name || 'Tenant'}
                      </span>
                    </td>
                  )}
                  <td className="px-5 py-4 text-right">
                    <RowActionsMenu
                      open={dropdownOpen === s.id}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? s.id : null)
                      }
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenForm('view', s)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => handleOpenForm('edit', s)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      )}
                      {canAssign && (
                        <button
                          type="button"
                          onClick={() => handleOpenAssign(s)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Link2 className="h-4 w-4" /> Assign materials
                        </button>
                      )}
                      {canPurchase && (
                        <button
                          type="button"
                          onClick={() => handleOpenCreatePo()}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)]"
                        >
                          <PackagePlus className="h-4 w-4" /> Create PO
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
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

      {canListPurchases && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Recent purchase orders
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Click a row to open the receipt and manage status
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={poSearchTerm}
                onChange={(e) => setPoSearchTerm(e.target.value)}
                placeholder="Search PO #, supplier, status..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
              />
            </div>
          </div>
          {purchasesLoading || purchasesFetching ? (
            <div className="flex justify-center py-10 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : purchases.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              {debouncedPoSearch
                ? 'No purchase orders match your search'
                : 'No purchase orders yet'}
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-bold">PO #</th>
                  <th className="px-5 py-3 font-bold">Supplier</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Items</th>
                  <th className="px-5 py-3 font-bold">Total</th>
                  <th className="px-5 py-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => setReceiptPurchase(p)}
                  >
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {p.po_number || p.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {p.supplier_name || p.supplier_id}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_BADGE[p.status] || STATUS_BADGE.draft}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {p.items?.length ?? 0}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {Number(p.total_amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="border-t border-slate-100 px-5 py-3">
            <ListPager
              page={poPage}
              totalPages={purchasesPagination.totalPages}
              total={purchasesPagination.total}
              limit={LIMIT}
              onPageChange={setPoPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
