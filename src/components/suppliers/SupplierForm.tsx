'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Loader2, Truck, Mail, Phone, MapPin, FileText, User, Star } from 'lucide-react';
import { Select } from '@/components/ui/Select';

interface SupplierFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  type: 'manufacturer' | 'distributor' | 'local';
  status: 'active' | 'inactive';
  address: string;
  city: string;
  paymentTerms: string;
  notes: string;
}

interface Props {
  mode: 'add' | 'edit';
  initialData?: SupplierFormData;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => void;
}

const emptyData: SupplierFormData = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  type: 'distributor',
  status: 'active',
  address: '',
  city: '',
  paymentTerms: 'Net 30 days',
  notes: '',
};

export default function SupplierForm({ mode, initialData, onClose, onSubmit }: Props) {
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SupplierFormData>(initialData || emptyData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof SupplierFormData>(key: K, value: SupplierFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.name.trim()) e.name = 'Supplier name is required';
    if (!data.contactPerson.trim()) e.contactPerson = 'Contact person is required';
    if (!data.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Invalid email format';
    if (!data.phone.trim()) e.phone = 'Phone is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    onSubmit(data);
    setSaving(false);
  };

  const title = mode === 'add' ? 'Add Supplier' : 'Edit Supplier';
  const subtitle = mode === 'add' ? 'Create a new supplier record.' : 'Update supplier information.';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button onClick={onClose} className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> Back to Suppliers
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Truck className="h-4 w-4" /> Basic Information
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Supplier Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text" value={data.name} onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Al-Rashid Traders"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Contact Person <span className="text-rose-500">*</span>
              </label>
              <input
                type="text" value={data.contactPerson} onChange={(e) => update('contactPerson', e.target.value)}
                placeholder="e.g. Rashid Ahmed"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
              {errors.contactPerson && <p className="mt-1 text-xs text-rose-500">{errors.contactPerson}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email" value={data.email} onChange={(e) => update('email', e.target.value)}
                placeholder="e.g. sales@company.com"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel" value={data.phone} onChange={(e) => update('phone', e.target.value)}
                placeholder="e.g. +92 21 3456 7890"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
              {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Supplier Type
              </label>
              <Select
                value={data.type}
                onChange={(value) =>
                  update('type', value as SupplierFormData['type'])
                }
                variant="form"
                size="lg"
                allowEmpty={false}
                options={[
                  { value: 'manufacturer', label: 'Manufacturer' },
                  { value: 'distributor', label: 'Distributor' },
                  { value: 'local', label: 'Local' },
                ]}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio" checked={data.status === 'active'} onChange={() => update('status', 'active')}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="text-sm font-medium text-slate-700">Active</span>
                </label>
                <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio" checked={data.status === 'inactive'} onChange={() => update('status', 'inactive')}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="text-sm font-medium text-slate-700">Inactive</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="h-4 w-4" /> Address Details
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Street Address
              </label>
              <input
                type="text" value={data.address} onChange={(e) => update('address', e.target.value)}
                placeholder="Enter street address"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                City
              </label>
              <input
                type="text" value={data.city} onChange={(e) => update('city', e.target.value)}
                placeholder="Enter city"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <FileText className="h-4 w-4" /> Business Terms
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Payment Terms
            </label>
            <Select
              value={data.paymentTerms}
              onChange={(value) => update('paymentTerms', value)}
              variant="form"
              size="lg"
              allowEmpty={false}
              options={[
                { value: 'Cash on Delivery', label: 'Cash on Delivery' },
                { value: 'Net 15 days', label: 'Net 15 days' },
                { value: 'Net 30 days', label: 'Net 30 days' },
                { value: 'Net 45 days', label: 'Net 45 days' },
                { value: 'Net 60 days', label: 'Net 60 days' },
                { value: 'Weekly settlement', label: 'Weekly settlement' },
                { value: 'Monthly settlement', label: 'Monthly settlement' },
              ]}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <FileText className="h-4 w-4" /> Additional Notes
          </div>
          <textarea
            value={data.notes} onChange={(e) => update('notes', e.target.value)}
            rows={4}
            placeholder="Add any notes about this supplier..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <button type="button" onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving...' : mode === 'add' ? 'Create Supplier' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
