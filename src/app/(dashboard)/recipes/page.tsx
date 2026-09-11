'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Loader2,
  ChefHat,
  ChevronRight,
  ArrowLeft,
  Pencil,
  Trash2,
  Package,
} from 'lucide-react';
import RecipeIngredientEditor from '@/components/recipes/RecipeIngredientEditor';
import ListPager from '@/components/ui/ListPager';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useRecipesWithProductsQuery,
  useRecipesWithoutProductsQuery,
  useRecipeByVariantQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
} from '@/hooks/recipes';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { RecipeProductCard } from '@/types/recipe.types';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 10;

type Screen =
  | { type: 'list' }
  | { type: 'add-list' }
  | {
      type: 'pick-variant';
      mode: 'create' | 'edit';
      product: RecipeProductCard;
    }
  | {
      type: 'editor';
      mode: 'create' | 'edit';
      product: RecipeProductCard;
      variantId: string;
      variantName: string;
    };

export default function RecipesPage() {
  const [screen, setScreen] = useState<Screen>({ type: 'list' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const canCreate = usePermission(ENTITY_PERMS.recipes.create);
  const canUpdate = usePermission(ENTITY_PERMS.recipes.update);
  const canDelete = usePermission(ENTITY_PERMS.recipes.delete);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const withQuery = useRecipesWithProductsQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
  });
  const withoutQuery = useRecipesWithoutProductsQuery(screen.type === 'add-list');
  const editorVariantId =
    screen.type === 'editor' && screen.mode === 'edit' ? screen.variantId : null;
  const recipeQuery = useRecipeByVariantQuery(editorVariantId);

  const createMutation = useCreateRecipeMutation();
  const updateMutation = useUpdateRecipeMutation();
  const deleteMutation = useDeleteRecipeMutation();

  const withProducts = extractListItems<RecipeProductCard>(withQuery.data);
  const pagination = extractPagination(withQuery.data, LIMIT);
  const withoutProducts = withoutQuery.data?.data ?? [];

  const filteredWithout = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return withoutProducts;
    return withoutProducts.filter((p) => p.name.toLowerCase().includes(q));
  }, [withoutProducts, search]);

  const openProductForCreate = (product: RecipeProductCard) => {
    const variants = product.variants_without_recipe || [];
    if (variants.length === 1) {
      setScreen({
        type: 'editor',
        mode: 'create',
        product,
        variantId: variants[0].id,
        variantName: variants[0].name,
      });
      return;
    }
    setScreen({ type: 'pick-variant', mode: 'create', product });
  };

  const openProductForEdit = (product: RecipeProductCard) => {
    const variants = product.variants_with_recipe || [];
    if (variants.length === 1) {
      setScreen({
        type: 'editor',
        mode: 'edit',
        product,
        variantId: variants[0].id,
        variantName: variants[0].name,
      });
      return;
    }
    setScreen({ type: 'pick-variant', mode: 'edit', product });
  };

  if (screen.type === 'editor') {
    if (screen.mode === 'edit' && recipeQuery.isLoading) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    return (
      <RecipeIngredientEditor
        mode={screen.mode}
        variantId={screen.variantId}
        variantName={screen.variantName}
        productName={screen.product.name}
        initialIngredients={
          screen.mode === 'edit' ? recipeQuery.data?.data?.ingredients || [] : []
        }
        saving={createMutation.isPending || updateMutation.isPending}
        onClose={() => setScreen({ type: 'list' })}
        onSubmit={async (ingredients) => {
          const payload = { variant_id: screen.variantId, ingredients };
          if (screen.mode === 'create') {
            await createMutation.mutateAsync(payload);
          } else {
            await updateMutation.mutateAsync(payload);
          }
          setScreen({ type: 'list' });
        }}
      />
    );
  }

  if (screen.type === 'pick-variant') {
    const variants =
      screen.mode === 'create'
        ? screen.product.variants_without_recipe || []
        : screen.product.variants_with_recipe || [];

    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() =>
            setScreen(
              screen.mode === 'create' ? { type: 'add-list' } : { type: 'list' }
            )
          }
          className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-icon)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {screen.product.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Select a variant to{' '}
            {screen.mode === 'create' ? 'create' : 'edit'} its recipe
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() =>
                setScreen({
                  type: 'editor',
                  mode: screen.mode,
                  product: screen.product,
                  variantId: v.id,
                  variantName: v.name,
                })
              }
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-[var(--admin-border)] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{v.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    PKR {Number(v.price).toFixed(2)}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-[var(--brand-primary)]" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (screen.type === 'add-list') {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => {
            setSearch('');
            setScreen({ type: 'list' });
          }}
          className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-icon)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Recipes
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Recipe</h1>
          <p className="mt-1 text-sm text-slate-500">
            Products that still need a recipe
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
          />
        </div>
        {withoutQuery.isLoading ? (
          <div className="flex justify-center py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filteredWithout.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
            All products already have recipes.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWithout.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => openProductForCreate(product)}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-[var(--admin-border)] hover:shadow-md"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                  <Package className="h-5 w-5" />
                </div>
                <p className="font-bold text-slate-900">{product.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {product.pending_variant_count || 0} variant
                  {(product.pending_variant_count || 0) === 1 ? '' : 's'} without
                  recipe
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recipes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Products that already have recipes configured
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setScreen({ type: 'add-list' });
            }}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" /> Add Recipe
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
        />
      </div>

      {withQuery.isLoading || withQuery.isFetching ? (
        <div className="flex justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : withProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
          <ChefHat className="mx-auto mb-3 h-10 w-10 opacity-40" />
          No recipes yet. Click Add Recipe to start.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <button
                type="button"
                onClick={() => openProductForEdit(product)}
                className="w-full text-left"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                  <ChefHat className="h-5 w-5" />
                </div>
                <p className="font-bold text-slate-900">{product.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {product.recipe_variant_count || 0} recipe
                  {(product.recipe_variant_count || 0) === 1 ? '' : 's'}
                </p>
              </button>
              <div className="mt-4 flex gap-2">
                {canUpdate && (
                  <button
                    type="button"
                    onClick={() => openProductForEdit(product)}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-[var(--brand-icon-soft)] hover:text-[var(--brand-icon)]"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
                {canDelete && (product.variants_with_recipe || []).length === 1 && (
                  <button
                    type="button"
                    onClick={async () => {
                      const id = product.variants_with_recipe![0].id;
                      const ok = await confirmDialog({
                        title: 'Delete Recipe',
                        message: 'Delete this recipe?',
                        confirmLabel: 'Delete',
                        variant: 'danger',
                      });
                      if (ok) deleteMutation.mutate(id);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {withProducts.length > 0 && (
        <ListPager
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={LIMIT}
          onPageChange={setPage}
          label="recipes"
          disabled={withQuery.isLoading || withQuery.isFetching}
        />
      )}
    </div>
  );
}
