'use client';

import { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  Eye,
  Printer,
  Clock,
  CreditCard,
  DollarSign,
  Repeat,
  X,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface Transaction {
  id: string;
  orderId?: string;
  customerName: string;
  amount: number;
  tax: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'jazzcash' | 'easypaisa';
  type: 'sale' | 'refund' | 'expense' | 'adjustment';
  status: 'success' | 'pending' | 'failed' | 'refunded';
  date: string;
  branch: string;
}

const mockTransactions: Transaction[] = [
  { id: 'T-1001', orderId: 'ORD-2024-001', customerName: 'Ali Hassan', amount: 989, tax: 129, paymentMethod: 'cash', type: 'sale', status: 'success', date: '2024-06-15 14:35', branch: 'Karachi - Main' },
  { id: 'T-1002', orderId: 'ORD-2024-002', customerName: 'Sana Malik', amount: 1625, tax: 225, paymentMethod: 'card', type: 'sale', status: 'pending', date: '2024-06-15 15:22', branch: 'Lahore - Mall' },
  { id: 'T-1003', orderId: 'ORD-2024-004', customerName: 'Fatima Zahra', amount: -609.5, tax: 79.5, paymentMethod: 'cash', type: 'refund', status: 'refunded', date: '2024-06-14 14:05', branch: 'Islamabad - F-8' },
  { id: 'T-1004', orderId: undefined, customerName: 'Office Expense', amount: 3500, tax: 0, paymentMethod: 'transfer', type: 'expense', status: 'success', date: '2024-06-13 10:12', branch: 'Head Office' },
];

function TransactionDetail({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Transactions
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Transaction Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Transaction ID</p>
                <p className="mt-1 font-semibold text-slate-900">{tx.id}</p>
              </div>
              <div>
                <p className="text-slate-500">Order ID</p>
                <p className="mt-1 font-semibold text-slate-900">{tx.orderId || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Customer</p>
                <p className="mt-1 font-semibold text-slate-900">{tx.customerName}</p>
              </div>
              <div>
                <p className="text-slate-500">Branch</p>
                <p className="mt-1 font-semibold text-slate-900">{tx.branch}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Details</h3>
            <div className="space-y-3 text-sm border-b border-slate-200 pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-semibold text-slate-900 capitalize">{tx.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-semibold text-slate-900">PKR {tx.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax</span>
                <span className="font-semibold text-slate-900">PKR {tx.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-semibold text-slate-900">{tx.date}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
                <FileText className="h-4 w-4" />
                View Invoice
              </button>
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                <Download className="h-4 w-4" />
                Download Receipt
              </button>
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                <Printer className="h-4 w-4" />
                Print Receipt
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Status</h3>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tx.status === 'success' ? 'bg-emerald-50' : tx.status === 'pending' ? 'bg-amber-50' : tx.status === 'failed' ? 'bg-rose-50' : 'bg-slate-50'}`}>
                {tx.status === 'success' ? <Check className="h-5 w-5 text-emerald-700" /> : tx.status === 'pending' ? <Clock className="h-5 w-5 text-amber-700" /> : tx.status === 'failed' ? <X className="h-5 w-5 text-rose-700" /> : <Repeat className="h-5 w-5 text-slate-700" />}
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-slate-900">{tx.status}</p>
                <p className="text-xs text-slate-500">{tx.type} • {tx.paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetail, setShowDetail] = useState<string | null>(null);

  const filtered = mockTransactions.filter((t) => {
    const searchMatch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) || (t.orderId || '').toLowerCase().includes(searchQuery.toLowerCase()) || t.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const methodMatch = methodFilter === 'all' || t.paymentMethod === methodFilter;
    const statusMatch = statusFilter === 'all' || t.status === statusFilter;
    return searchMatch && methodMatch && statusMatch;
  });

  const selectedTx = mockTransactions.find((m) => m.id === showDetail);

  const stats = { total: mockTransactions.length, totalAmount: mockTransactions.reduce((s, x) => s + x.amount, 0) };

  if (selectedTx) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><TransactionDetail tx={selectedTx} onClose={() => setShowDetail(null)} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transactions</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor all payment activities</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><FileText className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-500">Total Transactions</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Check className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-500">Total Amount</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">PKR {Math.round(stats.totalAmount).toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Clock className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-500">Pending</div>
          <div className="mt-1 text-2xl font-bold text-amber-700">{mockTransactions.filter(t=>t.status==='pending').length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700"><DollarSign className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-500">Payment Methods</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{[...new Set(mockTransactions.map(t=>t.paymentMethod))].length}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Search by transaction ID, order ID, or customer..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
        </div>
        <select value={dateFilter} onChange={(e)=>setDateFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <select value={methodFilter} onChange={(e)=>setMethodFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
          <option value="all">All Methods</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="transfer">Bank Transfer</option>
          <option value="jazzcash">JazzCash</option>
          <option value="easypaisa">EasyPaisa</option>
        </select>
        <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Transaction ID</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Order ID</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Customer</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-900">Amount</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Payment Method</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Type</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Date</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900">{tx.id}</td>
                  <td className="px-6 py-4 text-slate-600">{tx.orderId || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">{tx.customerName}</td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900">PKR {tx.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 capitalize text-slate-600">{tx.paymentMethod}</td>
                  <td className="px-6 py-4 text-slate-600">{tx.type}</td>
                  <td className="px-6 py-4 text-center">
                    <div className={`inline-flex items-center gap-2 rounded-lg ${tx.status === 'success' ? 'bg-emerald-50 text-emerald-700' : tx.status === 'pending' ? 'bg-amber-50 text-amber-700' : tx.status === 'failed' ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-700'} px-3 py-1`}>
                      {tx.status === 'success' ? <Check className="h-4 w-4" /> : tx.status === 'pending' ? <Clock className="h-4 w-4" /> : tx.status === 'failed' ? <X className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
                      <span className="text-xs font-bold uppercase">{tx.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{tx.date}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={()=>setShowDetail(tx.id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"><Eye className="h-4 w-4" /> View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
