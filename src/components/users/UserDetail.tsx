'use client';

import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Check,
  Clock,
  Store,
  Shield,
  UserCog,
  UserCheck,
  Pencil,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'cashier';
  branch: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  lastActive: string;
  address: string;
}

interface UserDetailProps {
  user: User;
  onClose: () => void;
  onEdit: (user: User) => void;
}

const roleConfig = {
  admin: { label: 'Admin', color: 'text-rose-700', bg: 'bg-rose-100', icon: Shield },
  manager: { label: 'Manager', color: 'text-amber-700', bg: 'bg-amber-100', icon: UserCog },
  cashier: { label: 'Cashier', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: UserCheck },
};

export default function UserDetail({ user, onClose, onEdit }: UserDetailProps) {
  const role = roleConfig[user.role];
  const RoleIcon = role.icon;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-xl font-bold text-emerald-700">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{user.name}</h1>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${role.bg} ${role.color}`}
          >
            <RoleIcon className="h-3.5 w-3.5" />
            {role.label}
          </span>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Email</div>
                  <div className="text-sm font-medium text-slate-800">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Phone className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Phone</div>
                  <div className="text-sm font-medium text-slate-800">{user.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <MapPin className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Address</div>
                  <div className="text-sm font-medium text-slate-800">{user.address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Check className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Joined</div>
                  <div className="text-sm font-medium text-slate-800">{user.joinedDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Clock className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Last Active</div>
                  <div className="text-sm font-medium text-slate-800">{user.lastActive}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Role & Branch */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Role & Assignment
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <RoleIcon className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Role</div>
                  <div className="text-sm font-medium text-slate-800">{role.label}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Store className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Assigned Branch</div>
                  <div className="text-sm font-medium text-slate-800">{user.branch}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Account Status
            </h3>
            <span
              className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${
                user.status === 'active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {user.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <button
          onClick={() => onEdit(user)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4" />
          Edit User
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
