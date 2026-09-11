'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import CategoryForm from '@/components/categories/CategoryForm';
import CategoryTreeTable from '@/components/categories/CategoryTreeTable';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/hooks/categories';
import { useBranchesQuery } from '@/hooks/branches';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAuthStore } from '@/store/authStore';
import { categoriesApi } from '@/services/categories';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { Category } from '@/types/category.types';
import { confirmDialog, alertDialog } from '@/store/dialogStore';
import {
  buildCategoryTree,
  collectExpandableIds,
  filterTree,
  getVisibleTreeRows,
  toTreeRows,
  type VisibleTreeRow,
} from '@/utils/categoryTree';

async function loadAllCategories(params: {
  branch_id?: string;
}): Promise<Category[]> {
  const limit = 100;
  let page = 1;
  const collected: Category[] = [];

  for (;;) {
    const response = await categoriesApi.getAll({ page, limit, ...params });
    const list = extractListItems<Category>(response, 'categories');
    const pagination = extractPagination(response, limit);
    collected.push(...list);
    if (page >= pagination.totalPages || list.length < limit) break;
    page += 1;
  }

  return collected;
}

export default function CategoriesPage() {
  const user = useAuthStore((s) => s.user);
  const isTenantAdmin = !user?.branchId;

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.categories.create);
  const canUpdate = usePermission(ENTITY_PERMS.categories.update);
  const canDelete = usePermission(ENTITY_PERMS.categories.delete);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  const { data: branchesRes } = useBranchesQuery(
    { page: 1, limit: 100 },
    isTenantAdmin,
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

  const listParams = useMemo(
    () => ({
      branch_id:
        isTenantAdmin && branchFilter ? branchFilter : undefined,
    }),
    [isTenantAdmin, branchFilter],
  );

  const refetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await loadAllCategories(listParams);
      setAllCategories(rows);
    } finally {
      setLoading(false);
    }
  }, [listParams]);

  useEffect(() => {
    refetchCategories();
  }, [refetchCategories]);

  const parentNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of allCategories) map.set(category.id, category.name);
    return map;
  }, [allCategories]);

  const tree = useMemo(
    () => toTreeRows(buildCategoryTree(allCategories)),
    [allCategories],
  );

  const filteredTree = useMemo(
    () => filterTree(tree, debouncedSearch),
    [tree, debouncedSearch],
  );

  useEffect(() => {
    if (!debouncedSearch.trim()) return;
    setExpanded(collectExpandableIds(filteredTree));
  }, [debouncedSearch, filteredTree]);

  const visibleRows = useMemo(
    () => getVisibleTreeRows(filteredTree, expanded),
    [filteredTree, expanded],
  );

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenForm = (
    mode: 'create' | 'edit' | 'view',
    category?: Category,
  ) => {
    setFormMode(mode);
    setSelectedCategory(category || null);
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);

    try {
      const impactRes = await categoriesApi.getDeleteImpact(id);
      const impact = impactRes.data;

      if (impact.has_running_orders) {
        await alertDialog({
          title: 'Cannot delete category',
          message:
            'Sorry, we cannot delete this category because products related to it have running orders. Please complete or cancel those orders first.',
          variant: 'danger',
        });
        return;
      }

      const subLabel =
        impact.subcategory_count === 1
          ? '1 subcategory'
          : `${impact.subcategory_count} subcategories`;

      let cascadeProducts = false;
      let confirmed = false;

      if (impact.product_count > 0) {
        confirmed = await confirmDialog({
          title: `Delete "${impact.category_name}"?`,
          message: `This category has ${impact.product_count} related product${impact.product_count === 1 ? '' : 's'}. Products without order history will be permanently removed. Products used in past orders will be archived instead.${impact.subcategory_count > 0 ? ` ${subLabel} will also be removed.` : ''} Do you still want to delete?`,
          confirmLabel: 'Yes, delete',
          cancelLabel: 'No',
          variant: 'danger',
        });
        cascadeProducts = true;
      } else {
        confirmed = await confirmDialog({
          title: `Delete "${impact.category_name}"?`,
          message:
            impact.subcategory_count > 0
              ? `This will delete the category and ${subLabel}.`
              : 'This will permanently delete the category.',
          confirmLabel: 'Delete',
          cancelLabel: 'Cancel',
          variant: 'danger',
        });
      }

      if (!confirmed) return;

      await deleteMutation.mutateAsync({ id, cascadeProducts });
      await refetchCategories();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to delete category';
      await alertDialog({
        title: 'Delete failed',
        message,
        variant: 'danger',
      });
    }
  };

  if (formMode) {
    return (
      <CategoryForm
        mode={formMode}
        allCategories={allCategories}
        categoriesLoading={loading}
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
          await refetchCategories();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Categories
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage product categories as a hierarchy
          </p>
        </div>
        {canCreate ? (
          <button
            type="button"
            onClick={() => handleOpenForm('create')}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-bold text-slate-900">Category Tree</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
              />
            </div>
            {isTenantAdmin ? (
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
            ) : null}
          </div>
        </div>

        <CategoryTreeTable
          rows={visibleRows}
          loading={loading}
          expanded={expanded}
          parentNameById={parentNameById}
          isTenantAdmin={isTenantAdmin}
          dropdownOpen={dropdownOpen}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onToggleExpand={toggleExpand}
          onView={(row: VisibleTreeRow) => handleOpenForm('view', row)}
          onEdit={(row: VisibleTreeRow) => handleOpenForm('edit', row)}
          onDelete={handleDelete}
          onDropdownOpenChange={setDropdownOpen}
        />

        <div className="mt-4 text-sm text-slate-500">
          {allCategories.length} categor
          {allCategories.length === 1 ? 'y' : 'ies'}
          {debouncedSearch
            ? ` · filtered to ${visibleRows.length} visible`
            : ''}
        </div>
      </div>
    </div>
  );
}
