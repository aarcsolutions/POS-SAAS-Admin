'use client';

import { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Check,
  Store,
  Package,
  Users,
  DollarSign,
} from 'lucide-react';
import BranchForm from '@/components/branches/BranchForm';
import BranchDetail from '@/components/branches/BranchDetail';
import RowActionsMenu from '@/components/ui/RowActionsMenu';

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

const initialBranches: Branch[] = [
  {
    id: '1',
    name: 'Main Branch - Karachi',
    location: 'Karachi, Sindh',
    phone: '+92 21 1234 5678',
    manager: 'Ahmed Khan',
    status: 'active',
    employees: 24,
    products: 450,
    monthlyRevenue: 'PKR 420K',
    address: 'Shop #42, Dolmen Mall, Tariq Road, Karachi',
    email: 'karachi@almadina.com',
    openingHours: '9:00 AM - 11:00 PM',
  },
  {
    id: '2',
    name: 'Lahore Branch',
    location: 'Lahore, Punjab',
    phone: '+92 42 8765 4321',
    manager: 'Fatima Ali',
    status: 'active',
    employees: 18,
    products: 380,
    monthlyRevenue: 'PKR 310K',
    address: 'Plot 15-B, Gulberg III, Lahore',
    email: 'lahore@almadina.com',
    openingHours: '10:00 AM - 10:00 PM',
  },
  {
    id: '3',
    name: 'Islamabad Branch',
    location: 'Islamabad, ICT',
    phone: '+92 51 2345 6789',
    manager: 'Hassan Raza',
    status: 'active',
    employees: 12,
    products: 290,
    monthlyRevenue: 'PKR 185K',
    address: 'Sector F-7, Blue Area, Islamabad',
    email: 'islamabad@almadina.com',
    openingHours: '9:00 AM - 10:00 PM',
  },
  {
    id: '4',
    name: 'Peshawar Branch',
    location: 'Peshawar, KPK',
    phone: '+92 91 3456 7890',
    manager: 'Zainab Bibi',
    status: 'inactive',
    employees: 8,
    products: 150,
    monthlyRevenue: 'PKR 95K',
    address: 'Khyber Bazaar, Main Road, Peshawar',
    email: 'peshawar@almadina.com',
    openingHours: '10:00 AM - 9:00 PM',
  },
  {
    id: '5',
    name: 'Faisalabad Branch',
    location: 'Faisalabad, Punjab',
    phone: '+92 41 4567 8901',
    manager: 'Usman Ghani',
    status: 'active',
    employees: 15,
    products: 320,
    monthlyRevenue: 'PKR 240K',
    address: 'Susan Road, Madina Town, Faisalabad',
    email: 'faisalabad@almadina.com',
    openingHours: '9:30 AM - 10:30 PM',
  },
  {
    id: '6',
    name: 'Multan Branch',
    location: 'Multan, Punjab',
    phone: '+92 61 5678 9012',
    manager: 'Ayesha Siddiqui',
    status: 'active',
    employees: 10,
    products: 210,
    monthlyRevenue: 'PKR 160K',
    address: 'Chowk Kumharanwala, Multan',
    email: 'multan@almadina.com',
    openingHours: '10:00 AM - 11:00 PM',
  },
];

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    location: '',
    phone: '',
    manager: '',
    status: 'active',
    address: '',
    email: '',
    openingHours: '',
  });

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = branches.filter((b) => b.status === 'active').length;
  const inactiveCount = branches.filter((b) => b.status === 'inactive').length;
  const totalEmployees = branches.reduce((sum, b) => sum + b.employees, 0);
  const totalProducts = branches.reduce((sum, b) => sum + b.products, 0);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormData({
      name: '',
      location: '',
      phone: '',
      manager: '',
      status: 'active',
      address: '',
      email: '',
      openingHours: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({ ...branch });
    setShowModal(true);
    setDropdownOpen(null);
  };

  const handleOpenDetail = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDetailModal(true);
    setDropdownOpen(null);
  };

  const handleDelete = (id: string) => {
    setBranches(branches.filter((b) => b.id !== id));
    setDropdownOpen(null);
  };

  const handleSubmit = () => {
    if (editingBranch) {
      setBranches(
        branches.map((b) =>
          b.id === editingBranch.id
            ? { ...b, ...(formData as Branch) }
            : b
        )
      );
    } else {
      const newBranch: Branch = {
        ...(formData as Branch),
        id: Math.random().toString(36).substr(2, 9),
        employees: 0,
        products: 0,
        monthlyRevenue: 'PKR 0',
      };
      setBranches([...branches, newBranch]);
    }
    setShowModal(false);
  };

  const handleToggleStatus = (id: string) => {
    setBranches(
      branches.map((b) =>
        b.id === id
          ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' }
          : b
      )
    );
  };

  if (showModal) {
    return (
      <BranchForm
        mode={editingBranch ? 'edit' : 'create'}
        initialData={editingBranch || formData}
        onClose={() => {
          setShowModal(false);
          setEditingBranch(null);
        }}
        onSubmit={(data) => {
          if (editingBranch) {
            setBranches(
              branches.map((b) => (b.id === editingBranch.id ? { ...b, ...data } as Branch : b))
            );
          } else {
            const newBranch: Branch = {
              ...(data as Branch),
              id: Math.random().toString(36).substr(2, 9),
              employees: 0,
              products: 0,
              monthlyRevenue: 'PKR 0',
            };
            setBranches([...branches, newBranch]);
          }
          setShowModal(false);
          setEditingBranch(null);
        }}
      />
    );
  }

  if (showDetailModal && selectedBranch) {
    return (
      <BranchDetail
        branch={selectedBranch}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedBranch(null);
        }}
        onEdit={(branch) => {
          setShowDetailModal(false);
          setSelectedBranch(null);
          handleOpenEdit(branch);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Branch Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage all your business branches, locations, and per-branch data.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add Branch
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Branches</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{branches.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Check className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Active Branches</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{activeCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Users className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Employees</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalEmployees}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Package className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Products</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalProducts}</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search branches by name, location, or manager..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />
      </div>

      {/* Branches Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Branch Name</th>
              <th className="px-5 py-4">Location</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Manager</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Data</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredBranches.map((branch) => (
              <tr key={branch.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{branch.name}</div>
                      <div className="text-xs text-slate-400">{branch.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">{branch.location}</td>
                <td className="px-5 py-4 text-slate-600">{branch.phone}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                      {branch.manager.charAt(0)}
                    </div>
                    <span className="text-slate-700">{branch.manager}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => handleToggleStatus(branch.id)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      branch.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {branch.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {branch.employees}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="h-3.5 w-3.5" />
                      {branch.products}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {branch.monthlyRevenue}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <RowActionsMenu
                    open={dropdownOpen === branch.id}
                    onOpenChange={(open) =>
                      setDropdownOpen(open ? branch.id : null)
                    }
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(null);
                        handleOpenDetail(branch);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(null);
                        handleOpenEdit(branch);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Branch
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(null);
                        handleDelete(branch.id);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Branch
                    </button>
                  </RowActionsMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBranches.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            No branches found matching your search.
          </div>
        )}
      </div>

    </div>
  );
}
