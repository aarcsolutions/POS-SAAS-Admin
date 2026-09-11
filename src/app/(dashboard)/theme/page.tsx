'use client';

import { useEffect, useState } from 'react';
import { ImageIcon, Loader2, Palette, Upload } from 'lucide-react';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useUpdateThemeSettingsMutation,
  useThemeSettingsQuery,
} from '@/hooks/theme';
import { filesApi } from '@/services/files';
import { ThemeSettings } from '@/types/theme.types';
import { THEME_COLOR_DEFAULTS } from '@/constants/theme-defaults';
import { toast } from 'sonner';
import { applyThemeToDocument } from '@/components/providers/ThemeProvider';

type FormState = {
  primary_color: string;
  primary_dark: string;
  accent_color: string;
  gold_color: string;
  icon_color: string;
  chart_color: string;
  chart_secondary: string;
  toast_color: string;
  logo_url: string;
};

const defaults = (): FormState => ({
  ...THEME_COLOR_DEFAULTS,
  logo_url: '',
});

function ColorField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value || '#000000'}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 disabled:opacity-60"
        />
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 font-mono text-sm outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:opacity-60"
          placeholder="#d97706"
        />
      </div>
    </div>
  );
}

export default function ThemeSettingsPage() {
  const canUpdate = usePermission(ENTITY_PERMS.theme.update);
  const canView = usePermission(ENTITY_PERMS.theme.list);
  const { data, isLoading, isFetching } = useThemeSettingsQuery(canView);
  const saveMutation = useUpdateThemeSettingsMutation();

  const [form, setForm] = useState<FormState>(defaults());
  const [snapshot, setSnapshot] = useState<FormState>(defaults());
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const settings = (data?.data ?? null) as ThemeSettings | null;

  useEffect(() => {
    if (!settings) return;
    const next: FormState = {
      primary_color:
        settings.primary_color || THEME_COLOR_DEFAULTS.primary_color,
      primary_dark: settings.primary_dark || THEME_COLOR_DEFAULTS.primary_dark,
      accent_color: settings.accent_color || THEME_COLOR_DEFAULTS.accent_color,
      gold_color: settings.gold_color || THEME_COLOR_DEFAULTS.gold_color,
      icon_color: settings.icon_color || THEME_COLOR_DEFAULTS.icon_color,
      chart_color: settings.chart_color || THEME_COLOR_DEFAULTS.chart_color,
      chart_secondary:
        settings.chart_secondary || THEME_COLOR_DEFAULTS.chart_secondary,
      toast_color: settings.toast_color || THEME_COLOR_DEFAULTS.toast_color,
      logo_url: settings.logo_url || '',
    };
    setForm(next);
    setSnapshot(next);
  }, [settings?.id, settings?.updated_at]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadLogo = async (file: File) => {
    setUploadingLogo(true);
    try {
      const result = await filesApi.uploadAndResolveUrl(file, 'theme-logo');
      setForm((prev) => ({ ...prev, logo_url: result.url }));
      toast.success('Upload complete');
    } catch (error: any) {
      toast.error(error?.message || 'Upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    await saveMutation.mutateAsync({
      primary_color: form.primary_color,
      primary_dark: form.primary_dark,
      accent_color: form.accent_color,
      gold_color: form.gold_color,
      icon_color: form.icon_color,
      chart_color: form.chart_color,
      chart_secondary: form.chart_secondary,
      toast_color: form.toast_color,
      logo_url: form.logo_url.trim() || null,
    });
  };

  const handleSetAsDefault = async () => {
    const next = { ...form, ...THEME_COLOR_DEFAULTS };
    setForm(next);
    applyThemeToDocument(THEME_COLOR_DEFAULTS);
    await saveMutation.mutateAsync({
      ...THEME_COLOR_DEFAULTS,
      logo_url: form.logo_url.trim() || null,
    });
  };

  const busy = isLoading || isFetching || saveMutation.isPending;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Theme
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Admin / branch portal colors and logo. Storefront has its own Website
          colors.
        </p>
      </div>

      {busy && !settings && (
        <div className="flex justify-center py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Admin colors</h2>
            <p className="text-sm text-slate-500">
              Shell, icons, charts, toasts — all default orange and editable
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            label="Primary (nav / buttons)"
            value={form.primary_color}
            disabled={!canUpdate}
            onChange={(v) => update('primary_color', v)}
          />
          <ColorField
            label="Primary dark (sidebar)"
            value={form.primary_dark}
            disabled={!canUpdate}
            onChange={(v) => update('primary_dark', v)}
          />
          <ColorField
            label="Accent"
            value={form.accent_color}
            disabled={!canUpdate}
            onChange={(v) => update('accent_color', v)}
          />
          <ColorField
            label="Gold (surfaces)"
            value={form.gold_color}
            disabled={!canUpdate}
            onChange={(v) => update('gold_color', v)}
          />
          <ColorField
            label="Icon color"
            value={form.icon_color}
            disabled={!canUpdate}
            onChange={(v) => update('icon_color', v)}
          />
          <ColorField
            label="Toast / alerts"
            value={form.toast_color}
            disabled={!canUpdate}
            onChange={(v) => update('toast_color', v)}
          />
          <ColorField
            label="Chart primary"
            value={form.chart_color}
            disabled={!canUpdate}
            onChange={(v) => update('chart_color', v)}
          />
          <ColorField
            label="Chart secondary"
            value={form.chart_secondary}
            disabled={!canUpdate}
            onChange={(v) => update('chart_secondary', v)}
          />
        </div>
        {canUpdate ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Seed defaults: orange (#d97706)
            </p>
            <button
              type="button"
              onClick={handleSetAsDefault}
              disabled={busy}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              Set as default
            </button>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Logo</h2>
            <p className="text-sm text-slate-500">
              Shared by Admin portal and customer website
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {form.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.logo_url}
              alt="Logo preview"
              className="h-14 w-14 rounded-lg border border-slate-200 object-contain"
            />
          ) : null}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
            {uploadingLogo ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploadingLogo ? 'Uploading…' : 'Upload logo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={!canUpdate || uploadingLogo}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadLogo(file);
                e.target.value = '';
              }}
            />
          </label>
          {form.logo_url && canUpdate ? (
            <button
              type="button"
              className="text-sm text-slate-500 underline"
              onClick={() => update('logo_url', '')}
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {canUpdate ? (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setForm(snapshot)}
            disabled={busy}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Save changes
          </button>
        </div>
      ) : null}
    </div>
  );
}
