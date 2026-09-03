'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  User,
  MapPin,
  FileText,
  Heart,
} from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { CustomerPayload } from '@/types/customer.types';
import { useGendersQuery } from '@/hooks/dropdowns';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  gender_id: string;
  date_of_birth: string;
  marketing_subscribed: boolean;
  is_active: boolean;
}

interface Props {
  mode: 'create' | 'edit' | 'view';
  initialData?: CustomerFormData;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerPayload) => Promise<void> | void;
}

const emptyData: CustomerFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  notes: '',
  gender_id: '',
  date_of_birth: '',
  marketing_subscribed: false,
  is_active: true,
};

export default function CustomerForm({
  mode,
  initialData,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const [data, setData] = useState<CustomerFormData>(initialData || emptyData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const readOnly = mode === 'view';
  const { data: gendersRes } = useGendersQuery();

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setErrors({});
    }
  }, [initialData]);

  const genderOptions = useMemo(() => {
    const rows = gendersRes?.data?.gendersDropdown || [];
    return rows.map((g) => ({ value: g.value, label: g.label }));
  }, [gendersRes]);

  const update = <K extends keyof CustomerFormData>(
    key: K,
    value: CustomerFormData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.name.trim()) e.name = 'Name is required';
    if (!data.phone.trim()) e.phone = 'Phone is required';
    if (
      data.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
    ) {
      e.email = 'Invalid email format';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (!validate()) return;

    const payload: CustomerPayload = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim() || null,
      address: data.address.trim() || null,
      city: data.city.trim() || null,
      notes: data.notes.trim() || null,
      gender_id: data.gender_id || null,
      date_of_birth: data.date_of_birth || null,
      marketing_subscribed: data.marketing_subscribed,
      is_active: data.is_active,
    };

    await onSubmit(payload);
  };

  const title =
    mode === 'create'
      ? 'Add Customer'
      : mode === 'edit'
        ? 'Edit Customer'
        : 'Customer Details';
  const subtitle =
    mode === 'create'
      ? 'Create a new customer record.'
      : mode === 'edit'
        ? 'Update customer information.'
        : 'View customer information.';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <User className="h-4 w-4" /> Basic Information
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => update('name', e.target.value)}
                disabled={readOnly}
                placeholder="e.g. Ali Hassan"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-70"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => update('phone', e.target.value)}
                disabled={readOnly}
                placeholder="e.g. 03001234567"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-70"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Email
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => update('email', e.target.value)}
                disabled={readOnly}
                placeholder="e.g. ali@example.com (optional)"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-70"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50">
                  <input
                    type="radio"
                    checked={data.is_active}
                    onChange={() => update('is_active', true)}
                    disabled={readOnly}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Active
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50">
                  <input
                    type="radio"
                    checked={!data.is_active}
                    onChange={() => update('is_active', false)}
                    disabled={readOnly}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Inactive
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Heart className="h-4 w-4" /> CRM Details
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Gender
              </label>
              <Select
                value={data.gender_id}
                onChange={(value) => update('gender_id', value)}
                disabled={readOnly}
                allowEmpty
                placeholder="Select gender"
                options={genderOptions}
                variant="form"
                size="lg"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Date of Birth
              </label>
              <input
                type="date"
                value={data.date_of_birth}
                onChange={(e) => update('date_of_birth', e.target.value)}
                disabled={readOnly}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-70"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={data.marketing_subscribed}
                  onChange={(e) =>
                    update('marketing_subscribed', e.target.checked)
                  }
                  disabled={readOnly}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                />
                Subscribe to marketing communications
              </label>
            </div>
          </div>
        </div>

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
                type="text"
                value={data.address}
                onChange={(e) => update('address', e.target.value)}
                disabled={readOnly}
                placeholder="Enter street address"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-70"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                City
              </label>
              <input
                type="text"
                value={data.city}
                onChange={(e) => update('city', e.target.value)}
                disabled={readOnly}
                placeholder="Enter city"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-70"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <FileText className="h-4 w-4" /> Additional Notes
          </div>
          <textarea
            value={data.notes}
            onChange={(e) => update('notes', e.target.value)}
            disabled={readOnly}
            rows={4}
            placeholder="Add any notes about this customer..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-70"
          />
        </div>

        {!readOnly && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving
                ? 'Saving...'
                : mode === 'create'
                  ? 'Create Customer'
                  : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
