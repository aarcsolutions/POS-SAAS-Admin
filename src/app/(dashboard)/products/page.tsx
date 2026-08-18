'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Package,
  Layers,
  ArrowLeft,
  Tags,
  ChevronRight,
} from 'lucide-react';
import ProductForm from '@/components/products/ProductForm';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import ListPager from '@/components/ui/ListPager';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '@/hooks/products';
import { useCategoriesQuery } from '@/hooks/categories';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { Product } from '@/types/product.types';
import { Category } from '@/types/category.types';
import { productsApi } from '@/services/products';
import { confirmDialog } from '@/store/dialogStore';
import { toast } from 'sonner';

const LIMIT = 10;

function getProductImage(product: Product): string | null {
  const primary = product.images?.find((i) => i.is_primary)?.image_url;
  if (primary) return primary;
  if (product.images?.[0]?.image_url) return product.images[0].image_url;

  for (const variant of product.variants || []) {
    const vPrimary = variant.images?.find((i) => i.is_primary)?.image_url;
    if (vPrimary) return vPrimary;
    if (variant.images?.[0]?.image_url) return variant.images[0].image_url;
  }
  return null;
}

function getProductPrices(product: Product): number[] {
  if (product.has_variant) {
    return (product.variants || [])
      .map((v) => Number(v.price))
      .filter((n) => !Number.isNaN(n));
  }
  const price = Number(product.price ?? 0);
  return Number.isNaN(price) ? [] : [price];
}

function getPriceLabel(product: Product): string {
  const prices = getProductPrices(product);
  if (product.has_variant) {
    if (prices.length === 0) {
      return `${product.variants?.length || 0} variants`;
    }
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `PKR ${min.toFixed(2)}`;
    return `PKR ${min.toFixed(2)} – ${max.toFixed(2)}`;
  }
  return `PKR ${(prices[0] ?? 0).toFixed(2)}`;
}

