'use client';

import {
  ArrowLeft,
  Barcode,
  Layers,
  DollarSign,
  Package,
  Boxes,
  Pencil,
} from 'lucide-react';
import { Product } from '@/types/product.types';

interface Props {
  product: Product;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export default function ProductDetailView({ product, onClose, onEdit }: Props) {
  const isLowStock = product.stock <= product.minStock && product.stock > 0;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${product.hasImage ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Package className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{product.name}</h1>
              <p className="text-sm text-slate-500">{product.sku}</p>
            </div>
          </div>
          <span className={`rounded-full px-4 py-1.5 text-sm font-bold ${product.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {product.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Product Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Barcode className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Barcode</div>
                  <div className="text-sm font-medium text-slate-800">{product.barcode}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Package className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Category</div>
                  <div className="text-sm font-medium text-slate-800">{product.category}</div>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                {product.description}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <div className="text-xs text-slate-500">Cost Price</div>
                <div className="text-xl font-bold text-slate-900">PKR {product.costPrice}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <div className="text-xs text-slate-500">Sale Price</div>
                <div className="text-xl font-bold text-emerald-600">PKR {product.salePrice}</div>
              </div>
            </div>
            <div className="mt-3 text-center text-xs text-slate-500">
              Margin: {(((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Stock Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="text-sm text-slate-600">Current Stock</span>
                <span className={`text-xl font-bold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {product.stock} units
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="text-sm text-slate-600">Minimum Stock</span>
                <span className="text-sm font-semibold text-slate-800">{product.minStock} units</span>
              </div>
              {isOutOfStock && (
                <div className="rounded-lg bg-rose-50 p-3 text-center text-sm font-bold text-rose-600">
                  <Boxes className="mx-auto mb-1 h-5 w-5" /> Out of Stock
                </div>
              )}
              {isLowStock && (
                <div className="rounded-lg bg-amber-50 p-3 text-center text-sm font-bold text-amber-600">
                  Low Stock Alert
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Value</h3>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Value</div>
                <div className="text-xl font-bold text-slate-900">PKR {product.salePrice * product.stock}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variants */}
      {product.variants.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Variants</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {product.variants.map((variant) => (
              <div key={variant.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-800">{variant.value}</span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <div>SKU: <span className="font-medium text-slate-700">{variant.sku}</span></div>
                  <div>Additional Price: <span className="font-medium text-slate-700">PKR {variant.additionalPrice}</span></div>
                  <div>Stock: <span className={variant.stock <= 5 ? 'font-bold text-rose-600' : 'font-bold text-emerald-600'}>{variant.stock}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <button
          onClick={() => onEdit(product)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4" />
          Edit Product
        </button>
        <button
          onClick={onClose}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
