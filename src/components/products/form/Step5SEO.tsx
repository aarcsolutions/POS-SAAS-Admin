'use client';

import { Globe, Check } from 'lucide-react';
import { Card, Label, Inp, Txt } from './FormUI';
import { ProductFormData } from './types';

interface Props {
  data: ProductFormData;
  onChange: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
}

export default function Step5SEO({ data, onChange }: Props) {
  const statusPill = (status: string, current: string, label: string, emoji: string) => {
    const active = current === status;
    return (
      <button
        onClick={() => onChange('publishingStatus', status as ProductFormData['publishingStatus'])}
        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition border
          ${active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
      >
        {active ? <Check className="h-3 w-3" /> : <span>{emoji}</span>}
        {label}
      </button>
    );
  };
  const summary = {
    name: data.name || '—',
    category: data.mainCategory || '—',
    stock: `${data.stockQuantity} units`,
    status: data.publishingStatus,
    sku: data.sku || '—',
    price: `PKR ${data.sellingPrice.toFixed(2)}`,
    images: data.galleryImages.length + data.urlImages.length,
    active: data.productActive ? 'Yes' : 'No',
  };

  return (
    <div className="space-y-5">
      <Card icon={Globe} title="SEO Settings">
        <div className="space-y-4">
          <div>
            <Label>Product URL Slug</Label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden">
              <span className="px-4 text-sm text-slate-400 bg-slate-50 h-11 flex items-center border-r border-slate-200">/products/</span>
              <Inp type="text" value={data.urlSlug} onChange={(e) => onChange('urlSlug', e.target.value)} placeholder="product-url-slug" className="border-0 rounded-none" />
            </div>
            <p className="mt-1 text-xs text-slate-500">Auto-generated from name. Only lowercase letters, numbers, and hyphens.</p>
          </div>
          <div>
            <Label>SEO Title</Label>
            <Inp type="text" value={data.seoTitle} onChange={(e) => onChange('seoTitle', e.target.value)} placeholder="Page title for search engines (auto-filled from product name)" />
          </div>
          <div>
            <Label>Meta Description</Label>
            <Txt value={data.metaDescription} onChange={(e) => onChange('metaDescription', e.target.value)} rows={3} placeholder="Brief description for search engines (auto-filled from product description)" maxLength={160} />
            <div className="mt-1 text-right text-xs text-slate-400">{data.metaDescription.length}/160 characters</div>
          </div>
        </div>
      </Card>

      <Card icon={Globe} title="Publishing Status">
        <div>
          <div className="mb-3 text-sm font-semibold text-slate-800">Product Status</div>
          <div className="flex gap-2">
            {statusPill('draft', data.publishingStatus, 'Draft', '📝')}
            {statusPill('published', data.publishingStatus, 'Published', '✓')}
            {statusPill('archived', data.publishingStatus, 'Archived', '📦')}
          </div>
        </div>
      </Card>

      <Card icon={Globe} title="Product Summary">
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="grid gap-y-2 gap-x-8 text-sm md:grid-cols-2">
            <div><span className="text-slate-500">Name:</span> <span className="font-semibold text-slate-800">{summary.name}</span></div>
            <div><span className="text-slate-500">SKU:</span> <span className="font-semibold text-slate-800">{summary.sku}</span></div>
            <div><span className="text-slate-500">Category:</span> <span className="font-semibold text-slate-800">{summary.category}</span></div>
            <div><span className="text-slate-500">Price:</span> <span className="font-semibold text-slate-800">{summary.price}</span></div>
            <div><span className="text-slate-500">Stock:</span> <span className="font-semibold text-slate-800">{summary.stock}</span></div>
            <div><span className="text-slate-500">Images:</span> <span className="font-semibold text-slate-800">{summary.images}</span></div>
            <div><span className="text-slate-500">Status:</span> <span className="font-semibold text-slate-800">{summary.status}</span></div>
            <div><span className="text-slate-500">Active:</span> <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{summary.active}</span></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