function CategoryCard({
  category,
  productCount,
  subcategoryCount,
  onClick,
}: {
  category: Category;
  productCount: number;
  subcategoryCount: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {category.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.image_url}
            alt={category.name}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <Tags className="h-12 w-12" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-base font-bold text-slate-900">
          {category.name}
        </h3>
        {category.description && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {category.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 text-[11px] font-semibold text-slate-400">
          <span>
            {productCount} product{productCount === 1 ? '' : 's'}
            {subcategoryCount > 0
              ? ` · ${subcategoryCount} sub`
              : ''}
          </span>
          <ChevronRight className="h-4 w-4 text-emerald-600 opacity-0 transition group-hover:opacity-100" />
        </div>
      </div>
    </button>
  );
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selected, setSelected] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.products.create);
  const canUpdate = usePermission(ENTITY_PERMS.products.update);
  const canDelete = usePermission(ENTITY_PERMS.products.delete);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);
  const debouncedMinPrice = useDebouncedValue(minPrice.trim(), 300);
  const debouncedMaxPrice = useDebouncedValue(maxPrice.trim(), 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, debouncedMinPrice, debouncedMaxPrice, selectedCategoryId]);

  // Unfiltered fetch (capped) used only to badge each category card with a product count.
  const { data: countsData } = useProductsQuery({ page: 1, limit: 100 });
  const { data, isLoading, isFetching } = useProductsQuery(
    {
      page,
      limit: LIMIT,
      search: debouncedSearch || undefined,
      category_id: selectedCategoryId || undefined,
      min_price: debouncedMinPrice ? Number(debouncedMinPrice) : undefined,
      max_price: debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined,
    },
    !!selectedCategoryId
  );
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategoriesQuery({
      page: 1,
      limit: 100,
    });

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();

  const allProductsForCounts = useMemo(
    () => extractListItems<Product>(countsData, 'products'),
    [countsData]
  );

  const products = useMemo(
    () => extractListItems<Product>(data, 'products'),
    [data]
  );
  const pagination = extractPagination(data, LIMIT);

  const categories = useMemo(() => {
    return categoriesData?.data?.data ?? categoriesData?.data?.categories ?? [];
  }, [categoriesData]);

  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  const childrenByParent = useMemo(() => {
    const map = new Map<string | null, Category[]>();
    for (const c of categories) {
      const key = c.parent_id ?? null;
      const list = map.get(key) || [];
      list.push(c);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [categories]);

  const productCountByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of allProductsForCounts) {
      map.set(p.category_id, (map.get(p.category_id) || 0) + 1);
    }
    return map;
  }, [allProductsForCounts]);

  const selectedCategory = selectedCategoryId
    ? categoryById.get(selectedCategoryId) || null
    : null;

  const breadcrumb = useMemo(() => {
    if (!selectedCategoryId) return [];
    const trail: Category[] = [];
    let current: Category | undefined = categoryById.get(selectedCategoryId);
    while (current) {
      trail.unshift(current);
      current = current.parent_id
        ? categoryById.get(current.parent_id)
        : undefined;
    }
    return trail;
  }, [selectedCategoryId, categoryById]);

  const visibleCategories = useMemo(() => {
    const parentKey = selectedCategoryId;
    const list = childrenByParent.get(parentKey) || [];
    const q = searchTerm.trim().toLowerCase();
    if (!q || selectedCategoryId) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
    );
  }, [childrenByParent, selectedCategoryId, searchTerm]);

  const hasPriceFilters = minPrice.trim() !== '' || maxPrice.trim() !== '';

  const handleOpen = async (
    mode: 'create' | 'edit' | 'view',
    product?: Product
  ) => {
    setDropdownOpen(null);
    if (mode === 'create') {
      setSelected(null);
      setFormMode('create');
      return;
    }
    if (!product) return;
    setFormLoading(true);
    try {
      const res = await productsApi.getById(product.id);
      setSelected(res.data);
      setFormMode(mode);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to load product details'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete Product',
      message:
        'Permanently delete this product, its variants and images? This cannot be undone if it is not used in orders.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  const goToCategory = (id: string | null) => {
    setSelectedCategoryId(id);
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setDropdownOpen(null);
  };

  if (formLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (formMode) {
    return (
      <ProductForm
        mode={formMode}
        initial={
          formMode === 'create' && selectedCategoryId
            ? ({
                category_id: selectedCategoryId,
              } as Product)
            : selected
        }
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

  const pageLoading = categoriesLoading;
  const productsLoading = !!selectedCategoryId && (isLoading || isFetching);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {selectedCategory
              ? `Browse ${selectedCategory.name}`
              : 'Choose a category to view products and subcategories'}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => handleOpen('create')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        )}
      </div>

      {selectedCategoryId && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => goToCategory(null)}
            className="inline-flex items-center gap-1.5 font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> All Categories
          </button>
          {breadcrumb.map((c, idx) => (
            <span key={c.id} className="inline-flex items-center gap-2">
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              {idx === breadcrumb.length - 1 ? (
                <span className="font-bold text-slate-900">{c.name}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => goToCategory(c.id)}
                  className="font-medium text-slate-500 hover:text-emerald-700"
                >
                  {c.name}
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              selectedCategoryId
                ? 'Search products in this category...'
                : 'Search categories...'
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
        {selectedCategoryId && (
          <>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step="0.01"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min price"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 lg:w-28"
              />
              <span className="text-sm text-slate-400">–</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max price"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 lg:w-28"
              />
            </div>
            {hasPriceFilters && (
              <button
                type="button"
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </>
        )}
      </div>

      {pageLoading ? (
        <div className="flex justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {visibleCategories.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {selectedCategoryId ? 'Subcategories' : 'Categories'}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    productCount={productCountByCategory.get(category.id) || 0}
                    subcategoryCount={
                      (childrenByParent.get(category.id) || []).length
                    }
                    onClick={() => goToCategory(category.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {selectedCategoryId && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Products
              </h2>
              {productsLoading ? (
                <div className="flex justify-center py-12 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-400">
                  No products in this category.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => {
                    const imageUrl = getProductImage(product);
                    const priceLabel = getPriceLabel(product);

                    return (
                      <div
                        key={product.id}
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                      >
                        <div className="relative aspect-[4/3] bg-slate-100">
                          {imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                              <Package className="h-12 w-12" />
                            </div>
                          )}
                          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                product.is_active
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-700 text-white'
                              }`}
                            >
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-700 backdrop-blur">
                              {product.has_variant ? 'Variable' : 'Simple'}
                            </span>
                          </div>
                          <div className="absolute right-2 top-2">
                            <RowActionsMenu
                              open={dropdownOpen === product.id}
                              onOpenChange={(open) =>
                                setDropdownOpen(open ? product.id : null)
                              }
                            >
                              <button
                                type="button"
                                onClick={() => handleOpen('view', product)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Eye className="h-4 w-4" /> View
                              </button>
                              {canUpdate && (
                                <button
                                  type="button"
                                  onClick={() => handleOpen('edit', product)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Pencil className="h-4 w-4" /> Edit
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(product.id)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              )}
                            </RowActionsMenu>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                          <h3 className="line-clamp-1 text-base font-bold text-slate-900">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                              {product.description}
                            </p>
                          )}
                          <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {priceLabel}
                              </p>
                              {product.has_variant && (
                                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                                  <Layers className="h-3 w-3" />
                                  {product.variants?.length || 0} variants
                                </p>
                              )}
                            </div>
                            {canUpdate && (
                              <button
                                type="button"
                                onClick={() => handleOpen('edit', product)}
                                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {products.length > 0 && (
                <ListPager
                  page={page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  limit={LIMIT}
                  onPageChange={setPage}
                  label="products"
                  disabled={productsLoading}
                />
              )}
            </section>
          )}

          {!selectedCategoryId && visibleCategories.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
              No categories found. Create categories first to organize products.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
