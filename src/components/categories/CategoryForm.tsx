'use client';

import { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Save,
  Tags,
  X,
} from 'lucide-react';
import ParentCategoryPicker from '@/components/categories/ParentCategoryPicker';
import { filesApi } from '@/services/files';
import { Category } from '@/types/category.types';
import { toast } from 'sonner';

export interface CategoryFormPayload {
  name: string;
  description?: string;
  parent_id?: string | null;
  image_url?: string | null;
}

interface Props {
  mode: 'create' | 'edit' | 'view';
  initialData?: Partial<CategoryFormPayload>;
  /** Needed on edit/view to exclude self + descendants from parent picker */
  allCategories?: Category[];
  categoriesLoading?: boolean;
  editingCategoryId?: string;
  onClose: () => void;
  onSubmit: (data: CategoryFormPayload) => Promise<void> | void;
  saving?: boolean;
}

function collectDescendantIds(
  categories: Category[],
  rootId: string
): Set<string> {
  const childrenByParent = new Map<string | null, Category[]>();
  for (const cat of categories) {
    const key = cat.parent_id ?? null;
    const list = childrenByParent.get(key) || [];
    list.push(cat);
    childrenByParent.set(key, list);
  }

  const result = new Set<string>([rootId]);
  const queue = [rootId];
  while (queue.length) {
    const id = queue.shift()!;
    const kids = childrenByParent.get(id) || [];
    for (const kid of kids) {
      if (!result.has(kid.id)) {
        result.add(kid.id);
        queue.push(kid.id);
      }
    }
  }
  return result;
}

export default function CategoryForm({
  mode,
  initialData,
  allCategories = [],
  categoriesLoading = false,
  editingCategoryId,
  onClose,
  onSubmit,
  saving = false,
}: Props) {
  const isReadOnly = mode === 'view';
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [parentId, setParentId] = useState<string | null>(
    initialData?.parent_id ?? null
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.image_url || null
  );
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const excludeIds = useMemo(() => {
    if (!editingCategoryId) return undefined;
    return collectDescendantIds(allCategories, editingCategoryId);
  }, [allCategories, editingCategoryId]);

  const title =
    mode === 'create'
      ? 'Add Category'
      : mode === 'edit'
        ? 'Edit Category'
        : 'View Category';

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required';
    else if (name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    if (editingCategoryId && parentId && excludeIds?.has(parentId)) {
      next.parent_id = 'Cannot select this category or its subcategory as parent';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleUpload = async (file: File | null) => {
    if (!file || isReadOnly) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setUploading(true);
    try {
      const result = await filesApi.uploadAndResolveUrl(file, 'categories');
      setImageUrl(result.url);
      toast.success('Image uploaded');
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
    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      parent_id: parentId,
      image_url: imageUrl,
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Categories
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Organize products under nested tenant-scoped categories.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
          <Tags className="h-4 w-4" /> Category Details
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Name {!isReadOnly && <span className="text-rose-500">*</span>}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={isReadOnly}
              placeholder="e.g. Beverages"
              className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${
                isReadOnly ? 'opacity-70' : ''
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Parent Category
            </label>
            <ParentCategoryPicker
              value={parentId}
              onChange={setParentId}
              categories={allCategories}
              loading={categoriesLoading}
              excludeIds={excludeIds}
              disabled={isReadOnly}
            />
            {errors.parent_id && (
              <p className="mt-1 text-xs text-rose-600">{errors.parent_id}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Image
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0] || null)}
            />
            {imageUrl ? (
              <div className="relative inline-block overflow-hidden rounded-xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Category"
                  className="h-40 w-40 object-cover"
                />
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-slate-600 shadow hover:bg-white hover:text-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                disabled={isReadOnly || uploading}
                onClick={() => fileRef.current?.click()}
                className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-emerald-600 disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <ImagePlus className="h-6 w-6" />
                )}
                <span className="text-xs font-semibold">
                  {uploading ? 'Uploading...' : 'Upload image'}
                </span>
              </button>
            )}
            {imageUrl && !isReadOnly && (
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="mt-2 text-xs font-semibold text-emerald-700 hover:underline"
              >
                Replace image
              </button>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              readOnly={isReadOnly}
              rows={4}
              placeholder="Optional category description..."
              className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-none ${
                isReadOnly ? 'opacity-70' : ''
              }`}
            />
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
                {mode === 'create' ? 'Create Category' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
