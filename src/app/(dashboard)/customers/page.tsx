'use client';

import { useState } from 'react';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  Users, Search, Plus, Phone, Mail, MapPin, Calendar, CreditCard,
  ShoppingBag, ArrowLeft, Pencil, Trash2, Eye, MoreHorizontal, ChevronDown,
  TrendingUp, TrendingDown, Star, Check, Clock, UserCheck, UserX,
} from 'lucide-react';
import CustomerForm from '@/components/customers/CustomerForm';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'retail' | 'wholesale' | 'corporate';
  status: 'active' | 'inactive';
  totalOrders: number;
  totalSpent: number;
  outstanding: number;
  lastOrderDate: string;
  joinedDate: string;
  address: string;
  city: string;
  notes: string;
  loyaltyPoints: number;
}

const customers: Customer[] = [
  { id: '1', name: 'Ali Hassan', email: 'ali.hassan@gmail.com', phone: '+92 300 1234 567', type: 'retail', status: 'active', totalOrders: 24, totalSpent: 45200, outstanding: 0, lastOrderDate: '2024-06-15', joinedDate: '2023-08-12', address: 'Block 5, Clifton', city: 'Karachi', notes: 'Regular customer, prefers home delivery.', loyaltyPoints: 2450 },
  { id: '2', name: 'Sana Malik', email: 'sana.m@hotmail.com', phone: '+92 301 8765 432', type: 'wholesale', status: 'active', totalOrders: 56, totalSpent: 185000, outstanding: 12500, lastOrderDate: '2024-06-14', joinedDate: '2023-02-20', address: 'Model Town', city: 'Lahore', notes: 'Bulk buyer for events. 30-day credit.', loyaltyPoints: 8900 },
  { id: '3', name: 'Bilal Traders Ltd.', email: 'accounts@bilaltraders.com', phone: '+92 21 3456 7890', type: 'corporate', status: 'active', totalOrders: 112, totalSpent: 420000, outstanding: 45000, lastOrderDate: '2024-06-13', joinedDate: '2022-11-05', address: 'DHA Phase 6', city: 'Karachi', notes: 'Corporate client, quarterly billing.', loyaltyPoints: 15000 },
  { id: '4', name: 'Fatima Zahra', email: 'fatima.z@yahoo.com', phone: '+92 302 2345 678', type: 'retail', status: 'inactive', totalOrders: 8, totalSpent: 8900, outstanding: 0, lastOrderDate: '2024-04-22', joinedDate: '2023-10-01', address: 'F-8 Markaz', city: 'Islamabad', notes: 'Inactive for 2 months. Send re-engagement offer.', loyaltyPoints: 450 },
  { id: '5', name: 'Kashmir Foods', email: 'orders@kashmirfoods.pk', phone: '+92 42 5678 9012', type: 'wholesale', status: 'active', totalOrders: 78, totalSpent: 256000, outstanding: 0, lastOrderDate: '2024-06-15', joinedDate: '2022-05-15', address: 'Gulberg III', city: 'Lahore', notes: 'Restaurant supplier. Weekly orders.', loyaltyPoints: 11200 },
  { id: '6', name: 'Usman Ghani', email: 'usman.g@gmail.com', phone: '+92 303 3456 789', type: 'retail', status: 'active', totalOrders: 15, totalSpent: 22100, outstanding: 3200, lastOrderDate: '2024-06-10', joinedDate: '2024-01-20', address: 'Susan Road', city: 'Faisalabad', notes: 'New customer, building loyalty.', loyaltyPoints: 980 },
  { id: '7', name: 'Ahmed Enterprises', email: 'procurement@ahmedent.com', phone: '+92 51 2345 6789', type: 'corporate', status: 'active', totalOrders: 34, totalSpent: 98000, outstanding: 8000, lastOrderDate: '2024-06-12', joinedDate: '2023-04-18', address: 'Blue Area', city: 'Islamabad', notes: 'Cafe chain, 3 branches.', loyaltyPoints: 5600 },
  { id: '8', name: 'Zainab Bibi', email: 'zainab.b@gmail.com', phone: '+92 304 4567 890', type: 'retail', status: 'active', totalOrders: 42, totalSpent: 67800, outstanding: 0, lastOrderDate: '2024-06-15', joinedDate: '2023-06-25', address: 'Khyber Bazaar', city: 'Peshawar', notes: 'Loyal customer, refers friends.', loyaltyPoints: 4200 },
];

