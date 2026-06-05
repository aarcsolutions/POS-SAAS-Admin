'use client';

import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Store,
  Package,
  Users,
  DollarSign,
  Pencil,
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  location: string;
  phone: string;
  manager: string;
  status: 'active' | 'inactive';
  employees: number;
  products: number;
  monthlyRevenue: string;
  address: string;
  email: string;
  openingHours: string;
}

interface BranchDetailProps {
  branch: Branch;
  onClose: () => void;
  onEdit: (branch: Branch) => void;
}

export default function BranchDetail({ branch, onClose, onEdit }: BranchDetailProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Branches
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{branch.name}</h1>
              <p className="text-sm text-slate-500">{branch.location}</p>
            </div>
          </div>
          <span
            className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${
              branch.status === 'active'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {branch.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <Users className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
          <div className="text-2xl font-bold text-slate-900">{branch.employees}</div>
          <div className="text-xs font-medium text-slate-500">Employees</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <Package className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
          <div className="text-2xl font-bold text-slate-900">{branch.products}</div>
          <div className="text-xs font-medium text-slate-500">Products</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <DollarSign className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
          <div className="text-2xl font-bold text-slate-900">{branch.monthlyRevenue}</div>
          <div className="text-xs font-medium text-slate-500">Monthly Revenue</div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Address & Location
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <MapPin className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Full Address</div>
                  <div className="text-sm font-medium text-slate-800">{branch.address}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <MapPin className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">City / Region</div>
                  <div className="text-sm font-medium text-slate-800">{branch.location}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Phone className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Phone</div>
                  <div className="text-sm font-medium text-slate-800">{branch.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Email</div>
                  <div className="text-sm font-medium text-slate-800">{branch.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Management
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                  {branch.manager.charAt(0)}
                </div>
                <div>
                  <div className="text-xs text-slate-400">Branch Manager</div>
                  <div className="text-sm font-medium text-slate-800">{branch.manager}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Store className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Opening Hours</div>
                  <div className="text-sm font-medium text-slate-800">{branch.openingHours}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Account Status
            </h3>
            <span
              className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${
                branch.status === 'active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {branch.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <button
          onClick={() => onEdit(branch)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4" />
          Edit Branch
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
