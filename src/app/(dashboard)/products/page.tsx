'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { Product } from '@/types/product.types';
import { initialProducts, initialCategories } from '@/data/products';
import StatsCards from '@/components/products/StatsCards';
import ProductTable from '@/components/products/ProductTable';
import ProductDetailView from '@/components/products/ProductDetailView';
import CategoryView from '@/components/products/CategoryView';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'active').length;
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.salePrice * p.stock, 0);

  const getCategoryColor = (name: string) => categories.find((c) => c.name === name)?.color || '#10b981';

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p)));
  };

  const handleAddCategory = (name: string) => {
    if (!name.trim()) return;
    const colors = ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#6366f1', '#ef4444', '#06b6d4'];
    const newCat = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      color: colors[Math.floor(Math.random() * colors.length)],
      productCount: 0,
    };
    setCategories([...categories, newCat]);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  if (showDetailModal && selectedProduct) {
    return (
      <ProductDetailView
        product={selectedProduct}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
        }}
        onEdit={(product) => {
          setShowDetailModal(false);
          setSelectedProduct(null);
          router.push('/products/new');
        }}
      />
    );
  }

  if (showCategoryModal) {
    return (
      <CategoryView
        categories={categories}
        onClose={() => setShowCategoryModal(false)}
        onAdd={handleAddCategory}
        onDelete={handleDeleteCategory}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Product Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage products, categories, variants, pricing, and inventory.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCategoryModal(true)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Categories
          </button>
          <button onClick={() => router.push('/products/new')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards
        totalProducts={totalProducts}
        activeProducts={activeProducts}
        lowStockProducts={lowStockProducts}
        outOfStockProducts={outOfStockProducts}
        totalValue={totalValue}
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, SKU, or barcode..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
          <option value="all">All Categories</option>
          {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
        </select>
      </div>

      {/* Table */}
      <ProductTable
        products={filteredProducts}
        categories={categories}
        onEdit={(_product) => router.push('/products/new')}
        onDetail={handleOpenDetail}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        getCategoryColor={getCategoryColor}
      />

    </div>
  );
}
