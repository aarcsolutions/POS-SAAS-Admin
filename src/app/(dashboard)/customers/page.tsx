'use client';

import { useEffect, useState } from 'react';
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
import CustomerForm from '@/components/customers/CustomerForm';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from '@/hooks/customers';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { Customer } from '@/types/customer.types';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 10;

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.customers.create);
  const canUpdate = usePermission(ENTITY_PERMS.customers.update);
  const canDelete = usePermission(ENTITY_PERMS.customers.delete);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useCustomersQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
  });
  const createMutation = useCreateCustomerMutation();
  const updateMutation = useUpdateCustomerMutation();
  const deleteMutation = useDeleteCustomerMutation();

  const customers = extractListItems<Customer>(data, 'customers');
  const pagination = extractPagination(data, LIMIT);

  const handleOpenForm = (
    mode: 'create' | 'edit' | 'view',
    customer?: Customer
  ) => {
    setFormMode(mode);
    setSelectedCustomer(customer || null);
    setDropdownOpen(null);
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

  if (formMode) {
    return (
      <CustomerForm
        mode={formMode}
        initialData={
          selectedCustomer
            ? {
                name: selectedCustomer.name,
                email: selectedCustomer.email || '',
                phone: selectedCustomer.phone,
                address: selectedCustomer.address || '',
                city: selectedCustomer.city || '',
                notes: selectedCustomer.notes || '',
                is_active: selectedCustomer.is_active,
              }
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
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Add Customer
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, phone, email, or city..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Customer</th>
              <th className="px-5 py-3 font-bold">Phone</th>
              <th className="px-5 py-3 font-bold">Location</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
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
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        c.is_active
                          ? 'bg-emerald-100 text-emerald-700'
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
