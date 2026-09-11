'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  DollarSign,
  Languages,
  Loader2,
  Receipt,
} from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useBusinessSettingsQuery,
  useSaveBusinessSettingsMutation,
} from '@/hooks/business-settings';
import { useTaxesQuery } from '@/hooks/taxes';
import { useBranchesQuery } from '@/hooks/branches';
import { useAuthStore } from '@/store/authStore';
import { extractListItems } from '@/utils/helpers';
import { BusinessSettingsRow } from '@/types/business-settings.types';
import { TaxRow } from '@/types/tax.types';

type FormState = {
  id?: string;
  business_name: string;
  currency: string;
  language: string;
  tax_registration_number: string;
  default_tax_id: string;
  prices_include_tax: boolean;
};

const emptyForm = (): FormState => ({
  business_name: '',
  currency: 'PKR',
  language: 'en',
  tax_registration_number: '',
  default_tax_id: '',
  prices_include_tax: false,
});

export default function BusinessSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isTenantAdmin = !user?.branchId;
  const canUpdate = usePermission(ENTITY_PERMS.business_settings.update);
  const canCreate = usePermission(ENTITY_PERMS.business_settings.create);
  const canSave = canUpdate || canCreate;

  const [branchFilter, setBranchFilter] = useState(
    isTenantAdmin ? 'tenant' : ''
  );
  const [form, setForm] = useState<FormState>(emptyForm());
  const [snapshot, setSnapshot] = useState<FormState>(emptyForm());

  const { data: branchesRes } = useBranchesQuery(
    { page: 1, limit: 100 },
    isTenantAdmin
  );
  const branchOptions = extractListItems<{ id: string; name: string }>(
    branchesRes,
    'branches'
  ).map((b) => ({ value: b.id, label: b.name }));

  const settingsParams = useMemo(() => {
    if (!isTenantAdmin) return { page: 1, limit: 1 };
    return {
      page: 1,
      limit: 1,
      branch_id: branchFilter || 'tenant',
    };
  }, [isTenantAdmin, branchFilter]);

  const { data, isLoading, isFetching } =
    useBusinessSettingsQuery(settingsParams);
  const { data: taxesRes } = useTaxesQuery({ page: 1, limit: 100 });
  const saveMutation = useSaveBusinessSettingsMutation();

  const settings = extractListItems<BusinessSettingsRow>(
    data,
    'businessSettings'
  )[0] || extractListItems<BusinessSettingsRow>(data)[0];

  const taxOptions = extractListItems<TaxRow>(taxesRes, 'taxes').map((t) => ({
    value: t.id,
    label:
      t.type === 'percentage'
        ? `${t.name} (${t.value}%)`
        : `${t.name} (flat ${t.value})`,
  }));

  useEffect(() => {
    if (!settings) {
      const blank = emptyForm();
      setForm(blank);
      setSnapshot(blank);
      return;
    }
    const next: FormState = {
      id: settings.id,
      business_name: settings.business_name || '',
      currency: settings.currency || 'PKR',
      language: settings.language || 'en',
      tax_registration_number: settings.tax_registration_number || '',
      default_tax_id: settings.default_tax_id || '',
      prices_include_tax: !!settings.prices_include_tax,
    };
    setForm(next);
    setSnapshot(next);
  }, [settings?.id, settings?.updated_at, branchFilter, isLoading]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleDiscard = () => setForm(snapshot);

  const handleSave = async () => {
    if (!form.business_name.trim()) return;
    await saveMutation.mutateAsync({
      id: form.id,
      business_name: form.business_name.trim(),
      currency: form.currency,
      language: form.language,
      tax_registration_number: form.tax_registration_number.trim() || null,
      default_tax_id: form.default_tax_id || null,
      prices_include_tax: form.prices_include_tax,
      branch_id: isTenantAdmin
        ? branchFilter === 'tenant'
          ? null
          : branchFilter || null
        : undefined,
    });
  };

  const busy = isLoading || isFetching || saveMutation.isPending;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Business Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Restaurant profile, currency, language, and default tax for orders.
          </p>
        </div>
        {isTenantAdmin && (
          <Select
            value={branchFilter}
            onChange={setBranchFilter}
            options={[
              { value: 'tenant', label: 'Tenant (all branches fallback)' },
              ...branchOptions,
            ]}
            allowEmpty={false}
            className="w-[260px]"
          />
        )}
      </div>

      {busy && !form.business_name && (
        <div className="flex justify-center py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Business Profile</h2>
            <p className="text-sm text-slate-500">Company name used on receipts</p>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Business Name
          </label>
          <input
            type="text"
            value={form.business_name}
            onChange={(e) => update('business_name', e.target.value)}
            disabled={!canSave}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:opacity-60"
            placeholder="Enter business name"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Regional Settings</h2>
            <p className="text-sm text-slate-500">Currency and language</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Currency
            </label>
            <Select
              value={form.currency}
              onChange={(v) => update('currency', v)}
              disabled={!canSave}
              variant="form"
              size="lg"
              allowEmpty={false}
              options={[
                { value: 'PKR', label: 'PKR' },
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'GBP', label: 'GBP' },
                { value: 'AED', label: 'AED' },
                { value: 'SAR', label: 'SAR' },
              ]}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Language
            </label>
            <div className="relative">
              <Languages className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Select
                value={form.language}
                onChange={(v) => update('language', v)}
                disabled={!canSave}
                variant="form"
                size="lg"
                allowEmpty={false}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'ur', label: 'Urdu' },
                  { value: 'ar', label: 'Arabic' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Tax Defaults</h2>
            <p className="text-sm text-slate-500">
              Default tax applied to orders when none is selected
            </p>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tax Registration Number
            </label>
            <input
              type="text"
              value={form.tax_registration_number}
              onChange={(e) =>
                update('tax_registration_number', e.target.value)
              }
              disabled={!canSave}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:opacity-60"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Default Tax
            </label>
            <Select
              value={form.default_tax_id}
              onChange={(v) => update('default_tax_id', v)}
              disabled={!canSave}
              variant="form"
              size="lg"
              options={taxOptions}
              placeholder="No default tax"
            />
            <p className="mt-1 text-xs text-slate-400">
              Create taxes under Taxes module first, then select one here.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.prices_include_tax}
              onChange={(e) => update('prices_include_tax', e.target.checked)}
              disabled={!canSave}
              className="h-4 w-4 rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
            />
            Prices include tax (stored for later; order calc stays exclusive)
          </label>
        </div>
      </div>

      {canSave && (
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={saveMutation.isPending}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending || !form.business_name.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95 disabled:opacity-60"
          >
            {saveMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
}
