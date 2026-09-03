'use client';

import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Store,
  Pencil,
  Shield,
  Mail,
} from 'lucide-react';
import type { Branch } from '@/types/branch.types';

interface BranchDetailProps {
  branch: Branch;
  onClose: () => void;
  onEdit: (branch: Branch) => void;
}

export default function BranchDetail({ branch, onClose, onEdit }: BranchDetailProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Branches
        </button>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {branch.name}
              </h1>
              <p className="text-sm text-slate-500">Code: {branch.code}</p>
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

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Location & contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <MapPin className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Address</div>
                  <div className="text-sm font-medium text-slate-800">{branch.address}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Phone className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Phone</div>
                  <div className="text-sm font-medium text-slate-800">{branch.phone}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Enabled modules
            </h3>
            <div className="flex flex-wrap gap-2">
              {branch.enabledModuleTitles.length === 0 ? (
                <span className="text-sm text-slate-400">No modules enabled</span>
              ) : (
                branch.enabledModuleTitles.map((title) => (
                  <span
                    key={title}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                  >
                    {title}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Branch Admin
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                  {branch.adminName.charAt(0) || '?'}
                </div>
                <div>
                  <div className="text-xs text-slate-400">Name</div>
                  <div className="text-sm font-medium text-slate-800">{branch.adminName}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Email</div>
                  <div className="text-sm font-medium text-slate-800">{branch.adminEmail}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Shield className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Role</div>
                  <div className="text-sm font-medium text-slate-800">{branch.roleTitle}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Permissions assigned</div>
                  <div className="text-sm font-medium text-slate-800">
                    {branch.permissionIds.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={() => onEdit(branch)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4" />
          Edit Branch
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
