'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import CustomerForm from '@/components/customers/CustomerForm';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from '@/hooks/customers';
import { useBranchesQuery } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAuthStore } from '@/store/authStore';
import { extractListItems, extractPagination, formatDate } from '@/utils/helpers';
import { Customer } from '@/types/customer.types';
import { confirmDialog } from '@/store/dialogStore';
import { customersApi } from '@/services/customers';

const LIMIT = 10;

function mapCustomerToFormData(customer: Customer) {
  return {
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone,
    address: customer.address || '',
    city: customer.city || '',
    notes: customer.notes || '',
    gender_id: customer.gender_id || '',
    date_of_birth: customer.date_of_birth
      ? customer.date_of_birth.slice(0, 10)
      : '',
    marketing_subscribed: customer.marketing_subscribed ?? false,
    is_active: customer.is_active,
  };
}

export default function CustomersPage() {
  const user = useAuthStore((s) => s.user);
  const isTenantAdmin = !user?.branchId;

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [formLoading, setFormLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.customers.create);
  const canUpdate = usePermission(ENTITY_PERMS.customers.update);
  const canDelete = usePermission(ENTITY_PERMS.customers.delete);

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

  const { data, isLoading, isFetching } = useCustomersQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    branch_id: isTenantAdmin && branchFilter ? branchFilter : undefined,
  });
  const createMutation = useCreateCustomerMutation();
  const updateMutation = useUpdateCustomerMutation();
  const deleteMutation = useDeleteCustomerMutation();

  const customers = extractListItems<Customer>(data, 'customers');
  const pagination = extractPagination(data, LIMIT);
  const colSpan = isTenantAdmin ? 9 : 8;

  const handleOpenForm = async (
    mode: 'create' | 'edit' | 'view',
    customer?: Customer
  ) => {
    setDropdownOpen(null);
    if (mode === 'create') {
      setSelectedCustomer(null);
      setFormMode('create');
      return;
    }
    if (!customer) return;

    setFormLoading(true);
    try {
      const res = await customersApi.getById(customer.id);
      const raw = (res?.data ?? res) as Customer;
      if (!raw?.id) {
        toast.error('Failed to load customer details');
        return;
      }
      setSelectedCustomer(raw);
      setFormMode(mode);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to load customer details'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete Customer',
      message: 'Delete this customer?',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  if (formLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  if (formMode) {
    return (
      <CustomerForm
        key={selectedCustomer?.id || 'create'}
        mode={formMode}
        initialData={
          selectedCustomer
            ? mapCustomerToFormData(selectedCustomer)
            : undefined
        }
        saving={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormMode(null)}
        onSubmit={async (payload) => {
          if (formMode === 'create') {
            await createMutation.mutateAsync(payload);
          } else if (formMode === 'edit' && selectedCustomer) {
            await updateMutation.mutateAsync({
              id: selectedCustomer.id,
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
            Customers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage customer contacts for this tenant
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" /> Add Customer
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, email, or city..."
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
              options={[
                { value: 'tenant', label: 'Tenant-level' },
                ...branchOptions,
              ]}
            />
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Customer</th>
              <th className="px-5 py-3 font-bold">Phone</th>
              <th className="px-5 py-3 font-bold">Gender</th>
              <th className="px-5 py-3 font-bold">DOB</th>
              <th className="px-5 py-3 font-bold">Marketing</th>
              <th className="px-5 py-3 font-bold">Location</th>
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
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-slate-400">
                  <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-[var(--brand-icon)]">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">
                          {c.name}
                        </div>
                        {c.email ? (
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Mail className="h-3 w-3" />
                            {c.email}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-300">No email</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {c.phone}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {c.gender_title || '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {c.date_of_birth ? formatDate(c.date_of_birth) : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        c.marketing_subscribed
                          ? 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.marketing_subscribed ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {c.city || c.address ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {[c.city, c.address].filter(Boolean).join(' · ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  {isTenantAdmin && (
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          c.branch_id
                            ? 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.branch_name || (c.branch_id ? 'Branch' : 'Tenant')}
                      </span>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        c.is_active
                          ? 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RowActionsMenu
                      open={dropdownOpen === c.id}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? c.id : null)
                      }
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenForm('view', c)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => handleOpenForm('edit', c)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
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
        label="customers"
        disabled={isLoading || isFetching}
      />
    </div>
  );
}
