'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Shield,
  UserCheck,
  UserCog,
  Store,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Check,
  Clock,
} from 'lucide-react';
import UserForm from '@/components/users/UserForm';
import UserDetail from '@/components/users/UserDetail';

type UserRole = 'admin' | 'manager' | 'cashier';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  branch: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  lastActive: string;
  address: string;
}

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Ahmed Khan',
    email: 'ahmed.khan@almadina.com',
    phone: '+92 300 1234 567',
    role: 'admin',
    branch: 'Main Branch - Karachi',
    status: 'active',
    joinedDate: '2024-01-15',
    lastActive: '2 hours ago',
    address: 'Block 5, Clifton, Karachi',
  },
  {
    id: '2',
    name: 'Fatima Ali',
    email: 'fatima.ali@almadina.com',
    phone: '+92 301 8765 432',
    role: 'manager',
    branch: 'Lahore Branch',
    status: 'active',
    joinedDate: '2024-03-10',
    lastActive: '5 mins ago',
    address: 'Model Town, Lahore',
  },
  {
    id: '3',
    name: 'Hassan Raza',
    email: 'hassan.raza@almadina.com',
    phone: '+92 302 2345 678',
    role: 'manager',
    branch: 'Islamabad Branch',
    status: 'active',
    joinedDate: '2024-02-20',
    lastActive: '1 hour ago',
    address: 'F-8, Islamabad',
  },
  {
    id: '4',
    name: 'Zainab Bibi',
    email: 'zainab.bibi@almadina.com',
    phone: '+92 303 3456 789',
    role: 'cashier',
    branch: 'Peshawar Branch',
    status: 'inactive',
    joinedDate: '2024-04-05',
    lastActive: '3 days ago',
    address: 'Khyber Bazaar, Peshawar',
  },
  {
    id: '5',
    name: 'Usman Ghani',
    email: 'usman.ghani@almadina.com',
    phone: '+92 304 4567 890',
    role: 'cashier',
    branch: 'Faisalabad Branch',
    status: 'active',
    joinedDate: '2024-05-12',
    lastActive: '30 mins ago',
    address: 'Susan Road, Faisalabad',
  },
  {
    id: '6',
    name: 'Ayesha Siddiqui',
    email: 'ayesha.siddiqui@almadina.com',
    phone: '+92 305 5678 901',
    role: 'cashier',
    branch: 'Multan Branch',
    status: 'active',
    joinedDate: '2024-06-01',
    lastActive: '15 mins ago',
    address: 'Chowk Kumharanwala, Multan',
  },
  {
    id: '7',
    name: 'Bilal Ahmed',
    email: 'bilal.ahmed@almadina.com',
    phone: '+92 306 6789 012',
    role: 'cashier',
    branch: 'Main Branch - Karachi',
    status: 'active',
    joinedDate: '2024-06-15',
    lastActive: 'Just now',
    address: 'Gulshan-e-Iqbal, Karachi',
  },
  {
    id: '8',
    name: 'Sana Malik',
    email: 'sana.malik@almadina.com',
    phone: '+92 307 7890 123',
    role: 'manager',
    branch: 'Faisalabad Branch',
    status: 'active',
    joinedDate: '2024-01-20',
    lastActive: '4 hours ago',
    address: 'D-Ground, Faisalabad',
  },
];

const branches = [
  'Main Branch - Karachi',
  'Lahore Branch',
  'Islamabad Branch',
  'Peshawar Branch',
  'Faisalabad Branch',
  'Multan Branch',
];

const roleConfig: Record<UserRole, { label: string; color: string; bg: string; icon: typeof Shield }> = {
  admin: { label: 'Admin', color: 'text-rose-700', bg: 'bg-rose-100', icon: Shield },
  manager: { label: 'Manager', color: 'text-amber-700', bg: 'bg-amber-100', icon: UserCog },
  cashier: { label: 'Cashier', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: UserCheck },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    role: 'cashier',
    branch: branches[0],
    status: 'active',
    address: '',
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const managerCount = users.filter((u) => u.role === 'manager').length;
  const cashierCount = users.filter((u) => u.role === 'cashier').length;
  const activeCount = users.filter((u) => u.status === 'active').length;

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'cashier',
      branch: branches[0],
      status: 'active',
      address: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ ...user });
    setShowModal(true);
    setDropdownOpen(null);
  };

  const handleOpenDetail = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
    setDropdownOpen(null);
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    setDropdownOpen(null);
  };

  const handleSubmit = () => {
    if (editingUser) {
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...u, ...(formData as User) } : u))
      );
    } else {
      const newUser: User = {
        ...(formData as User),
        id: Math.random().toString(36).substr(2, 9),
        joinedDate: new Date().toISOString().split('T')[0],
        lastActive: 'Just now',
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
  };

  const handleToggleStatus = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    );
  };

  if (showModal) {
    return (
      <UserForm
        mode={editingUser ? 'edit' : 'create'}
        initialData={editingUser || formData}
        branches={branches}
        onClose={() => {
          setShowModal(false);
          setEditingUser(null);
        }}
        onSubmit={(data) => {
          if (editingUser) {
            setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...data } as User : u)));
          } else {
            const newUser: User = {
              ...(data as User),
              id: Math.random().toString(36).substr(2, 9),
              joinedDate: new Date().toISOString().split('T')[0],
              lastActive: 'Just now',
            };
            setUsers([...users, newUser]);
          }
          setShowModal(false);
          setEditingUser(null);
        }}
      />
    );
  }

  if (showDetailModal && selectedUser) {
    return (
      <UserDetail
        user={selectedUser}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedUser(null);
        }}
        onEdit={(user) => {
          setShowDetailModal(false);
          setSelectedUser(null);
          handleOpenEdit(user);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage staff, assign roles, and control branch access.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Users className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Users</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalUsers}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
            <Shield className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Admins</div>
          <div className="mt-1 text-2xl font-bold text-rose-700">{adminCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <UserCog className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Managers</div>
          <div className="mt-1 text-2xl font-bold text-amber-700">{managerCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Cashiers</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">{cashierCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Check className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Active</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{activeCount}</div>
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
            placeholder="Search users by name, email, or branch..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="cashier">Cashier</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Branch</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Last Active</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredUsers.map((user) => {
              const role = roleConfig[user.role];
              const RoleIcon = role.icon;
              return (
                <tr key={user.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${role.bg} ${role.color}`}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {role.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Store className="h-3.5 w-3.5 text-slate-400" />
                      {user.branch}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{user.phone}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                        user.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {user.lastActive}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === user.id ? null : user.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {dropdownOpen === user.id && (
                        <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                          <button
                            onClick={() => handleOpenDetail(user)}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit User
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete User
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
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">No users found matching your criteria.</div>
        )}
      </div>

    </div>
  );
}
