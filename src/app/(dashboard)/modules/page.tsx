'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Package,
  Loader2,
} from 'lucide-react';
import ModuleForm, { ModuleFormData } from '@/components/modules/ModuleForm';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useModulesQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
} from '@/hooks/modules';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 10;

type ModuleRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  is_active: boolean;
};

export default function ModulesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selected, setSelected] = useState<ModuleRow | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.modules.create);
  const canUpdate = usePermission(ENTITY_PERMS.modules.update);
  const canDelete = usePermission(ENTITY_PERMS.modules.delete);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const listParams = {
    page,
    limit: LIMIT,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(statusFilter === 'Active'
      ? { is_active: true as const }
      : statusFilter === 'Inactive'
        ? { is_active: false as const }
        : {}),
  };

  const { data, isLoading, isFetching } = useModulesQuery(listParams);
  const createMutation = useCreateModuleMutation();
  const updateMutation = useUpdateModuleMutation();
  const deleteMutation = useDeleteModuleMutation();

  const modules = extractListItems<any>(data, 'modules').map(
    (m: any): ModuleRow => ({
      id: m.id,
      title: m.title || m.name || '',
      slug: m.slug || '',
      description: m.description || '',
      is_active: m.is_active !== false,
    })
  );
  const pagination = extractPagination(data, LIMIT);

  const handleOpenForm = (mode: 'create' | 'edit' | 'view', mod?: ModuleRow) => {
    setFormMode(mode);
    setSelected(mod || null);
    setDropdownOpen(null);
  };

  const handleDelete = async (mod: ModuleRow) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete Module',
      message: `Delete module "${mod.title}"?`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(mod.id);
  };

  if (formMode) {
    const initialData: ModuleFormData | undefined = selected
      ? {
          title: selected.title,
          slug: selected.slug,
          description: selected.description,
        }
      : undefined;

    return (
      <ModuleForm
        mode={formMode}
        initialData={initialData}
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
            Modules
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage system modules and platform features
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" /> Add Module
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
            placeholder="Search by module title or slug..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          size="lg"
          placeholder="All Statuses"
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
          ]}
        />
        <button
          type="button"
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('');
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
              <th className="px-5 py-4">Module</th>
              <th className="px-5 py-4">Slug</th>
              <th className="px-5 py-4">Status</th>
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
            ) : modules.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                  No modules found.
                </td>
              </tr>
            ) : (
              modules.map((m) => (
                <tr key={m.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[var(--brand-icon)]">
                        <Package className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-slate-800">{m.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">
                    {m.slug}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        m.is_active
                          ? 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {m.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-5 py-4 text-xs text-slate-500">
                    {m.description || '—'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RowActionsMenu
                      open={dropdownOpen === m.id}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? m.id : null)
                      }
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenForm('view', m)}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" /> View Details
                      </button>
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => handleOpenForm('edit', m)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" /> Edit Module
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(m)}
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
        label="modules"
        disabled={isFetching}
      />
    </div>
  );
}
