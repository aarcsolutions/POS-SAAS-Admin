'use client';

import { useState } from 'react';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Search,
  Plus,
  Filter,
  Package,
  Truck,
  Calendar,
  User,
  FileText,
  Check,
  X,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Warehouse,
} from 'lucide-react';
import StockTransactionForm from '@/components/inventory/StockTransactionForm';
import LowStockPanel from '@/components/inventory/LowStockPanel';

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  supplier: string;
  lastUpdated: string;
  status: 'optimal' | 'low' | 'critical' | 'out';
}

interface StockTransaction {
  id: string;
  type: 'in' | 'out';
  productName: string;
  sku: string;
  quantity: number;
  unit: string;
  reason: string;
  supplier?: string;
  reference: string;
  date: string;
  performedBy: string;
  notes: string;
}

const initialInventory: InventoryItem[] = [
  { id: '1', productName: 'Premium Coffee Beans', sku: 'COF-001', category: 'Beverages', currentStock: 45, minStock: 20, maxStock: 100, unit: 'kg', supplier: 'Al-Rashid Traders', lastUpdated: '2024-06-15', status: 'optimal' },
  { id: '2', productName: 'Whole Wheat Flour', sku: 'FLR-002', category: 'Raw Materials', currentStock: 8, minStock: 15, maxStock: 80, unit: 'kg', supplier: 'Faisalabad Mills', lastUpdated: '2024-06-14', status: 'low' },
  { id: '3', productName: 'Chocolate Syrup', sku: 'CHS-003', category: 'Desserts', currentStock: 0, minStock: 10, maxStock: 50, unit: 'bottles', supplier: 'Sweet Imports Co.', lastUpdated: '2024-06-10', status: 'out' },
  { id: '4', productName: 'Disposable Cups (500ml)', sku: 'CUP-004', category: 'Packaging', currentStock: 3, minStock: 25, maxStock: 200, unit: 'packs', supplier: 'Karachi Packaging', lastUpdated: '2024-06-13', status: 'critical' },
  { id: '5', productName: 'Fresh Milk Cartons', sku: 'MLK-005', category: 'Beverages', currentStock: 120, minStock: 30, maxStock: 150, unit: 'liters', supplier: 'Al-Rashid Traders', lastUpdated: '2024-06-15', status: 'optimal' },
  { id: '6', productName: 'Sugar (Refined)', sku: 'SUG-006', category: 'Raw Materials', currentStock: 12, minStock: 20, maxStock: 100, unit: 'kg', supplier: 'Faisalabad Mills', lastUpdated: '2024-06-12', status: 'low' },
  { id: '7', productName: 'Green Tea Bags', sku: 'TEA-007', category: 'Beverages', currentStock: 250, minStock: 50, maxStock: 300, unit: 'boxes', supplier: 'Sweet Imports Co.', lastUpdated: '2024-06-15', status: 'optimal' },
  { id: '8', productName: 'Burger Patties', sku: 'BGR-008', category: 'Food Items', currentStock: 60, minStock: 20, maxStock: 80, unit: 'pcs', supplier: 'Karachi Packaging', lastUpdated: '2024-06-14', status: 'optimal' },
];

const initialTransactions: StockTransaction[] = [
  { id: '1', type: 'in', productName: 'Premium Coffee Beans', sku: 'COF-001', quantity: 50, unit: 'kg', reason: 'Purchase Order', supplier: 'Al-Rashid Traders', reference: 'PO-2024-0842', date: '2024-06-15', performedBy: 'Ahmed Khan', notes: 'Fresh batch from Ethiopia' },
  { id: '2', type: 'out', productName: 'Whole Wheat Flour', sku: 'FLR-002', quantity: 12, unit: 'kg', reason: 'Production Usage', reference: 'PRD-2024-1203', date: '2024-06-14', performedBy: 'Fatima Ali', notes: 'Used for daily bread production' },
  { id: '3', type: 'out', productName: 'Chocolate Syrup', sku: 'CHS-003', quantity: 5, unit: 'bottles', reason: 'Sales', reference: 'INV-2024-5521', date: '2024-06-10', performedBy: 'Hassan Raza', notes: 'Sold to customer' },
  { id: '4', type: 'in', productName: 'Fresh Milk Cartons', sku: 'MLK-005', quantity: 100, unit: 'liters', reason: 'Purchase Order', supplier: 'Al-Rashid Traders', reference: 'PO-2024-0840', date: '2024-06-15', performedBy: 'Ahmed Khan', notes: 'Daily delivery' },
  { id: '5', type: 'out', productName: 'Disposable Cups (500ml)', sku: 'CUP-004', quantity: 45, unit: 'packs', reason: 'Damaged', reference: 'ADJ-2024-0045', date: '2024-06-13', performedBy: 'Zainab Bibi', notes: 'Water damage during storage' },
];

