'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Building2,
  DollarSign,
  Languages,
  Loader2,
  Mail,
  Receipt,
} from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useBusinessSettingsQuery,
  useSaveBusinessSettingsMutation,
} from '@/hooks/business-settings';
import {
  useNotificationSettingsQuery,
  useSaveNotificationSettingsMutation,
} from '@/hooks/notifications';
import { useTaxesQuery } from '@/hooks/taxes';
import { useBranchesQuery } from '@/hooks/branches';
import { useAuthStore } from '@/store/authStore';
import { extractListItems } from '@/utils/helpers';
import { BusinessSettingsRow } from '@/types/business-settings.types';
import { NotificationSettingsRow } from '@/types/notification-settings.types';
import { TaxRow } from '@/types/tax.types';

type TabId = 'profile' | 'notifications';

type FormState = {
  id?: string;
  business_name: string;
  currency: string;
  language: string;
  tax_registration_number: string;
  default_tax_id: string;
  prices_include_tax: boolean;
};

type NotifFormState = {
  id?: string;
  order_confirmation_email: boolean;
  reservation_email: boolean;
  catering_email: boolean;
  catering_admin_notify: boolean;
  from_name: string;
  from_email: string;
  smtp_host: string;
  smtp_port: string;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_password: string;
  smtp_password_set: boolean;
  is_smtp_configured: boolean;
};

const emptyForm = (): FormState => ({
  business_name: '',
  currency: 'PKR',
  language: 'en',
  tax_registration_number: '',
  default_tax_id: '',
  prices_include_tax: false,
});

const emptyNotifForm = (): NotifFormState => ({
  order_confirmation_email: false,
  reservation_email: false,
  catering_email: false,
  catering_admin_notify: false,
  from_name: '',
  from_email: '',
  smtp_host: '',
  smtp_port: '465',
  smtp_secure: true,
  smtp_user: '',
  smtp_password: '',
  smtp_password_set: false,
  is_smtp_configured: false,
});

