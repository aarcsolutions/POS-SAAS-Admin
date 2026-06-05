'use client';

import { useState } from 'react';
import { Info, Plus, Trash2 } from 'lucide-react';
import { Card, Label, Inp, Txt, Sel, Checkbox, Radio } from './FormUI';
import { ProductFormData } from './types';

interface Props {
  data: ProductFormData;
  onChange: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
}

const categories = ['Beverages', 'Food Items', 'Desserts', 'Snacks', 'Raw Materials'];
const subCats: Record<string, string[]> = {
  Beverages: ['Hot Drinks', 'Cold Drinks', 'Juices'],
  'Food Items': ['Burgers', 'Wraps', 'Platters', 'Sandwiches'],
  Desserts: ['Cakes', 'Pastries', 'Ice Cream'],
  Snacks: ['Fries', 'Wings', 'Sides'],
  'Raw Materials': ['Coffee Beans', 'Flour', 'Spices', 'Packaging'],
};
const productTypes = ['Simple Product', 'Variable Product', 'Service', 'Bundle'];

export default function Step1BasicInfo({ data, onChange }: Props) {
  const [newVariantName, setNewVariantName] = useState('');

  const addVariant = () => {
    if (!newVariantName.trim()) return;
    onChange('variants', [...data.variants, { id: Math.random().toString(36).substr(2, 9), name: newVariantName.trim(), values: [] }]);
    setNewVariantName('');
  };

  const removeVariant = (id: string) => {
    onChange('variants', data.variants.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-5">
      <Card icon={Info} title="Basic Information">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label req>Product Name</Label>
            <Inp type="text" value={data.name} onChange={(e) => onChange('name', e.target.value)} placeholder="Enter product name" />
          </div>
          <div className="md:col-span-2">
            <Label>Product Description</Label>
            <Txt value={data.description} onChange={(e) => onChange('description', e.target.value)} rows={3} placeholder="Describe your product in detail..." maxLength={2000} />
            <div className="mt-1 text-right text-xs text-slate-400">{data.description.length}/2000</div>
          </div>
          <div>
            <Label req>SKU (Stock Keeping Unit)</Label>
            <Inp type="text" value={data.sku} onChange={(e) => onChange('sku', e.target.value)} placeholder="e.g. PRD-001" />
          </div>
          <div>
            <Label>Supplier</Label>
            <Inp type="text" value={data.supplier} onChange={(e) => onChange('supplier', e.target.value)} placeholder="Supplier name or company" />
          </div>
        </div>
      </Card>

      <Card icon={Info} title="Category">
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <Label req>Main Category</Label>
            <Sel value={data.mainCategory} onChange={(e) => { onChange('mainCategory', e.target.value); onChange('subCategory', ''); }}>
              <option value="">Select category...</option>
              {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </Sel>
          </div>
          <div>
            <Label>Sub Category</Label>
            <Sel value={data.subCategory} onChange={(e) => onChange('subCategory', e.target.value)} disabled={!data.mainCategory}>
              <option value="">Select sub category...</option>
              {(subCats[data.mainCategory] || []).map((sc) => (<option key={sc} value={sc}>{sc}</option>))}
            </Sel>
          </div>
          <div>
            <Label>Product Type</Label>
            <Sel value={data.productType} onChange={(e) => onChange('productType', e.target.value)}>
              {productTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
            </Sel>
          </div>
        </div>
      </Card>

      <Card icon={Info} title="Product Variants">
        {data.variants.length > 0 && (
          <div className="mb-4 space-y-2">
            {data.variants.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5">
                <span className="text-sm font-medium text-slate-800">{v.name}</span>
                <button onClick={() => removeVariant(v.id)} className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Inp type="text" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addVariant(); }} placeholder="Variant name (e.g. Size, Color, Material)" />
          <button onClick={addVariant} className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Add Variant
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">No variants added. Add variants like Size, Color, or Material.</p>
      </Card>

      <Card icon={Info} title="Visibility & Status">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-3 text-sm font-semibold text-slate-800">Customer Visibility Groups</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5">
                <Checkbox checked={data.visibilityRetail} onChange={(e) => onChange('visibilityRetail', e.target.checked)} />
                <span className="text-sm text-slate-800">Retail</span>
              </label>
              <label className="flex items-center gap-2.5">
                <Checkbox checked={data.visibilityWholesale} onChange={(e) => onChange('visibilityWholesale', e.target.checked)} />
                <span className="text-sm text-slate-800">Wholesale</span>
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-500">Select which customer groups can see this product.</p>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold text-slate-800">Product Active</div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2.5">
                <Radio name="productActive" checked={data.productActive} onChange={() => onChange('productActive', true)} />
                <span className="text-sm text-slate-800">Yes — Active</span>
              </label>
              <label className="flex items-center gap-2.5">
                <Radio name="productActive" checked={!data.productActive} onChange={() => onChange('productActive', false)} />
                <span className="text-sm text-slate-800">No — Inactive</span>
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-500">Inactive products are hidden from all customers.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
