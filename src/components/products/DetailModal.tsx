'use client';

import { X, Barcode, Layers, DollarSign, Package, Check, Boxes } from 'lucide-react';
import { Product } from '@/types/product.types';

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export default function DetailModal({ product, isOpen, onClose, onEdit }: Props) {
  if (!isOpen || !product) return null;

  const isLowStock = product.stock <= product.minStock && product.stock > 0;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${product.hasImage ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{product.name}</h2>
              <p className="text-sm text-slate-500">{product.sku}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Details</div>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Barcode className="h-4 w-4 text-slate-400" /> {product.barcode}
                </div>
                <div>Category: <span className="font-semibold">{product.category}</span></div>
                <div>{product.description}</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Pricing</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xs text-slate-500">Cost Price</div>
                  <div className="text-lg font-bold text-slate-900">PKR {product.costPrice}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500">Sale Price</div>
                  <div className="text-lg font-bold text-emerald-600">PKR {product.salePrice}</div>
                </div>
              </div>
              <div className="mt-3 text-center text-xs text-slate-500">
                Margin: {((product.salePrice - product.costPrice) / product.salePrice * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Stock</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Current Stock</span>
                  <span className={`text-lg font-bold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {product.stock} units
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Minimum Stock</span>
                  <span className="text-sm font-semibold text-slate-800">{product.minStock} units</span>
                </div>
                {isOutOfStock && (
                  <div className="rounded-lg bg-rose-50 p-2 text-center text-xs font-bold text-rose-600">
                    <Boxes className="mx-auto mb-1 h-4 w-4" /> Out of Stock
                  </div>
                )}
                {isLowStock && (
                  <div className="rounded-lg bg-amber-50 p-2 text-center text-xs font-bold text-amber-600">
                    Low Stock Alert
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Status</div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${product.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {product.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Inventory Value</div>
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                PKR {product.salePrice * product.stock}
              </div>
            </div>
          </div>
        </div>

        {/* Variants */}
        {product.variants.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-bold text-slate-700">Variants</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {product.variants.map((variant) => (
                <div key={variant.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-800">{variant.value}</span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <div>SKU: {variant.sku}</div>
                    <div>+Price: PKR {variant.additionalPrice}</div>
                    <div>Stock: <span className={variant.stock <= 5 ? 'font-bold text-rose-600' : 'text-emerald-600'}>{variant.stock}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={() => { onClose(); onEdit(product); }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <Check className="h-4 w-4" /> Edit Product
          </button>
          <button onClick={onClose}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
