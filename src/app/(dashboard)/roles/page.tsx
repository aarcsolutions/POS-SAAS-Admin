'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Shield,
  Loader2,
} from 'lucide-react';
import RoleForm from '@/components/roles/RoleForm';
import RolePermissions from '@/components/roles/RolePermissions';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/hooks/roles';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { Role } from '@/types/rbac.types';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 10;

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissionsRole, setPermissionsRole] = useState<Role | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.roles.create);
  const canUpdate = usePermission(ENTITY_PERMS.roles.update);
  const canDelete = usePermission(ENTITY_PERMS.roles.delete);
  const canManagePerms = usePermission(ENTITY_PERMS.roles.extras.updateRolePerms);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useRolesQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
  });
  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();
  const deleteMutation = useDeleteRoleMutation();

  const roles = extractListItems<Role>(data, 'roles');
  const pagination = extractPagination(data, LIMIT);

  const handleOpenForm = (mode: 'create' | 'edit' | 'view', role?: Role) => {
    setFormMode(mode);
    setSelectedRole(role || null);
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete Role',
      message: 'Delete this role?',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  if (permissionsRole) {
    return (
      <RolePermissions
        roleId={permissionsRole.id}
        roleTitle={permissionsRole.title}
        onClose={() => setPermissionsRole(null)}
      />
    );
  }

  if (formMode === 'create') {
    return (
      <RoleForm
        mode="create"
        onClose={() => setFormMode(null)}
        onSubmit={async (title) => {
          await createMutation.mutateAsync({ title });
          setFormMode(null);
        }}
        saving={createMutation.isPending}
      />
    );
  }

  if (formMode === 'edit' && selectedRole) {
    return (
      <RoleForm
        mode="edit"
        initialTitle={selectedRole.title}
        onClose={() => setFormMode(null)}
        onSubmit={async (title) => {
          await updateMutation.mutateAsync({ id: selectedRole.id, title });
          setFormMode(null);
        }}
        saving={updateMutation.isPending}
      />
    );
  }

  if (formMode === 'view' && selectedRole) {
    return (
      <RoleForm
        mode="view"
        initialTitle={selectedRole.title}
        onClose={() => setFormMode(null)}
        onSubmit={async () => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Roles & Access Control
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage tenant roles and permission mapping
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Add Role
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roles..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Role</th>
              <th className="px-5 py-3 font-bold">Slug</th>
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
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  No roles found.
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      {role.title}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{role.slug}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {new Date(role.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      Active
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RowActionsMenu
                      open={dropdownOpen === role.id}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? role.id : null)
                      }
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenForm('view', role)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => handleOpenForm('edit', role)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      )}
                      {canManagePerms && (
                        <button
                          type="button"
                          onClick={() => {
                            setPermissionsRole(role);
                            setDropdownOpen(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Shield className="h-4 w-4" /> Permissions
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(role.id)}
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
        label="roles"
        disabled={isLoading || isFetching}
      />
    </div>
  );
}
