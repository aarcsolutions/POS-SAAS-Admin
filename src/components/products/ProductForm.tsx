'use client';

import { useRef, useState } from 'react';
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import CategoryTreePicker from '@/components/products/CategoryTreePicker';
import { useCategoriesQuery } from '@/hooks/categories';
import { filesApi } from '@/services/files';
import { notifyError } from '@/utils/notify';
import { blockInvalidSubmit } from '@/utils/form-validation';
import {
  Product,
  ProductImage,
  ProductInventoryTracking,
  ProductPayload,
  ProductVariant,
} from '@/types/product.types';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

interface Props {
  mode: 'create' | 'edit' | 'view';
  initial?: Product | null;
  onClose: () => void;
  onSubmit: (payload: ProductPayload) => Promise<void> | void;
  saving?: boolean;
}

function normalizeImages(images: ProductImage[]): ProductImage[] {
  if (images.length === 0) return images;
  if (images.some((i) => i.is_primary)) return images;
  return images.map((img, idx) => ({ ...img, is_primary: idx === 0 }));
}

function hasInventoryModule(
  modules: { module_slug: string }[],
  permissions: string[]
): boolean {
  if (
    modules.some(
      (m) =>
        m.module_slug === 'inventory' ||
        m.module_slug.replace(/_/g, '-') === 'inventory'
    )
  ) {
    return true;
  }
  return permissions.some(
    (p) => p === 'inventory/getAll' || p.startsWith('inventory/')
  );
}

