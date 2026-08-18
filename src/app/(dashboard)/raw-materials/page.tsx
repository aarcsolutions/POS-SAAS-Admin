'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import RawMaterialTable from '@/components/raw-materials/RawMaterialTable';
import RawMaterialForm from '@/components/raw-materials/RawMaterialForm';
import DeleteConfirm from '@/components/raw-materials/DeleteConfirm';
import ListPager from '@/components/ui/ListPager';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useRawMaterialsQuery,
  useCreateRawMaterialMutation,
  useUpdateRawMaterialMutation,
  useDeleteRawMaterialMutation,
} from '@/hooks/raw-materials';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { RawMaterial } from '@/types/raw-material.types';

const LIMIT = 10;

export default function RawMaterialsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selected, setSelected] = useState<RawMaterial | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.raw_materials.create);
  const canUpdate = usePermission(ENTITY_PERMS.raw_materials.update);
  const canDelete = usePermission(ENTITY_PERMS.raw_materials.delete);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useRawMaterialsQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
  });
  const createMutation = useCreateRawMaterialMutation();
  const updateMutation = useUpdateRawMaterialMutation();
  const deleteMutation = useDeleteRawMaterialMutation();

  const materials = extractListItems<RawMaterial>(data);
  const pagination = extractPagination(data, LIMIT);

  const handleOpen = (
    mode: 'create' | 'edit' | 'view',
    material?: RawMaterial
  ) => {
    setFormMode(mode);
    setSelected(material || null);
    setDropdownOpen(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    deleteMutation.mutate(deletingId, {
      onSettled: () => setDeletingId(null),
    });
  };

  if (formMode) {
    return (
      <RawMaterialForm
        mode={formMode}
        initial={selected}
        saving={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormMode(null)}
        onSubmit={async (payload) => {
          if (formMode === 'create') {
            await createMutation.mutateAsync(payload);
          } else if (formMode === 'edit' && selected) {
            await updateMutation.mutateAsync({
              id: selected.id,
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Raw Materials</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage inventory materials used in recipes and production.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search raw materials..."
              className="h-11 w-[280px] rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          {canCreate && (
            <button
              type="button"
              onClick={() => handleOpen('create')}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" /> Add Raw Material
            </button>
          )}
        </div>
      </div>

      <RawMaterialTable
        materials={materials}
        loading={isLoading || isFetching}
        canUpdate={canUpdate}
        canDelete={canDelete}
        dropdownOpen={dropdownOpen}
        onDropdownChange={setDropdownOpen}
        onView={(m) => handleOpen('view', m)}
        onEdit={(m) => handleOpen('edit', m)}
        onDelete={(id) => {
          setDropdownOpen(null);
          setDeletingId(id);
        }}
      />

      <ListPager
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={LIMIT}
        onPageChange={setPage}
        label="raw materials"
        disabled={isLoading || isFetching}
      />

      {deletingId && (
        <DeleteConfirm
          id={deletingId}
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
