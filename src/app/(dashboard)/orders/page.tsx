'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Download,
  Eye,
  MoreHorizontal,
  ChevronDown,
  Calendar,
  Filter,
  Clock,
  Check,
  X,
  RefreshCw,
  ArrowLeft,
  Printer,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface OrderProduct {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  branch: string;
  cashier: string;
  products: OrderProduct[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  orderDate: string;
  completedDate?: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerId: 'c1',
    customerName: 'Ali Hassan',
    customerPhone: '+92 300 1234 567',
    customerEmail: 'ali.hassan@gmail.com',
    branch: 'Karachi - Main',
    cashier: 'Ahmed Khan',
    products: [
      { id: 'p1', name: 'Chicken Burger', qty: 2, price: 250 },
      { id: 'p2', name: 'Latte Regular', qty: 2, price: 180 },
    ],
    subtotal: 860,
    tax: 129,
    discount: 0,
    totalAmount: 989,
    paymentMethod: 'cash',
    status: 'completed',
    orderDate: '2024-06-15 14:32',
    completedDate: '2024-06-15 14:45',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerId: 'c2',
    customerName: 'Sana Malik',
    customerPhone: '+92 301 8765 432',
    customerEmail: 'sana.m@hotmail.com',
    branch: 'Lahore - Mall',
    cashier: 'Fatima',
    products: [
      { id: 'p3', name: 'Family Deal', qty: 1, price: 1200 },
      { id: 'p4', name: 'Garlic Bread', qty: 2, price: 150 },
    ],
    subtotal: 1500,
    tax: 225,
    discount: 100,
    totalAmount: 1625,
    paymentMethod: 'card',
    status: 'processing',
    orderDate: '2024-06-15 15:20',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customerId: 'c3',
    customerName: 'Bilal Traders Ltd.',
    customerPhone: '+92 21 3456 7890',
    customerEmail: 'accounts@bilaltraders.com',
    branch: 'Karachi - Main',
    cashier: 'Ahmed Khan',
    products: [
      { id: 'p1', name: 'Chicken Burger', qty: 5, price: 250 },
      { id: 'p5', name: 'Thermal Receipt Rolls', qty: 2, price: 450 },
    ],
    subtotal: 1900,
    tax: 285,
    discount: 0,
    totalAmount: 2185,
    paymentMethod: 'transfer',
    status: 'pending',
    orderDate: '2024-06-15 16:10',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customerId: 'c4',
    customerName: 'Fatima Zahra',
    customerPhone: '+92 302 2345 678',
    customerEmail: 'fatima.z@yahoo.com',
    branch: 'Islamabad - F-8',
    cashier: 'Sara Ali',
    products: [
      { id: 'p2', name: 'Latte Regular', qty: 1, price: 180 },
      { id: 'p6', name: 'Chocolate Syrup', qty: 1, price: 350 },
    ],
    subtotal: 530,
    tax: 79.5,
    discount: 0,
    totalAmount: 609.5,
    paymentMethod: 'cash',
    status: 'refunded',
    orderDate: '2024-06-14 13:45',
    completedDate: '2024-06-14 14:00',
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customerId: 'c5',
    customerName: 'Kashmir Foods',
    customerPhone: '+92 42 5678 9012',
    customerEmail: 'orders@kashmirfoods.pk',
    branch: 'Lahore - Mall',
    cashier: 'Fatima',
    products: [
      { id: 'p1', name: 'Chicken Burger', qty: 10, price: 250 },
      { id: 'p3', name: 'Family Deal', qty: 3, price: 1200 },
    ],
    subtotal: 6100,
    tax: 915,
    discount: 500,
    totalAmount: 6515,
    paymentMethod: 'transfer',
    status: 'completed',
    orderDate: '2024-06-15 10:30',
    completedDate: '2024-06-15 10:50',
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    customerId: 'c6',
    customerName: 'Usman Ghani',
    customerPhone: '+92 303 3456 789',
    customerEmail: 'usman.g@gmail.com',
    branch: 'Faisalabad - Downtown',
    cashier: 'Ali',
    products: [
      { id: 'p2', name: 'Latte Regular', qty: 3, price: 180 },
    ],
    subtotal: 540,
    tax: 81,
    discount: 0,
    totalAmount: 621,
    paymentMethod: 'cash',
    status: 'cancelled',
    orderDate: '2024-06-13 11:00',
  },
];

