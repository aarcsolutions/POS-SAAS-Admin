'use client';

import { useState } from 'react';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  Truck, Search, Plus, Phone, Mail, MapPin, Calendar, Package,
  ArrowLeft, Pencil, Trash2, Eye, MoreHorizontal,
  TrendingUp, Check, Clock, DollarSign, Boxes, Star,
} from 'lucide-react';
import SupplierForm from '@/components/suppliers/SupplierForm';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  type: 'manufacturer' | 'distributor' | 'local';
  status: 'active' | 'inactive';
  productsSupplied: number;
  totalPurchases: number;
  outstanding: number;
  rating: number;
  lastDelivery: string;
  joinedDate: string;
  address: string;
  city: string;
  paymentTerms: string;
  notes: string;
}

const suppliers: Supplier[] = [
  { id: '1', name: 'Al-Rashid Traders', contactPerson: 'Rashid Ahmed', email: 'sales@alrashid.pk', phone: '+92 21 3456 7890', type: 'distributor', status: 'active', productsSupplied: 12, totalPurchases: 850000, outstanding: 45000, rating: 4.8, lastDelivery: '2024-06-15', joinedDate: '2022-03-10', address: 'Liaquatabad Market', city: 'Karachi', paymentTerms: 'Net 30 days', notes: 'Reliable dairy and coffee supplier. Fast delivery.' },
  { id: '2', name: 'Faisalabad Mills Co.', contactPerson: 'Imran Malik', email: 'orders@fbdmills.com', phone: '+92 41 2345 6789', type: 'manufacturer', status: 'active', productsSupplied: 5, totalPurchases: 320000, outstanding: 0, rating: 4.5, lastDelivery: '2024-06-14', joinedDate: '2022-08-22', address: 'Industrial Estate', city: 'Faisalabad', paymentTerms: 'Net 15 days', notes: 'Bulk flour and grain supplier.' },
  { id: '3', name: 'Sweet Imports Co.', contactPerson: 'Saima Khan', email: 'hello@sweetimports.pk', phone: '+92 51 8765 4321', type: 'distributor', status: 'active', productsSupplied: 8, totalPurchases: 180000, outstanding: 22000, rating: 4.2, lastDelivery: '2024-06-10', joinedDate: '2023-01-15', address: 'F-7 Markaz', city: 'Islamabad', paymentTerms: 'Net 45 days', notes: 'Chocolate and dessert ingredients. Premium pricing.' },
  { id: '4', name: 'Karachi Packaging Pvt. Ltd.', contactPerson: 'Omar Farooq', email: 'orders@karachipkg.com', phone: '+92 21 8765 4321', type: 'manufacturer', status: 'active', productsSupplied: 6, totalPurchases: 95000, outstanding: 0, rating: 4.6, lastDelivery: '2024-06-13', joinedDate: '2023-05-05', address: 'Korangi Industrial Area', city: 'Karachi', paymentTerms: 'Cash on Delivery', notes: 'Packaging materials, bulk orders only.' },
  { id: '5', name: 'Lahore Beverages', contactPerson: 'Amir Sohail', email: 'export@lhrbeverages.pk', phone: '+92 42 3456 7890', type: 'manufacturer', status: 'inactive', productsSupplied: 4, totalPurchases: 145000, outstanding: 60000, rating: 3.8, lastDelivery: '2024-04-01', joinedDate: '2022-11-20', address: 'Raiwind Road', city: 'Lahore', paymentTerms: 'Net 30 days', notes: 'Currently switching to new product line. On hold.' },
  { id: '6', name: 'Fresh Farms Peshawar', contactPerson: 'Tariq Afridi', email: 'fresh@farmspesh.pk', phone: '+92 91 2345 6789', type: 'local', status: 'active', productsSupplied: 3, totalPurchases: 78000, outstanding: 0, rating: 4.9, lastDelivery: '2024-06-15', joinedDate: '2024-01-10', address: 'Jamrud Road', city: 'Peshawar', paymentTerms: 'Weekly settlement', notes: 'Fresh produce, daily delivery. Excellent quality.' },
  { id: '7', name: 'Global Spices Inc.', contactPerson: 'Nadia Hussain', email: 'asia@globalspecies.com', phone: '+92 21 5678 9012', type: 'distributor', status: 'active', productsSupplied: 15, totalPurchases: 210000, outstanding: 15000, rating: 4.3, lastDelivery: '2024-06-12', joinedDate: '2023-07-18', address: 'Port Grand Complex', city: 'Karachi', paymentTerms: 'Net 30 days', notes: 'Imported spices and seasonings.' },
  { id: '8', name: 'Quetta Meat Suppliers', contactPerson: 'Javed Baloch', email: 'orders@qmeatsuppliers.com', phone: '+92 81 3456 7890', type: 'local', status: 'active', productsSupplied: 2, totalPurchases: 134000, outstanding: 0, rating: 4.7, lastDelivery: '2024-06-14', joinedDate: '2023-03-22', address: 'Sariab Road', city: 'Quetta', paymentTerms: 'Cash on Delivery', notes: 'Premium meat cuts, cold chain delivery.' },
];

