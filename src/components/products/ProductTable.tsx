'use client';

import { useState } from 'react';
import { Package, ImageIcon, Barcode, ChevronDown, ChevronUp, Layers, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/types/product.types';

interface Props {
  products: Product[];
  categories: { name: string; color: string }[];
  onEdit: (product: Product) => void;
  onDetail: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  getCategoryColor: (name: string) => string;
}

const variantTypeIcons: Record<string, typeof Layers> = { size: Layers, color: Layers, weight: Layers, other: Layers };

export default function ProductTable({ products, onEdit, onDetail, onDelete, onToggleStatus, getCategoryColor }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [expandedVariants, setExpandedVariants] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-4">Product</th>
            <th className="px-5 py-4">SKU / Barcode</th>
            <th className="px-5 py-4">Category</th>
            <th className="px-5 py-4">Price</th>
            <th className="px-5 py-4">Stock</th>
            <th className="px-5 py-4">Variants</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {products.map((product) => {
            const isLowStock = product.stock <= product.minStock && product.stock > 0;
            const isOutOfStock = product.stock === 0;
            return (
              <tr key={product.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${product.hasImage ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {product.hasImage ? <ImageIcon className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{product.name}</div>
                      <div className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">{product.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-600">{product.sku}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Barcode className="h-3 w-3" /> {product.barcode}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{ backgroundColor: `${getCategoryColor(product.category)}15`, color: getCategoryColor(product.category) }}>
                    {product.category}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-800">PKR {product.salePrice}</div>
                    <div className="text-xs text-slate-400">Cost: PKR {product.costPrice}</div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <div className={`text-sm font-semibold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {product.stock} units
                    </div>
                    <div className="text-xs text-slate-400">Min: {product.minStock}</div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {product.variants.length > 0 ? (
                    <button onClick={() => setExpandedVariants(expandedVariants === product.id ? null : product.id)}
                      className="flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">
                      <Layers className="h-3 w-3" /> {product.variants.length} variants
                      {expandedVariants === product.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">No variants</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => onToggleStatus(product.id)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${product.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {product.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="relative inline-block">
                    <button onClick={() => setDropdownOpen(dropdownOpen === product.id ? null : product.id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {dropdownOpen === product.id && (
                      <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                        <button onClick={() => { setDropdownOpen(null); onDetail(product); }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50">
                          <Eye className="h-4 w-4" /> View Details
                        </button>
                        <button onClick={() => { setDropdownOpen(null); onEdit(product); }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50">
                          <Pencil className="h-4 w-4" /> Edit Product
                        </button>
                        <button onClick={() => { setDropdownOpen(null); onDelete(product.id); }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50">
                          <Trash2 className="h-4 w-4" /> Delete Product
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Expanded Variants */}
      {expandedVariants && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Variants for {products.find((p) => p.id === expandedVariants)?.name}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {products.find((p) => p.id === expandedVariants)?.variants.map((variant) => {
              const VIcon = variantTypeIcons[variant.type] || Layers;
              return (
                <div key={variant.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <VIcon className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-800">{variant.value}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-500">
                    <div><span className="text-slate-400">SKU:</span> {variant.sku}</div>
                    <div><span className="text-slate-400">+Price:</span> PKR {variant.additionalPrice}</div>
                    <div><span className="text-slate-400">Stock:</span> <span className={variant.stock <= 5 ? 'font-bold text-rose-600' : 'text-emerald-600'}>{variant.stock}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {products.length === 0 && (
        <div className="py-12 text-center text-sm text-slate-400">No products found matching your criteria.</div>
      )}
    </div>
  );
}