const reasonsIn = ['Purchase Order', 'Return from Customer', 'Transfer from Branch', 'Stock Adjustment', 'Opening Stock'];
const reasonsOut = ['Sales', 'Production Usage', 'Damaged/Expired', 'Transfer to Branch', 'Stock Adjustment', 'Internal Use'];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [transactions, setTransactions] = useState<StockTransaction[]>(initialTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'alerts'>('overview');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'in' | 'out'>('in');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const lowStockItems = inventory.filter((item) => item.status === 'low' || item.status === 'critical' || item.status === 'out');
  const criticalItems = inventory.filter((item) => item.status === 'critical' || item.status === 'out');

  const totalStockValue = inventory.reduce((sum, item) => sum + item.currentStock, 0);
  const totalTransactions = transactions.length;
  const stockInCount = transactions.filter((t) => t.type === 'in').reduce((sum, t) => sum + t.quantity, 0);
  const stockOutCount = transactions.filter((t) => t.type === 'out').reduce((sum, t) => sum + t.quantity, 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-emerald-100 text-emerald-700';
      case 'low': return 'bg-amber-100 text-amber-700';
      case 'critical': return 'bg-rose-100 text-rose-700';
      case 'out': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'optimal': return 'Optimal';
      case 'low': return 'Low Stock';
      case 'critical': return 'Critical';
      case 'out': return 'Out of Stock';
      default: return status;
    }
  };

  const handleTransactionSubmit = (data: Omit<StockTransaction, 'id' | 'date' | 'performedBy'>) => {
    const newTransaction: StockTransaction = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      performedBy: 'Current User',
    };
    setTransactions([newTransaction, ...transactions]);

    // Update inventory stock
    setInventory(inventory.map((item) => {
      if (item.sku === data.sku) {
        const newStock = data.type === 'in' ? item.currentStock + data.quantity : item.currentStock - data.quantity;
        let newStatus: InventoryItem['status'] = 'optimal';
        if (newStock === 0) newStatus = 'out';
        else if (newStock <= item.minStock * 0.3) newStatus = 'critical';
        else if (newStock <= item.minStock) newStatus = 'low';
        return { ...item, currentStock: newStock, status: newStatus, lastUpdated: newTransaction.date };
      }
      return item;
    }));

    setShowTransactionForm(false);
  };

  if (showTransactionForm) {
    return (
      <StockTransactionForm
        type={transactionType}
        inventory={inventory}
        reasons={transactionType === 'in' ? reasonsIn : reasonsOut}
        onClose={() => setShowTransactionForm(false)}
        onSubmit={handleTransactionSubmit}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-slate-500">Track stock levels, manage transactions, and monitor low stock alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setTransactionType('in'); setShowTransactionForm(true); }}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <ArrowDownLeft className="h-4 w-4" />
            Stock In
          </button>
          <button
            onClick={() => { setTransactionType('out'); setShowTransactionForm(true); }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowUpRight className="h-4 w-4" />
            Stock Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Boxes className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Items</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{inventory.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Warehouse className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Stock Units</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalStockValue}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Low Stock Alerts</div>
          <div className="mt-1 text-2xl font-bold text-rose-700">{lowStockItems.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Stock In (Total)</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{stockInCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Stock Out (Total)</div>
          <div className="mt-1 text-2xl font-bold text-amber-700">{stockOutCount}</div>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {criticalItems.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-700">Critical Stock Alert</h3>
              <p className="text-xs text-rose-600">
                {criticalItems.length} item(s) are critically low or out of stock. Immediate restock required.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700"
            >
              View Alerts
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {[
          { id: 'overview', label: 'Inventory Overview', icon: Package },
          { id: 'transactions', label: 'Stock Transactions', icon: FileText },
          { id: 'alerts', label: 'Low Stock Alerts', icon: AlertTriangle },
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition
                ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU, or supplier..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
        {activeTab === 'overview' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            <option value="all">All Statuses</option>
            <option value="optimal">Optimal</option>
            <option value="low">Low Stock</option>
            <option value="critical">Critical</option>
            <option value="out">Out of Stock</option>
          </select>
        )}
        {activeTab === 'transactions' && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            <option value="all">All Transactions</option>
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
          </select>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Current Stock</th>
                <th className="px-5 py-4">Min / Max</th>
                <th className="px-5 py-4">Supplier</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Last Updated</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                        {item.productName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{item.productName}</div>
                        <div className="text-xs text-slate-400">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{item.sku}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-bold text-slate-800">{item.currentStock} {item.unit}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs text-slate-500">{item.minStock} / {item.maxStock} {item.unit}</div>
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.status === 'optimal' ? 'bg-emerald-500' :
                          item.status === 'low' ? 'bg-amber-500' :
                          item.status === 'critical' ? 'bg-rose-500' : 'bg-slate-300'
                        }`}
                        style={{ width: `${Math.min(100, (item.currentStock / item.maxStock) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Truck className="h-3.5 w-3.5 text-slate-400" />
                      {item.supplier}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">{item.lastUpdated}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === item.id ? null : item.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      {dropdownOpen === item.id && (
                        <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                          <button
                            onClick={() => { setTransactionType('in'); setShowTransactionForm(true); setDropdownOpen(null); }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                          >
                            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                            Stock In
                          </button>
                          <button
                            onClick={() => { setTransactionType('out'); setShowTransactionForm(true); setDropdownOpen(null); }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                          >
                            <ArrowUpRight className="h-4 w-4 text-amber-600" />
                            Stock Out
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredInventory.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">No inventory items found matching your criteria.</div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Quantity</th>
                <th className="px-5 py-4">Reason</th>
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4">Supplier</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                      t.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {t.type === 'in' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                      {t.type === 'in' ? 'IN' : 'OUT'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800">{t.productName}</div>
                    <div className="text-xs text-slate-400">{t.sku}</div>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-800">{t.quantity} {t.unit}</td>
                  <td className="px-5 py-4 text-slate-600">{t.reason}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{t.reference}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{t.supplier || '—'}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{t.date}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <User className="h-3 w-3 text-slate-400" />
                      {t.performedBy}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">No transactions found matching your criteria.</div>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <LowStockPanel items={lowStockItems} onStockIn={(_item: InventoryItem) => {
          setTransactionType('in');
          setShowTransactionForm(true);
        }} />
      )}
    </div>
  );
}
