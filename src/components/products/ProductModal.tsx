'use client';

import { useState } from 'react';
import { X, Barcode, Layers, Trash2, ImageIcon } from 'lucide-react';
import { Product, Variant, ProductCategory } from '@/types/product.types';

interface Props {
  isOpen: boolean;
  editingProduct: Product | null;
  categories: ProductCategory[];
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => void;
}

export default function ProductModal({ isOpen, editingProduct, categories, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', sku: '', barcode: '', category: categories[0]?.name || '', description: '',
    costPrice: 0, salePrice: 0, stock: 0, minStock: 10, status: 'active', variants: [],
  });

  const [newVariant, setNewVariant] = useState<Partial<Variant>>({
    type: 'size', value: '', additionalPrice: 0, stock: 0, sku: '',
  });

  // Reset form when editingProduct changes
  useState(() => {
    if (editingProduct) {
      setFormData({ ...editingProduct });
    } else {
      setFormData({
        name: '', sku: '', barcode: '', category: categories[0]?.name || '', description: '',
        costPrice: 0, salePrice: 0, stock: 0, minStock: 10, status: 'active', variants: [],
      });
    }
  });

  const handleAddVariant = () => {
    if (!newVariant.value || !formData.variants) return;
    const variant: Variant = {
      id: Math.random().toString(36).substr(2, 9),
      type: (newVariant.type as Variant['type']) || 'size',
      value: newVariant.value,
      additionalPrice: newVariant.additionalPrice || 0,
      stock: newVariant.stock || 0,
      sku: newVariant.sku || `${formData.sku || 'PRD'}-${newVariant.value}`,
    };
    setFormData({ ...formData, variants: [...formData.variants, variant] });
    setNewVariant({ type: 'size', value: '', additionalPrice: 0, stock: 0, sku: '' });
  };

  const handleRemoveVariant = (variantId: string) => {
    setFormData({ ...formData, variants: formData.variants?.filter((v) => v.id !== variantId) || [] });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Basic Info */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-700">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Product Name</label>
                <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" placeholder="Enter product name" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">SKU</label>
                  <input type="text" value={formData.sku || ''} onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" placeholder="PRD-XXX" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Barcode</label>
                  <div className="relative">
                    <Barcode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={formData.barcode || ''} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" placeholder="8901234567..." />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                  <select value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
                    {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" placeholder="Product description..." />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-700">Pricing & Stock</h3>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: 'Cost Price', key: 'costPrice', prefix: 'PKR', type: 'number' },
                { label: 'Sale Price', key: 'salePrice', prefix: 'PKR', type: 'number' },
                { label: 'Stock Qty', key: 'stock', prefix: '', type: 'number' },
                { label: 'Min Stock', key: 'minStock', prefix: '', type: 'number' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-2 block text-sm font-medium text-slate-700">{field.label}</label>
                  <div className="relative">
                    {field.prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">{field.prefix}</span>}
                    <input type={field.type} value={(formData as any)[field.key] || ''} onChange={(e) => setFormData({ ...formData, [field.key]: Number(e.target.value) })}
                      className={`h-11 w-full rounded-xl border border-slate-200 bg-white ${field.prefix ? 'pl-12' : 'px-4'} pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10`} placeholder="0" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-700">Product Image</h3>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white text-slate-400">
                <ImageIcon className="h-8 w-8" />
              </div>
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Upload Image
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">PNG, JPG up to 2MB. 500x500px recommended.</p>
          </div>

          {/* Variants */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-700">Variants (Size, Color, etc.)</h3>
            {formData.variants && formData.variants.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.variants.map((variant) => (
                  <div key={variant.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <Layers className="h-4 w-4 text-emerald-600" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-800">{variant.value}</div>
                      <div className="text-xs text-slate-500">{variant.type} | +PKR {variant.additionalPrice} | Stock: {variant.stock} | {variant.sku}</div>
                    </div>
                    <button onClick={() => handleRemoveVariant(variant.id)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-5">
              <select value={newVariant.type} onChange={(e) => setNewVariant({ ...newVariant, type: e.target.value as Variant['type'] })}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none">
                <option value="size">Size</option>
                <option value="color">Color</option>
                <option value="weight">Weight</option>
                <option value="other">Other</option>
              </select>
              <input type="text" value={newVariant.value} onChange={(e) => setNewVariant({ ...newVariant, value: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none" placeholder="Value" />
              <input type="number" value={newVariant.additionalPrice} onChange={(e) => setNewVariant({ ...newVariant, additionalPrice: Number(e.target.value) })}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none" placeholder="+Price" />
              <input type="number" value={newVariant.stock} onChange={(e) => setNewVariant({ ...newVariant, stock: Number(e.target.value) })}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none" placeholder="Stock" />
              <button onClick={handleAddVariant} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Add
              </button>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select value={formData.status || 'active'} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={() => onSubmit(formData)}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
            {editingProduct ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