const statusConfig: Record<Order['status'], { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
  processing: { bg: 'bg-blue-50', text: 'text-blue-700', icon: RefreshCw },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: Check },
  cancelled: { bg: 'bg-slate-50', text: 'text-slate-500', icon: X },
  refunded: { bg: 'bg-orange-50', text: 'text-orange-700', icon: RotateCcw },
};

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order & Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Order Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Order Number</p>
                <p className="mt-1 font-semibold text-slate-900">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-slate-500">Date & Time</p>
                <p className="mt-1 font-semibold text-slate-900">{order.orderDate}</p>
              </div>
              <div>
                <p className="text-slate-500">Branch</p>
                <p className="mt-1 font-semibold text-slate-900">{order.branch}</p>
              </div>
              <div>
                <p className="text-slate-500">Cashier</p>
                <p className="mt-1 font-semibold text-slate-900">{order.cashier}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Customer Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Customer Name</p>
                <p className="mt-1 font-semibold text-slate-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-slate-500">Phone</p>
                <p className="mt-1 font-semibold text-slate-900">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="mt-1 font-semibold text-slate-900">{order.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Ordered Products */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Ordered Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Product</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-900">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-900">Price</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-900">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.products.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-slate-900">{p.name}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{p.qty}</td>
                      <td className="px-4 py-3 text-right text-slate-600">PKR {p.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">PKR {(p.qty * p.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment & Actions */}
        <div className="space-y-6">
          {/* Payment Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Information</h3>
            <div className="space-y-3 text-sm border-b border-slate-200 pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900">PKR {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax (15%)</span>
                <span className="font-semibold text-slate-900">PKR {order.tax.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-semibold text-slate-900">-PKR {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-semibold text-slate-900 capitalize">{order.paymentMethod}</span>
              </div>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900">
              <span>Grand Total</span>
              <span>PKR {order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Status</h3>
            <div className="flex items-center gap-2 mb-4">
              {(() => {
                const config = statusConfig[order.status];
                const Icon = config.icon;
                return (
                  <>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bg}`}>
                      <Icon className={`h-5 w-5 ${config.text}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold uppercase tracking-wide ${config.text}`}>{order.status}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200">
              <Printer className="h-4 w-4" />
              Print Invoice
            </button>
            {order.status !== 'refunded' && order.status !== 'cancelled' && (
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-100 px-4 py-2.5 text-sm font-bold text-orange-700 transition hover:bg-orange-200">
                <RotateCcw className="h-4 w-4" />
                Refund Order
              </button>
            )}
            {order.status === 'processing' && (
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const filtered = mockOrders.filter((order) => {
    const searchMatch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const selectedOrder = mockOrders.find((o) => o.id === showDetail);

  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter((o) => o.status === 'pending').length,
    completed: mockOrders.filter((o) => o.status === 'completed').length,
    totalRevenue: mockOrders.reduce((sum, o) => sum + o.totalAmount, 0),
  };

  if (selectedOrder) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <OrderDetail order={selectedOrder} onClose={() => setShowDetail(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and track customer orders</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
          <Download className="h-4 w-4" />
          Export Orders
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Orders</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Clock className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Pending</div>
          <div className="mt-1 text-2xl font-bold text-amber-700">{stats.pending}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Check className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Completed</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">{stats.completed}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Revenue</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">PKR {Math.round(stats.totalRevenue).toLocaleString()}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, customer name, or phone..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Order ID</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Customer</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Branch</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-900">Total Amount</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-900">Items</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Payment</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Date</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((order) => {
                const config = statusConfig[order.status];
                const StatusIcon = config.icon;
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-slate-600">{order.customerName}</td>
                    <td className="px-6 py-4 text-slate-600">{order.branch}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">PKR {order.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{order.products.reduce((sum, p) => sum + p.qty, 0)}</td>
                    <td className="px-6 py-4 capitalize text-slate-600">{order.paymentMethod}</td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-2 rounded-lg ${config.bg} px-3 py-1`}>
                        <StatusIcon className={`h-4 w-4 ${config.text}`} />
                        <span className={`text-xs font-bold uppercase ${config.text}`}>{order.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{order.orderDate}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setShowDetail(order.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