export default function SuppliersPage() {
  const canCreate = usePermission(ENTITY_PERMS.suppliers.create);
  const canUpdate = usePermission(ENTITY_PERMS.suppliers.update);
  const canDelete = usePermission(ENTITY_PERMS.suppliers.delete);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = suppliers.filter((s) => {
    const m = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase()) || s.phone.includes(searchQuery);
    const mt = typeFilter === 'all' || s.type === typeFilter;
    const ms = statusFilter === 'all' || s.status === statusFilter;
    return m && mt && ms;
  });

  const activeCount = suppliers.filter((s) => s.status === 'active').length;
  const totalPurchases = suppliers.reduce((s, c) => s + c.totalPurchases, 0);
  const totalOutstanding = suppliers.reduce((s, c) => s + c.outstanding, 0);
  const avgRating = (suppliers.reduce((s, c) => s + c.rating, 0) / suppliers.length).toFixed(1);

  const selected = suppliers.find((s) => s.id === showDetail);
  const editingSupplier = suppliers.find((s) => s.id === editingId);

  if (formMode === 'add') {
    return <SupplierForm mode="add" onClose={() => setFormMode(null)} onSubmit={(data) => { console.log('Add supplier', data); setFormMode(null); }} />;
  }

  if (formMode === 'edit' && editingSupplier) {
    return <SupplierForm mode="edit" initialData={{
      name: editingSupplier.name,
      contactPerson: editingSupplier.contactPerson,
      email: editingSupplier.email,
      phone: editingSupplier.phone,
      type: editingSupplier.type,
      status: editingSupplier.status,
      address: editingSupplier.address,
      city: editingSupplier.city,
      paymentTerms: editingSupplier.paymentTerms,
      notes: editingSupplier.notes,
    }} onClose={() => { setFormMode(null); setEditingId(null); }} onSubmit={(data) => { console.log('Edit supplier', data); setFormMode(null); setEditingId(null); }} />;
  }

  if (selected) {
    return <SupplierDetail supplier={selected} onClose={() => setShowDetail(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Suppliers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage supplier database, track purchases, and view contact details.</p>
        </div>
        {canCreate && (
          <button onClick={() => setFormMode('add')} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Add Supplier
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Truck className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-500">Total Suppliers</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{suppliers.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Check className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-500">Active</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">{activeCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><DollarSign className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-500">Total Purchases</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">PKR {totalPurchases.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Clock className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-500">Outstanding</div>
          <div className="mt-1 text-2xl font-bold text-amber-700">PKR {totalOutstanding.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700"><Star className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-500">Avg Rating</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{avgRating}</div>
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
          <option value="manufacturer">Manufacturer</option>
          <option value="distributor">Distributor</option>
          <option value="local">Local</option>
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
              <th className="px-5 py-4">Supplier</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Products</th>
              <th className="px-5 py-4">Total Purchases</th>
              <th className="px-5 py-4">Outstanding</th>
              <th className="px-5 py-4">Rating</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filtered.map((s) => (
              <tr key={s.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">{s.name.charAt(0)}</div>
                    <div>
                      <div className="font-semibold text-slate-800">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.contactPerson}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    s.type === 'manufacturer' ? 'bg-purple-100 text-purple-700' :
                    s.type === 'distributor' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>{s.type.charAt(0).toUpperCase() + s.type.slice(1)}</span>
                </td>
                <td className="px-5 py-4 font-bold text-slate-800">{s.productsSupplied}</td>
                <td className="px-5 py-4 font-bold text-slate-800">PKR {s.totalPurchases.toLocaleString()}</td>
                <td className="px-5 py-4">
                  <span className={`font-bold ${s.outstanding > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                    {s.outstanding > 0 ? `PKR ${s.outstanding.toLocaleString()}` : '—'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700">
                    <Star className="h-3 w-3" /> {s.rating}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>{s.status === 'active' ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="relative inline-block">
                    <button onClick={() => setDropdownOpen(dropdownOpen === s.id ? null : s.id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"><MoreHorizontal className="h-4 w-4" /></button>
                    {dropdownOpen === s.id && (
                      <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                        <button onClick={() => { setShowDetail(s.id); setDropdownOpen(null); }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"><Eye className="h-4 w-4" /> View Details</button>
                        {canUpdate && (
                          <button onClick={() => { setFormMode('edit'); setEditingId(s.id); setDropdownOpen(null); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"><Pencil className="h-4 w-4" /> Edit</button>
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
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-slate-400">No suppliers found.</div>}
      </div>
    </div>
  );
}

function SupplierDetail({ supplier, onClose }: { supplier: Supplier; onClose: () => void }) {
  const tc: Record<string, { bg: string; text: string; icon: string }> = {
    manufacturer: { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'bg-purple-50 text-purple-700' },
    distributor: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'bg-blue-50 text-blue-700' },
    local: { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'bg-amber-50 text-amber-700' },
  };
  const style = tc[supplier.type];

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(supplier.rating));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
      <button onClick={onClose} className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to Suppliers
      </button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold ${style.icon}`}>{supplier.name.charAt(0)}</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{supplier.name}</h1>
            <p className="text-sm text-slate-500">{supplier.contactPerson}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${style.bg} ${style.text}`}>{supplier.type.toUpperCase()}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${supplier.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {supplier.status === 'active' ? 'Active' : 'Inactive'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> {supplier.rating}
              </span>
            </div>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Pencil className="h-4 w-4" /> Edit</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><Phone className="h-4 w-4 text-slate-500" /></div><div><div className="text-xs text-slate-400">Phone</div><div className="text-sm font-medium text-slate-800">{supplier.phone}</div></div></div>
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><Mail className="h-4 w-4 text-slate-500" /></div><div><div className="text-xs text-slate-400">Email</div><div className="text-sm font-medium text-slate-800">{supplier.email}</div></div></div>
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><MapPin className="h-4 w-4 text-slate-500" /></div><div><div className="text-xs text-slate-400">Address</div><div className="text-sm font-medium text-slate-800">{supplier.address}, {supplier.city}</div></div></div>
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><Calendar className="h-4 w-4 text-slate-500" /></div><div><div className="text-xs text-slate-400">Supplier Since</div><div className="text-sm font-medium text-slate-800">{supplier.joinedDate}</div></div></div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Terms & Notes</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-sm text-slate-600">Payment Terms</span>
                <span className="text-sm font-bold text-slate-800">{supplier.paymentTerms}</span>
              </div>
              {supplier.notes && (
                <p className="text-sm text-slate-700">{supplier.notes}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Purchase Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4 text-center"><div className="text-xs text-slate-500">Products Supplied</div><div className="text-2xl font-bold text-slate-900">{supplier.productsSupplied}</div></div>
              <div className="rounded-xl bg-slate-50 p-4 text-center"><div className="text-xs text-slate-500">Total Purchases</div><div className="text-2xl font-bold text-emerald-600">PKR {supplier.totalPurchases.toLocaleString()}</div></div>
              <div className="rounded-xl bg-slate-50 p-4 text-center"><div className="text-xs text-slate-500">Outstanding</div><div className={`text-2xl font-bold ${supplier.outstanding > 0 ? 'text-amber-600' : 'text-slate-500'}`}>{supplier.outstanding > 0 ? `PKR ${supplier.outstanding.toLocaleString()}` : '—'}</div></div>
              <div className="rounded-xl bg-slate-50 p-4 text-center"><div className="text-xs text-slate-500">Last Delivery</div><div className="text-lg font-bold text-slate-800">{supplier.lastDelivery}</div></div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Rating</h3>
            <div className="flex items-center gap-3">
              <div className="text-4xl font-bold text-slate-900">{supplier.rating}</div>
              <div className="flex gap-0.5">
                {stars.map((fill, i) => (
                  <Star key={i} className={`h-6 w-6 ${fill ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                ))}
              </div>
              <div className="text-xs text-slate-400">out of 5</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Recent Deliveries</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"><Boxes className="h-4 w-4" /></div>
                <div className="flex-1"><div className="text-sm font-medium text-slate-800">Delivery #{Math.floor(Math.random()*9000)+1000}</div><div className="text-xs text-slate-400">{supplier.productsSupplied} items received</div></div>
                <div className="text-xs text-slate-400">{supplier.lastDelivery}</div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><DollarSign className="h-4 w-4" /></div>
                <div className="flex-1"><div className="text-sm font-medium text-slate-800">Payment Processed</div><div className="text-xs text-slate-400">{supplier.paymentTerms}</div></div>
                <div className="text-xs text-slate-400">{supplier.lastDelivery}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