export default function ProductForm({
  mode,
  initial,
  onClose,
  onSubmit,
  saving = false,
}: Props) {
  const isReadOnly = mode === 'view';
  const modulesWithPermisssions = useAuthStore((s) => s.modulesWithPermisssions);
  const permissions = useAuthStore((s) => s.permissions);
  const inventoryModuleOn = hasInventoryModule(
    modulesWithPermisssions,
    permissions
  );

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategoriesQuery({ page: 1, limit: 100 });
  const categories =
    categoriesData?.data?.data ??
    categoriesData?.data?.categories ??
    [];

  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(
    initial?.description || ''
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    initial?.category_id || null
  );
  const [hasVariant, setHasVariant] = useState(initial?.has_variant || false);
  const [inventoryTracking, setInventoryTracking] =
    useState<ProductInventoryTracking>(
      (initial?.inventory_tracking as ProductInventoryTracking) || 'recipe'
    );
  const [price, setPrice] = useState<number>(
    Number(initial?.price ?? 0)
  );
  const [costPrice, setCostPrice] = useState<number>(
    Number(initial?.cost_price ?? 0)
  );
  const [stockQuantity, setStockQuantity] = useState<number>(
    Number(initial?.stock_quantity ?? 0)
  );
  const [minStockLevel, setMinStockLevel] = useState<number>(
    Number(initial?.min_stock_level ?? 0)
  );
  const [openingStock, setOpeningStock] = useState<number>(
    Number(initial?.stock_quantity ?? 0)
  );
  const [variants, setVariants] = useState<ProductVariant[]>(
    initial?.has_variant
      ? (initial.variants || []).map((v) => ({
          id: v.id,
          name: v.name,
          price: Number(v.price),
          cost_price: Number(v.cost_price),
          stock_quantity: Number(v.stock_quantity ?? 0),
          min_stock_level: Number(v.min_stock_level ?? 0),
          opening_stock: Number(v.stock_quantity ?? 0),
          images: v.images || [],
        }))
      : []
  );
  const [images, setImages] = useState<ProductImage[]>(
    initial?.images || []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const showStockFields =
    inventoryModuleOn && inventoryTracking === 'direct_stock';

  const title =
    mode === 'create'
      ? 'Add Product'
      : mode === 'edit'
        ? 'Edit Product'
        : 'View Product';

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!categoryId) next.category_id = 'Category is required';
    if (!hasVariant) {
      if (price < 0) next.price = 'Invalid selling price';
      if (costPrice < 0) next.cost_price = 'Invalid cost price';
      if (showStockFields) {
        if (stockQuantity < 0) next.stock_quantity = 'Stock cannot be negative';
        if (minStockLevel < 0) next.min_stock_level = 'Min stock cannot be negative';
        if (openingStock < 0) next.opening_stock = 'Opening stock cannot be negative';
      }
    } else {
      if (variants.length === 0) next.variants = 'Add at least one variant';
      variants.forEach((v, i) => {
        if (!v.name.trim()) next[`variant_${i}_name`] = 'Variant name required';
        if (showStockFields) {
          if (Number(v.stock_quantity ?? 0) < 0) {
            next[`variant_${i}_stock`] = 'Stock cannot be negative';
          }
          if (Number(v.min_stock_level ?? 0) < 0) {
            next[`variant_${i}_min`] = 'Min stock cannot be negative';
          }
        }
      });
    }
    setErrors(next);
    return next;
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length || isReadOnly) return;
    setUploading(true);
    try {
      const uploaded: ProductImage[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        const result = await filesApi.uploadAndResolveUrl(file, 'products');
        uploaded.push({
          image_url: result.url,
          is_primary: false,
        });
      }
      if (uploaded.length) {
        setImages((prev) => normalizeImages([...prev, ...uploaded]));
        toast.success('Image(s) uploaded');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const next = validate();
    if (!blockInvalidSubmit(next, notifyError)) return;

    const payload: ProductPayload = {
      name: name.trim(),
      category_id: categoryId!,
      has_variant: hasVariant,
      inventory_tracking: inventoryTracking,
      description: description.trim() || undefined,
      images: normalizeImages(images).map((img) => ({
        image_url: img.image_url,
        is_primary: !!img.is_primary,
      })),
    };

    if (hasVariant) {
      payload.variants = variants.map((v) => {
        const row: ProductVariant = {
          ...(v.id ? { id: v.id } : {}),
          name: v.name.trim(),
          price: Number(v.price),
          cost_price: Number(v.cost_price),
          images: v.images?.length
            ? normalizeImages(v.images).map((img) => ({
                image_url: img.image_url,
                is_primary: !!img.is_primary,
              }))
            : undefined,
        };
        if (showStockFields) {
          row.stock_quantity = Number(v.stock_quantity ?? 0);
          row.min_stock_level = Number(v.min_stock_level ?? 0);
          row.opening_stock = Number(
            v.opening_stock ?? v.stock_quantity ?? 0
          );
        }
        return row;
      });
    } else {
      payload.price = Number(price);
      payload.cost_price = Number(costPrice);
      if (showStockFields) {
        payload.stock_quantity = Number(stockQuantity);
        payload.min_stock_level = Number(minStockLevel);
        payload.opening_stock = Number(openingStock);
      }
    }

    await onSubmit(payload);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Restaurant menu item — category, pricing, optional variants & images.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Basic Info
          </h2>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Name {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={isReadOnly}
              placeholder="e.g. Latte"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Category {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <CategoryTreePicker
              value={categoryId}
              onChange={setCategoryId}
              categories={categories}
              loading={categoriesLoading}
              disabled={isReadOnly}
              error={errors.category_id}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              readOnly={isReadOnly}
              rows={3}
              placeholder="Short menu description..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] resize-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Product Type
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="inventory_tracking"
                  checked={inventoryTracking === 'recipe'}
                  disabled={isReadOnly}
                  onChange={() => setInventoryTracking('recipe')}
                />
                Recipe Based
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="inventory_tracking"
                  checked={inventoryTracking === 'direct_stock'}
                  disabled={isReadOnly}
                  onChange={() => setInventoryTracking('direct_stock')}
                />
                Direct Stock
              </label>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Recipe based items use recipes / KDS. Direct stock tracks sellable
              quantity on hand.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Pricing Structure
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  checked={!hasVariant}
                  disabled={isReadOnly}
                  onChange={() => setHasVariant(false)}
                />
                Simple (single price)
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  checked={hasVariant}
                  disabled={isReadOnly}
                  onChange={() => {
                    setHasVariant(true);
                    if (variants.length === 0) {
                      setVariants([
                        {
                          name: 'Small',
                          price: 0,
                          cost_price: 0,
                          stock_quantity: 0,
                          min_stock_level: 0,
                          opening_stock: 0,
                        },
                        {
                          name: 'Large',
                          price: 0,
                          cost_price: 0,
                          stock_quantity: 0,
                          min_stock_level: 0,
                          opening_stock: 0,
                        },
                      ]);
                    }
                  }}
                />
                Variable (sizes / options)
              </label>
            </div>
          </div>
        </div>

        {!hasVariant ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Pricing
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Selling Price {!isReadOnly && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  readOnly={isReadOnly}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-rose-600">{errors.price}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cost Price {!isReadOnly && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={costPrice}
                  readOnly={isReadOnly}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                />
              </div>
            </div>

            {showStockFields && (
              <div className="grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Opening Stock
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={openingStock}
                    readOnly={isReadOnly}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setOpeningStock(n);
                      if (mode === 'create') setStockQuantity(n);
                    }}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                  />
                  {errors.opening_stock && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.opening_stock}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={stockQuantity}
                    readOnly={isReadOnly}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                  />
                  {errors.stock_quantity && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.stock_quantity}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Min Stock Level
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={minStockLevel}
                    readOnly={isReadOnly}
                    onChange={(e) => setMinStockLevel(Number(e.target.value))}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                  />
                  {errors.min_stock_level && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.min_stock_level}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Variants
              </h2>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() =>
                    setVariants((prev) => [
                      ...prev,
                      {
                        name: '',
                        price: 0,
                        cost_price: 0,
                        stock_quantity: 0,
                        min_stock_level: 0,
                        opening_stock: 0,
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-[var(--brand-primary)] px-3 py-1.5 text-xs font-bold text-white hover:brightness-95"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              )}
            </div>
            {errors.variants && (
              <p className="text-xs text-rose-600">{errors.variants}</p>
            )}
            <div className="space-y-3">
              <div
                className={`hidden gap-3 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:grid ${
                  showStockFields ? 'md:grid-cols-7' : 'md:grid-cols-4'
                }`}
              >
                <span>Name</span>
                <span>Selling Price</span>
                <span>Cost Price</span>
                {showStockFields && (
                  <>
                    <span>Opening</span>
                    <span>Stock Qty</span>
                    <span>Min Stock</span>
                  </>
                )}
                <span className="text-center">Remove</span>
              </div>
              {variants.map((v, idx) => (
                <div
                  key={v.id || idx}
                  className={`grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 ${
                    showStockFields ? 'md:grid-cols-7' : 'md:grid-cols-4'
                  }`}
                >
                  <input
                    value={v.name}
                    readOnly={isReadOnly}
                    placeholder="Name (e.g. Small)"
                    onChange={(e) => {
                      const next = [...variants];
                      next[idx] = { ...v, name: e.target.value };
                      setVariants(next);
                    }}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={v.price}
                    readOnly={isReadOnly}
                    placeholder="Selling price"
                    onChange={(e) => {
                      const next = [...variants];
                      next[idx] = { ...v, price: Number(e.target.value) };
                      setVariants(next);
                    }}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={v.cost_price}
                    readOnly={isReadOnly}
                    placeholder="Cost price"
                    onChange={(e) => {
                      const next = [...variants];
                      next[idx] = {
                        ...v,
                        cost_price: Number(e.target.value),
                      };
                      setVariants(next);
                    }}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
                  />
                  {showStockFields && (
                    <>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={v.opening_stock ?? 0}
                        readOnly={isReadOnly}
                        placeholder="Opening"
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          const next = [...variants];
                          next[idx] = {
                            ...v,
                            opening_stock: n,
                            ...(mode === 'create'
                              ? { stock_quantity: n }
                              : {}),
                          };
                          setVariants(next);
                        }}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={v.stock_quantity ?? 0}
                        readOnly={isReadOnly}
                        placeholder="Stock"
                        onChange={(e) => {
                          const next = [...variants];
                          next[idx] = {
                            ...v,
                            stock_quantity: Number(e.target.value),
                          };
                          setVariants(next);
                        }}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={v.min_stock_level ?? 0}
                        readOnly={isReadOnly}
                        placeholder="Min"
                        onChange={(e) => {
                          const next = [...variants];
                          next[idx] = {
                            ...v,
                            min_stock_level: Number(e.target.value),
                          };
                          setVariants(next);
                        }}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
                      />
                    </>
                  )}
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() =>
                        setVariants((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="inline-flex h-10 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Images (optional)
          </h2>
          {!isReadOnly && (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-slate-500 hover:border-[var(--brand-primary)] hover:bg-[var(--brand-icon-soft)]/40"
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <ImagePlus className="h-6 w-6" />
                )}
                <span className="text-sm font-semibold">
                  {uploading ? 'Uploading...' : 'Upload images via file service'}
                </span>
              </button>
            </div>
          )}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((img, idx) => (
                <div
                  key={`${img.image_url}-${idx}`}
                  className="relative overflow-hidden rounded-xl border border-slate-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt=""
                    className="h-28 w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-2 py-1">
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() =>
                        setImages((prev) =>
                          prev.map((p, i) => ({
                            ...p,
                            is_primary: i === idx,
                          }))
                        )
                      }
                      className={`rounded p-1 ${
                        img.is_primary ? 'text-amber-300' : 'text-white/80'
                      }`}
                      title="Set primary"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() =>
                          setImages((prev) =>
                            normalizeImages(prev.filter((_, i) => i !== idx))
                          )
                        }
                        className="rounded p-1 text-white/80 hover:text-rose-300"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isReadOnly && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white hover:brightness-95 disabled:opacity-70"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {mode === 'create' ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
