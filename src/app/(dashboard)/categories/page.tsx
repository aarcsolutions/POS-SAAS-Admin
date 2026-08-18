'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Tags,
} from 'lucide-react';
import CategoryForm from '@/components/categories/CategoryForm';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/hooks/categories';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { Category } from '@/types/category.types';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 10;

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.categories.create);
  const canUpdate = usePermission(ENTITY_PERMS.categories.update);
  const canDelete = usePermission(ENTITY_PERMS.categories.delete);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useCategoriesQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
  });
  // Full unpaginated list, used by the create/edit form's parent picker and
  // for resolving parent names in the table regardless of which page they're on.
  const { data: allCategoriesData, isLoading: allCategoriesLoading } =
    useCategoriesQuery({ page: 1, limit: 100 });

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  const categories = extractListItems<Category>(data, 'categories');
  const pagination = extractPagination(data, LIMIT);
  const allCategories = extractListItems<Category>(allCategoriesData, 'categories');

  const parentNameById = useMemo(() => {
    const map = new Map<string, string>();
    const source = allCategories.length ? allCategories : categories;
    for (const c of source) map.set(c.id, c.name);
    return map;
  }, [allCategories, categories]);

  const handleOpenForm = (
    mode: 'create' | 'edit' | 'view',
    category?: Category
  ) => {
    setFormMode(mode);
    setSelectedCategory(category || null);
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete Category',
      message:
        'Delete this category? All subcategories under it will also be deleted.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  if (formMode) {
    return (
      <CategoryForm
        mode={formMode}
        allCategories={allCategories}
        categoriesLoading={allCategoriesLoading}
        editingCategoryId={selectedCategory?.id}
        initialData={
          selectedCategory
            ? {
                name: selectedCategory.name,
                description: selectedCategory.description || '',
                parent_id: selectedCategory.parent_id ?? null,
                image_url: selectedCategory.image_url ?? null,
              }
            : undefined
        }
        saving={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormMode(null)}
        onSubmit={async (payload) => {
          if (formMode === 'create') {
            await createMutation.mutateAsync(payload);
          } else if (formMode === 'edit' && selectedCategory) {
            await updateMutation.mutateAsync({
              id: selectedCategory.id,
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
            Categories
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Nested product categories for this tenant
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search categories..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Category</th>
              <th className="px-5 py-3 font-bold">Parent</th>
              <th className="px-5 py-3 font-bold">Description</th>
              <th className="px-5 py-3 font-bold">Created</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                        <Tags className="h-4 w-4" />
                      </div>
                      <div className="font-semibold text-slate-800">
                        {category.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {category.parent_id
                      ? parentNameById.get(category.parent_id) ||
                        category.parent_id
                      : '—'}
                  </td>
                  <td className="max-w-xs truncate px-5 py-4 text-slate-600">
                    {category.description || '—'}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {category.created_at
                      ? new Date(category.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        category.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RowActionsMenu
                      open={dropdownOpen === category.id}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? category.id : null)
                      }
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenForm('view', category)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => handleOpenForm('edit', category)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(category.id)}
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
        label="categories"
        disabled={isLoading || isFetching}
      />
    </div>
  );
}