export default function CustomersPage() {
  const canCreate = usePermission(ENTITY_PERMS.customers.create);
  const canUpdate = usePermission(ENTITY_PERMS.customers.update);
  const canDelete = usePermission(ENTITY_PERMS.customers.delete);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = customers.filter((c) => {
    const m = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    const mt = typeFilter === 'all' || c.type === typeFilter;
    const ms = statusFilter === 'all' || c.status === statusFilter;
    return m && mt && ms;
  });

  const activeCount = customers.filter((c) => c.status === 'active').length;
  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalOutstanding = customers.reduce((s, c) => s + c.outstanding, 0);
  const avgOrderValue = Math.round(totalSpent / customers.reduce((s, c) => s + c.totalOrders, 0));

  const selectedCustomer = customers.find((c) => c.id === showDetail);
  const editingCustomer = customers.find((c) => c.id === editingId);

  if (formMode === 'add') {
    return <CustomerForm mode="add" onClose={() => setFormMode(null)} onSubmit={(data) => { console.log('Add customer', data); setFormMode(null); }} />;
  }

  if (formMode === 'edit' && editingCustomer) {
    return <CustomerForm mode="edit" initialData={{
      name: editingCustomer.name,
      email: editingCustomer.email,
      phone: editingCustomer.phone,
      type: editingCustomer.type,
      status: editingCustomer.status,
      address: editingCustomer.address,
      city: editingCustomer.city,
      notes: editingCustomer.notes,
    }} onClose={() => { setFormMode(null); setEditingId(null); }} onSubmit={(data) => { console.log('Edit customer', data); setFormMode(null); setEditingId(null); }} />;
  }

  if (selectedCustomer) {
    return <CustomerDetail customer={selectedCustomer} onClose={() => setShowDetail(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage customer database, track spending, and view contact details.</p>
        </div>
        {canCreate && (
          <button onClick={() => setFormMode('add')} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Add Customer
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Users className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-500">Total Customers</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{customers.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><UserCheck className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-500">Active</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">{activeCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CreditCard className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-500">Total Revenue</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">PKR {totalSpent.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Clock className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-500">Outstanding</div>
          <div className="mt-1 text-2xl font-bold text-amber-700">PKR {totalOutstanding.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><ShoppingBag className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-500">Avg Order Value</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">PKR {avgOrderValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
          <option value="all">All Types</option>
          <option value="retail">Retail</option>
          <option value="wholesale">Wholesale</option>
          <option value="corporate">Corporate</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Orders</th>
              <th className="px-5 py-4">Total Spent</th>
              <th className="px-5 py-4">Outstanding</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Last Order</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filtered.map((c) => (
              <tr key={c.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">{c.name.charAt(0)}</div>
                    <div>
                      <div className="font-semibold text-slate-800">{c.name}</div>
                      <div className="text-xs text-slate-400">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    c.type === 'retail' ? 'bg-emerald-100 text-emerald-700' :
                    c.type === 'wholesale' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>{c.type.charAt(0).toUpperCase() + c.type.slice(1)}</span>
                </td>
                <td className="px-5 py-4 font-bold text-slate-800">{c.totalOrders}</td>
                <td className="px-5 py-4 font-bold text-slate-800">PKR {c.totalSpent.toLocaleString()}</td>
                <td className="px-5 py-4">
                  <span className={`font-bold ${c.outstanding > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                    {c.outstanding > 0 ? `PKR ${c.outstanding.toLocaleString()}` : '—'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>{c.status === 'active' ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-5 py-4 text-xs text-slate-500">{c.lastOrderDate}</td>
                <td className="px-5 py-4 text-right">
                  <div className="relative inline-block">
                    <button onClick={() => setDropdownOpen(dropdownOpen === c.id ? null : c.id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"><MoreHorizontal className="h-4 w-4" /></button>
                    {dropdownOpen === c.id && (
                      <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                        <button onClick={() => { setShowDetail(c.id); setDropdownOpen(null); }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"><Eye className="h-4 w-4" /> View Details</button>
                        {canUpdate && (
                          <button onClick={() => { setFormMode('edit'); setEditingId(c.id); setDropdownOpen(null); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"><Pencil className="h-4 w-4" /> Edit</button>
                        )}
                        {canDelete && (
                          <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"><Trash2 className="h-4 w-4" /> Delete</button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-slate-400">No customers found.</div>}
      </div>
    </div>
  );
}

function CustomerDetail({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const typeColors = {
    retail: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'bg-emerald-50 text-emerald-700' },
    wholesale: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'bg-blue-50 text-blue-700' },
    corporate: { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'bg-purple-50 text-purple-700' },
  };
  const tc = typeColors[customer.type];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
      <button onClick={onClose} className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold ${tc.icon}`}>{customer.name.charAt(0)}</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
            <p className="text-sm text-slate-500">{customer.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tc.bg} ${tc.text}`}>{customer.type.toUpperCase()}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${customer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {customer.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Pencil className="h-4 w-4" /> Edit</button>
        </div>
      </div>

      {/* Contact & Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><Phone className="h-4 w-4 text-slate-500" /></div><div><div className="text-xs text-slate-400">Phone</div><div className="text-sm font-medium text-slate-800">{customer.phone}</div></div></div>
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><Mail className="h-4 w-4 text-slate-500" /></div><div><div className="text-xs text-slate-400">Email</div><div className="text-sm font-medium text-slate-800">{customer.email}</div></div></div>
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><MapPin className="h-4 w-4 text-slate-500" /></div><div><div className="text-xs text-slate-400">Address</div><div className="text-sm font-medium text-slate-800">{customer.address}, {customer.city}</div></div></div>
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><Calendar className="h-4 w-4 text-slate-500" /></div><div><div className="text-xs text-slate-400">Customer Since</div><div className="text-sm font-medium text-slate-800">{customer.joinedDate}</div></div></div>
            </div>
          </div>

          {customer.notes && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Notes</h3>
              <p className="text-sm text-slate-700">{customer.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Purchase History</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4 text-center"><div className="text-xs text-slate-500">Total Orders</div><div className="text-2xl font-bold text-slate-900">{customer.totalOrders}</div></div>
              <div className="rounded-xl bg-slate-50 p-4 text-center"><div className="text-xs text-slate-500">Total Spent</div><div className="text-2xl font-bold text-emerald-600">PKR {customer.totalSpent.toLocaleString()}</div></div>
              <div className="rounded-xl bg-slate-50 p-4 text-center"><div className="text-xs text-slate-500">Outstanding</div><div className={`text-2xl font-bold ${customer.outstanding > 0 ? 'text-amber-600' : 'text-slate-500'}`}>{customer.outstanding > 0 ? `PKR ${customer.outstanding.toLocaleString()}` : '—'}</div></div>
              <div className="rounded-xl bg-slate-50 p-4 text-center"><div className="text-xs text-slate-500">Loyalty Points</div><div className="text-2xl font-bold text-blue-600">{customer.loyaltyPoints.toLocaleString()}</div></div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"><ShoppingBag className="h-4 w-4" /></div>
                <div className="flex-1"><div className="text-sm font-medium text-slate-800">Order #{Math.floor(Math.random()*9000)+1000}</div><div className="text-xs text-slate-400">PKR {Math.round(customer.totalSpent/customer.totalOrders).toLocaleString()}</div></div>
                <div className="text-xs text-slate-400">{customer.lastOrderDate}</div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><CreditCard className="h-4 w-4" /></div>
                <div className="flex-1"><div className="text-sm font-medium text-slate-800">Payment Received</div><div className="text-xs text-slate-400">Full settlement</div></div>
                <div className="text-xs text-slate-400">{customer.lastOrderDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
