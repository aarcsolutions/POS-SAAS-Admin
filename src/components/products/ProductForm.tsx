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
import {
  Product,
  ProductImage,
  ProductPayload,
  ProductVariant,
} from '@/types/product.types';
import { toast } from 'sonner';

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

export default function ProductForm({
  mode,
  initial,
  onClose,
  onSubmit,
  saving = false,
}: Props) {
  const isReadOnly = mode === 'view';
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
  const [price, setPrice] = useState<number>(
    Number(initial?.price ?? 0)
  );
  const [costPrice, setCostPrice] = useState<number>(
    Number(initial?.cost_price ?? 0)
  );
  const [variants, setVariants] = useState<ProductVariant[]>(
    initial?.has_variant
      ? (initial.variants || []).map((v) => ({
          id: v.id,
          name: v.name,
          price: Number(v.price),
          cost_price: Number(v.cost_price),
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

  const title =
    mode === 'create'
      ? 'Add Product'
      : mode === 'edit'
        ? 'Edit Product'
        : 'View Product';

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!categoryId) next.category_id = 'Category is required';
    if (!hasVariant) {
      if (price < 0) next.price = 'Invalid selling price';
      if (costPrice < 0) next.cost_price = 'Invalid cost price';
    } else {
      if (variants.length === 0) next.variants = 'Add at least one variant';
      variants.forEach((v, i) => {
        if (!v.name.trim()) next[`variant_${i}_name`] = 'Variant name required';
      });
    }
    setErrors(next);
    return Object.keys(next).length === 0;
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
    if (!validate()) return;

    const payload: ProductPayload = {
      name: name.trim(),
      category_id: categoryId!,
      has_variant: hasVariant,
      description: description.trim() || undefined,
      images: normalizeImages(images).map((img) => ({
        image_url: img.image_url,
        is_primary: !!img.is_primary,
      })),
    };

    if (hasVariant) {
      payload.variants = variants.map((v) => ({
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
      }));
    } else {
      payload.price = Number(price);
      payload.cost_price = Number(costPrice);
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
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Product Type
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
                        { name: 'Small', price: 0, cost_price: 0 },
                        { name: 'Large', price: 0, cost_price: 0 },
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
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
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
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>
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
                      { name: '', price: 0, cost_price: 0 },
                    ])
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              )}
            </div>
            {errors.variants && (
              <p className="text-xs text-rose-600">{errors.variants}</p>
            )}
            <div className="space-y-3">
              <div className="hidden gap-3 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:grid md:grid-cols-4">
                <span>Name</span>
                <span>Selling Price</span>
                <span>Cost Price</span>
                <span className="text-center">Remove</span>
              </div>
              {variants.map((v, idx) => (
                <div
                  key={v.id || idx}
                  className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 md:grid-cols-4"
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
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
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
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
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
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                  />
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
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-slate-500 hover:border-emerald-400 hover:bg-emerald-50/40"
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
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-70"
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
