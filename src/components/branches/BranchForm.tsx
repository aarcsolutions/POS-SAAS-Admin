'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Select } from '@/components/ui/Select';

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

interface BranchFormProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: Partial<Branch>;
  onClose: () => void;
  onSubmit: (data: Partial<Branch>) => void;
}

export default function BranchForm({ mode, initialData, onClose, onSubmit }: BranchFormProps) {
  const isReadOnly = mode === 'view';
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<Branch>>({
    name: initialData?.name || '',
    location: initialData?.location || '',
    phone: initialData?.phone || '',
    manager: initialData?.manager || '',
    status: initialData?.status || 'active',
    address: initialData?.address || '',
    email: initialData?.email || '',
    openingHours: initialData?.openingHours || '',
  });

  const title = mode === 'create' ? 'Add New Branch' : mode === 'edit' ? 'Edit Branch' : 'View Branch';
  const buttonText = mode === 'create' ? 'Create Branch' : 'Save Changes';

  const updateField = <K extends keyof Branch>(key: K, value: Branch[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.name?.trim()) next.name = 'Name is required';
    if (!formData.location?.trim()) next.location = 'Location is required';
    if (!formData.phone?.trim()) next.phone = 'Phone is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!validate()) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    onSubmit(formData);
    setSaving(false);
  };

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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === 'create'
            ? 'Register a new business branch with location and manager details.'
            : mode === 'edit'
            ? 'Update branch information and operational settings.'
            : 'View complete branch details and performance metrics.'}
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">Branch Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Branch Name */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Branch Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                readOnly={isReadOnly}
                placeholder="e.g. Karachi Main Branch"
                className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all ${
                  errors.name ? 'border-rose-400' : 'border-slate-200'
                } ${isReadOnly ? 'cursor-default opacity-70' : ''}`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Location / City
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                readOnly={isReadOnly}
                placeholder="e.g. Karachi, Sindh"
                className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all ${
                  errors.location ? 'border-rose-400' : 'border-slate-200'
                } ${isReadOnly ? 'cursor-default opacity-70' : ''}`}
              />
              {errors.location && (
                <p className="mt-1 text-xs text-rose-600">{errors.location}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                readOnly={isReadOnly}
                placeholder="+92 3XX XXXXXXX"
                className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all ${
                  errors.phone ? 'border-rose-400' : 'border-slate-200'
                } ${isReadOnly ? 'cursor-default opacity-70' : ''}`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
              )}
            </div>

            {/* Manager */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Manager Name
              </label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                readOnly={isReadOnly}
                placeholder="Manager full name"
                className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all ${
                  isReadOnly ? 'cursor-default opacity-70' : ''
                }`}
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Branch Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                readOnly={isReadOnly}
                placeholder="branch@company.com"
                className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all ${
                  isReadOnly ? 'cursor-default opacity-70' : ''
                }`}
              />
            </div>

            {/* Opening Hours */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Opening Hours
              </label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                readOnly={isReadOnly}
                placeholder="e.g. 9:00 AM - 10:00 PM"
                className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all ${
                  isReadOnly ? 'cursor-default opacity-70' : ''
                }`}
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </label>
              <Select
                value={formData.status}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as 'active' | 'inactive',
                  })
                }
                disabled={isReadOnly}
                variant="form"
                allowEmpty={false}
                size="lg"
                triggerClassName={isReadOnly ? 'cursor-default opacity-70' : ''}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </div>

            {/* Address - full width */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Full Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                readOnly={isReadOnly}
                rows={3}
                placeholder="Complete branch address..."
                className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all resize-none ${
                  isReadOnly ? 'cursor-default opacity-70' : ''
                }`}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : buttonText}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
