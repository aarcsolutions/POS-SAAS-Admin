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
} from 'lucide-react';
import UserForm from '@/components/users/UserForm';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/hooks/users';
import { useRolesQuery } from '@/hooks/roles';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { ApiUser } from '@/types/rbac.types';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 10;

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.users.create);
  const canUpdate = usePermission(ENTITY_PERMS.users.update);
  const canDelete = usePermission(ENTITY_PERMS.users.delete);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useUsersQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
  });
  // Keep at limit 100 for the role dropdown in the user form.
  const { data: rolesData } = useRolesQuery({ page: 1, limit: 100 });
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();

  const users = extractListItems<ApiUser>(data, 'users');
  const pagination = extractPagination(data, LIMIT);

  const roles = rolesData?.data?.roles ?? [];

  const handleOpenForm = (mode: 'create' | 'edit' | 'view', user?: ApiUser) => {
    setFormMode(mode);
    setSelectedUser(user || null);
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete User',
      message: 'Delete this user?',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  if (formMode) {
    return (
      <UserForm
        mode={formMode}
        roles={roles}
        initialData={
          selectedUser
            ? {
                name: selectedUser.name,
                email: selectedUser.email,
                roleId: selectedUser.role?.id || selectedUser.role_id || '',
              }
            : undefined
        }
        saving={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormMode(null)}
        onSubmit={async (payload) => {
          if (formMode === 'create') {
            await createMutation.mutateAsync({
              name: payload.name,
              email: payload.email,
              password: payload.password!,
              roleId: payload.roleId,
            });
          } else if (formMode === 'edit' && selectedUser) {
            await updateMutation.mutateAsync({
              id: selectedUser.id,
              name: payload.name,
              email: payload.email,
              roleId: payload.roleId,
              ...(payload.password ? { password: payload.password } : {}),
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
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage users inside this tenant
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Add User
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users by name or email..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">User</th>
              <th className="px-5 py-3 font-bold">Role</th>
              <th className="px-5 py-3 font-bold">Created</th>
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
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {user.role?.title || '—'}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        user.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RowActionsMenu
                      open={dropdownOpen === user.id}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? user.id : null)
                      }
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenForm('view', user)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => handleOpenForm('edit', user)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
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
        label="users"
        disabled={isLoading || isFetching}
      />
    </div>
  );
}