export default function BusinessSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isTenantAdmin = !user?.branchId;
  const canUpdate = usePermission(ENTITY_PERMS.business_settings.update);
  const canCreate = usePermission(ENTITY_PERMS.business_settings.create);
  const canSave = canUpdate || canCreate;

  const canViewNotifications = usePermission(ENTITY_PERMS.notifications.list);
  const canUpdateNotifications = usePermission(
    ENTITY_PERMS.notifications.update
  );

  const [tab, setTab] = useState<TabId>('profile');
  const [branchFilter, setBranchFilter] = useState(
    isTenantAdmin ? 'tenant' : ''
  );
  const [form, setForm] = useState<FormState>(emptyForm());
  const [snapshot, setSnapshot] = useState<FormState>(emptyForm());
  const [notifForm, setNotifForm] = useState<NotifFormState>(emptyNotifForm());
  const [notifSnapshot, setNotifSnapshot] =
    useState<NotifFormState>(emptyNotifForm());

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

  const {
    data: notifRes,
    isLoading: notifLoading,
    isFetching: notifFetching,
  } = useNotificationSettingsQuery(canViewNotifications && tab === 'notifications');
  const saveNotifMutation = useSaveNotificationSettingsMutation();

  const settings =
    extractListItems<BusinessSettingsRow>(data, 'businessSettings')[0] ||
    extractListItems<BusinessSettingsRow>(data)[0];

  const notifSettings = (notifRes?.data ?? null) as NotificationSettingsRow | null;

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

  useEffect(() => {
    if (!notifSettings) return;
    const next: NotifFormState = {
      id: notifSettings.id,
      order_confirmation_email: !!notifSettings.order_confirmation_email,
      reservation_email: !!notifSettings.reservation_email,
      catering_email: !!notifSettings.catering_email,
      catering_admin_notify: !!notifSettings.catering_admin_notify,
      from_name: notifSettings.from_name || '',
      from_email: notifSettings.from_email || '',
      smtp_host: notifSettings.smtp_host || '',
      smtp_port:
        notifSettings.smtp_port != null
          ? String(notifSettings.smtp_port)
          : '465',
      smtp_secure: notifSettings.smtp_secure !== false,
      smtp_user: notifSettings.smtp_user || '',
      smtp_password: '',
      smtp_password_set: !!notifSettings.smtp_password_set,
      is_smtp_configured: !!notifSettings.is_smtp_configured,
    };
    setNotifForm(next);
    setNotifSnapshot(next);
  }, [notifSettings?.id, notifSettings?.updated_at]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateNotif = <K extends keyof NotifFormState>(
    key: K,
    value: NotifFormState[K]
  ) => {
    setNotifForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleDiscard = () => setForm(snapshot);
  const handleNotifDiscard = () => setNotifForm(notifSnapshot);

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

  const handleNotifSave = async () => {
    const portNum = notifForm.smtp_port
      ? parseInt(notifForm.smtp_port, 10)
      : null;
    await saveNotifMutation.mutateAsync({
      id: notifForm.id,
      order_confirmation_email: notifForm.order_confirmation_email,
      reservation_email: notifForm.reservation_email,
      catering_email: notifForm.catering_email,
      catering_admin_notify: notifForm.catering_admin_notify,
      from_name: notifForm.from_name.trim() || null,
      from_email: notifForm.from_email.trim() || null,
      smtp_host: notifForm.smtp_host.trim() || null,
      smtp_port: Number.isFinite(portNum as number) ? portNum : null,
      smtp_secure: notifForm.smtp_secure,
      smtp_user: notifForm.smtp_user.trim() || null,
      smtp_password: notifForm.smtp_password.trim() || undefined,
    });
  };

  const busy = isLoading || isFetching || saveMutation.isPending;
  const notifBusy =
    notifLoading || notifFetching || saveNotifMutation.isPending;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Business Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Restaurant profile, tax defaults, and customer notifications.
          </p>
        </div>
        {tab === 'profile' && isTenantAdmin && (
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

      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('profile')}
          className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            tab === 'profile'
              ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Profile &amp; Tax
        </button>
        {canViewNotifications && (
          <button
            type="button"
            onClick={() => setTab('notifications')}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === 'notifications'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Notifications
          </button>
        )}
      </div>

      {tab === 'profile' && (
        <>
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
                <h2 className="text-lg font-bold text-slate-900">
                  Business Profile
                </h2>
                <p className="text-sm text-slate-500">
                  Company name used on receipts
                </p>
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
                <h2 className="text-lg font-bold text-slate-900">
                  Regional Settings
                </h2>
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
                  onChange={(e) =>
                    update('prices_include_tax', e.target.checked)
                  }
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
        </>
      )}

      {tab === 'notifications' && canViewNotifications && (
        <>
          {notifBusy && !notifForm.id && (
            <div className="flex justify-center py-8 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Notification Channels
                </h2>
                <p className="text-sm text-slate-500">
                  Email alerts for orders and reservations (requires SMTP below)
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={notifForm.order_confirmation_email}
                  onChange={(e) =>
                    updateNotif('order_confirmation_email', e.target.checked)
                  }
                  disabled={!canUpdateNotifications}
                  className="h-4 w-4 rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                Email
                <span className="text-xs font-normal text-slate-400">
                  (order confirmation)
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={notifForm.reservation_email}
                  onChange={(e) =>
                    updateNotif('reservation_email', e.target.checked)
                  }
                  disabled={!canUpdateNotifications}
                  className="h-4 w-4 rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                Reservation emails
                <span className="text-xs font-normal text-slate-400">
                  (request / confirm / cancel)
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={notifForm.catering_email}
                  onChange={(e) =>
                    updateNotif('catering_email', e.target.checked)
                  }
                  disabled={!canUpdateNotifications}
                  className="h-4 w-4 rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                Catering emails
                <span className="text-xs font-normal text-slate-400">
                  (request / quote / confirm / cancel)
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={notifForm.catering_admin_notify}
                  onChange={(e) =>
                    updateNotif('catering_admin_notify', e.target.checked)
                  }
                  disabled={!canUpdateNotifications}
                  className="h-4 w-4 rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                Catering admin notify
                <span className="text-xs font-normal text-slate-400">
                  (new website inquiry → from email)
                </span>
              </label>
              <label className="flex cursor-not-allowed items-center gap-2 text-sm text-slate-400">
                <input type="checkbox" disabled checked={false} className="h-4 w-4" />
                WhatsApp
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  Coming soon
                </span>
              </label>
              <label className="flex cursor-not-allowed items-center gap-2 text-sm text-slate-400">
                <input type="checkbox" disabled checked={false} className="h-4 w-4" />
                SMS
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  Coming soon
                </span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Email Configuration
                </h2>
                <p className="text-sm text-slate-500">
                  Tenant SMTP used for customer order emails. No mail is sent
                  until this is fully configured.
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              Status:{' '}
              <span
                className={
                  notifForm.is_smtp_configured
                    ? 'font-semibold text-emerald-700'
                    : 'font-semibold text-amber-700'
                }
              >
                {notifForm.is_smtp_configured
                  ? 'SMTP configured'
                  : 'SMTP incomplete'}
              </span>
              {notifForm.smtp_password_set && !notifForm.smtp_password && (
                <span className="ml-2 text-slate-500">
                  (password already saved — leave blank to keep)
                </span>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Sender name
                </label>
                <input
                  type="text"
                  value={notifForm.from_name}
                  onChange={(e) => updateNotif('from_name', e.target.value)}
                  disabled={!canUpdateNotifications}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:opacity-60"
                  placeholder="Your Restaurant"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Sender email
                </label>
                <input
                  type="email"
                  value={notifForm.from_email}
                  onChange={(e) => updateNotif('from_email', e.target.value)}
                  disabled={!canUpdateNotifications}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:opacity-60"
                  placeholder="orders@yourdomain.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  SMTP host
                </label>
                <input
                  type="text"
                  value={notifForm.smtp_host}
                  onChange={(e) => updateNotif('smtp_host', e.target.value)}
                  disabled={!canUpdateNotifications}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:opacity-60"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  SMTP port
                </label>
                <input
                  type="number"
                  value={notifForm.smtp_port}
                  onChange={(e) => updateNotif('smtp_port', e.target.value)}
                  disabled={!canUpdateNotifications}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:opacity-60"
                  placeholder="465"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={notifForm.smtp_secure}
                    onChange={(e) =>
                      updateNotif('smtp_secure', e.target.checked)
                    }
                    disabled={!canUpdateNotifications}
                    className="h-4 w-4 rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                  />
                  Use TLS / secure connection
                </label>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  SMTP username
                </label>
                <input
                  type="text"
                  value={notifForm.smtp_user}
                  onChange={(e) => updateNotif('smtp_user', e.target.value)}
                  disabled={!canUpdateNotifications}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:opacity-60"
                  placeholder="Same as sender email often"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  SMTP password
                </label>
                <input
                  type="password"
                  value={notifForm.smtp_password}
                  onChange={(e) => updateNotif('smtp_password', e.target.value)}
                  disabled={!canUpdateNotifications}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:opacity-60"
                  placeholder={
                    notifForm.smtp_password_set
                      ? '•••••••• (leave blank to keep)'
                      : 'App password or SMTP password'
                  }
                />
              </div>
            </div>
          </div>

          {canUpdateNotifications && (
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleNotifDiscard}
                disabled={saveNotifMutation.isPending}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={handleNotifSave}
                disabled={saveNotifMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95 disabled:opacity-60"
              >
                {saveNotifMutation.isPending && (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
                Save Notifications
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
