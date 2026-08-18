'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Lock,
  Loader2,
} from 'lucide-react';
import PermissionForm, {
  PermissionFormData,
} from '@/components/permissions/PermissionForm';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  usePermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} from '@/hooks/permissions';
import { useModulesQuery } from '@/hooks/modules';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 15;

type PermissionRow = {
  id: string;
  title: string;
  slug: string;
  module_id: string;
  module_title: string;
  description: string;
};

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selected, setSelected] = useState<PermissionRow | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.permissions.create);
  const canUpdate = usePermission(ENTITY_PERMS.permissions.update);
  const canDelete = usePermission(ENTITY_PERMS.permissions.delete);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, moduleFilter]);

  const modulesQuery = useModulesQuery({ page: 1, limit: 100 });
  const moduleOptions = useMemo(
    () =>
      extractListItems<any>(modulesQuery.data, 'modules')
        .map((m: any) => ({
          id: m.id as string,
          title: (m.title || m.name || m.slug || '') as string,
        }))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [modulesQuery.data]
  );

  const listParams = {
    page,
    limit: LIMIT,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(moduleFilter ? { moduleId: moduleFilter } : {}),
  };

  const { data, isLoading, isFetching } = usePermissionsQuery(listParams);
  const createMutation = useCreatePermissionMutation();
  const updateMutation = useUpdatePermissionMutation();
  const deleteMutation = useDeletePermissionMutation();

  const permissions = extractListItems<any>(data, 'permissions').map(
    (p: any): PermissionRow => ({
      id: p.id,
      title: p.title || p.slug || 'Untitled',
      slug: p.slug || '',
      module_id: p.module_id || p.module?.id || '',
      module_title: p.module?.title || p.module?.name || 'Unknown',
      description: p.description || '',
    })
  );
  const pagination = extractPagination(data, LIMIT);

  const handleOpenForm = (
    mode: 'create' | 'edit' | 'view',
    perm?: PermissionRow
  ) => {
    setFormMode(mode);
    setSelected(perm || null);
    setDropdownOpen(null);
  };

  const handleDelete = async (perm: PermissionRow) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete Permission',
      message: `Delete permission "${perm.title}"?`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(perm.id);
  };

  if (formMode) {
    const initialData: PermissionFormData | undefined = selected
      ? {
          title: selected.title,
          slug: selected.slug,
          moduleId: selected.module_id,
          description: selected.description,
        }
      : undefined;

    return (
      <PermissionForm
        mode={formMode}
        initialData={initialData}
        modules={moduleOptions}
        saving={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormMode(null)}
        onSubmit={async (payload) => {
          if (formMode === 'create') {
            await createMutation.mutateAsync(payload);
          } else if (formMode === 'edit' && selected) {
            await updateMutation.mutateAsync({ id: selected.id, ...payload });
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
            Permissions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage system permissions and access control definitions
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Add Permission
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by permission title or slug..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
        <Select
          value={moduleFilter}
          onChange={setModuleFilter}
          size="lg"
          placeholder="All Modules"
          options={moduleOptions.map((m) => ({ value: m.id, label: m.title }))}
        />
        <button
          type="button"
          onClick={() => {
            setSearchTerm('');
            setModuleFilter('');
            setPage(1);
          }}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <Filter className="h-4 w-4" /> Clear
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Permission</th>
              <th className="px-5 py-4">Module</th>
              <th className="px-5 py-4">Slug</th>
              <th className="px-5 py-4">Description</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </td>
              </tr>
            ) : permissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                  No permissions found.
                </td>
              </tr>
            ) : (
              permissions.map((p) => (
                <tr key={p.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <Lock className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-slate-800">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      {p.module_title}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">
                    {p.slug}
                  </td>
                  <td className="max-w-xs truncate px-5 py-4 text-xs text-slate-500">
                    {p.description || '—'}
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
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" /> View Details
                      </button>
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => handleOpenForm('edit', p)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" /> Edit Permission
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"
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
        label="permissions"
        disabled={isFetching}
      />
    </div>
  );
}
