'use client';

import { useEffect, useState } from 'react';
import { ImageIcon, Loader2, Palette, Type, Upload } from 'lucide-react';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useUpdateWebsiteSettingsMutation,
  useWebsiteSettingsQuery,
} from '@/hooks/website';
import { filesApi } from '@/services/files';
import { WebsiteSettings } from '@/types/website.types';
import { THEME_COLOR_DEFAULTS } from '@/constants/theme-defaults';
import { toast } from 'sonner';

type HeroMediaType = 'image' | 'video';

type FormState = {
  primary_color: string;
  primary_dark: string;
  accent_color: string;
  gold_color: string;
  hero_image_url: string;
  hero_video_url: string;
  favicon_url: string;
  hero_eyebrow: string;
  hero_title_override: string;
  hero_tagline: string;
  hero_cta_label: string;
};

const HERO_VIDEO_MAX_BYTES = 5 * 1024 * 1024;

const defaults = (): FormState => ({
  ...THEME_COLOR_DEFAULTS,
  hero_image_url: '',
  hero_video_url: '',
  favicon_url: '',
  hero_eyebrow: '',
  hero_title_override: '',
  hero_tagline: '',
  hero_cta_label: '',
});

function formatMb(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(0);
}

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

export default function WebsiteSettingsPage() {
  const canUpdate = usePermission(ENTITY_PERMS.website.update);
  const canView = usePermission(ENTITY_PERMS.website.list);
  const { data, isLoading, isFetching } = useWebsiteSettingsQuery(canView);
  const saveMutation = useUpdateWebsiteSettingsMutation();

  const [form, setForm] = useState<FormState>(defaults());
  const [snapshot, setSnapshot] = useState<FormState>(defaults());
  const [heroMediaType, setHeroMediaType] = useState<HeroMediaType>('image');
  const [uploadingHero, setUploadingHero] = useState(false);

  const settings = (data?.data ?? null) as WebsiteSettings | null;

  useEffect(() => {
    if (!settings) return;
    const next: FormState = {
      primary_color:
        settings.primary_color || THEME_COLOR_DEFAULTS.primary_color,
      primary_dark: settings.primary_dark || THEME_COLOR_DEFAULTS.primary_dark,
      accent_color: settings.accent_color || THEME_COLOR_DEFAULTS.accent_color,
      gold_color: settings.gold_color || THEME_COLOR_DEFAULTS.gold_color,
      hero_image_url: settings.hero_image_url || '',
      hero_video_url: settings.hero_video_url || '',
      favicon_url: settings.favicon_url || '',
      hero_eyebrow: settings.hero_eyebrow || '',
      hero_title_override: settings.hero_title_override || '',
      hero_tagline: settings.hero_tagline || '',
      hero_cta_label: settings.hero_cta_label || '',
    };
    setForm(next);
    setSnapshot(next);
    setHeroMediaType(settings.hero_video_url ? 'video' : 'image');
  }, [settings?.id, settings?.updated_at]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpload = async (
    file: File,
    field: 'hero_image_url' | 'hero_video_url'
  ) => {
    setUploadingHero(true);
    try {
      if (field === 'hero_video_url') {
        if (!file.type.startsWith('video/')) {
          toast.error('Please select a video file');
          return;
        }
        if (file.size > HERO_VIDEO_MAX_BYTES) {
          toast.error(
            `Hero video must be ${formatMb(HERO_VIDEO_MAX_BYTES)} MB or less`
          );
          return;
        }
      }

      const result = await filesApi.uploadAndResolveUrl(
        file,
        field === 'hero_video_url' ? 'website-hero-video' : 'website'
      );
      setForm((prev) => ({
        ...prev,
        [field]: result.url,
        ...(field === 'hero_image_url' ? { hero_video_url: '' } : {}),
        ...(field === 'hero_video_url' ? { hero_image_url: '' } : {}),
      }));
      toast.success('Upload complete');
    } catch (error: any) {
      toast.error(error?.message || 'Upload failed');
    } finally {
      setUploadingHero(false);
    }
  };

  const switchHeroType = (type: HeroMediaType) => {
    setHeroMediaType(type);
    if (type === 'image') update('hero_video_url', '');
    else update('hero_image_url', '');
  };

  const handleSave = async () => {
    await saveMutation.mutateAsync({
      primary_color: form.primary_color,
      primary_dark: form.primary_dark,
      accent_color: form.accent_color,
      gold_color: form.gold_color,
      hero_image_url:
        heroMediaType === 'image' ? form.hero_image_url.trim() || null : null,
      hero_video_url:
        heroMediaType === 'video' ? form.hero_video_url.trim() || null : null,
      favicon_url: form.favicon_url.trim() || null,
      hero_eyebrow: form.hero_eyebrow.trim() || null,
      hero_title_override: form.hero_title_override.trim() || null,
      hero_tagline: form.hero_tagline.trim() || null,
      hero_cta_label: form.hero_cta_label.trim() || null,
    });
  };

  const handleSetAsDefault = async () => {
    const next = { ...form, ...THEME_COLOR_DEFAULTS };
    setForm(next);
    await saveMutation.mutateAsync({
      ...THEME_COLOR_DEFAULTS,
      hero_image_url:
        heroMediaType === 'image' ? form.hero_image_url.trim() || null : null,
      hero_video_url:
        heroMediaType === 'video' ? form.hero_video_url.trim() || null : null,
      favicon_url: form.favicon_url.trim() || null,
      hero_eyebrow: form.hero_eyebrow.trim() || null,
      hero_title_override: form.hero_title_override.trim() || null,
      hero_tagline: form.hero_tagline.trim() || null,
      hero_cta_label: form.hero_cta_label.trim() || null,
    });
  };

  const busy = isLoading || isFetching || saveMutation.isPending;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Website
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Storefront colors, hero media, and copy. Logo comes from Theme.
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
            <h2 className="text-lg font-bold text-slate-900">Website colors</h2>
            <p className="text-sm text-slate-500">
              Independent from Admin Theme colors
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            label="Primary"
            value={form.primary_color}
            disabled={!canUpdate}
            onChange={(v) => update('primary_color', v)}
          />
          <ColorField
            label="Primary dark"
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
            label="Gold"
            value={form.gold_color}
            disabled={!canUpdate}
            onChange={(v) => update('gold_color', v)}
          />
        </div>
        {canUpdate ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Seed defaults: #d97706 / #5b3b1e
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
            <h2 className="text-lg font-bold text-slate-900">Hero media</h2>
            <p className="text-sm text-slate-500">
              Background image or video for the public website
            </p>
          </div>
        </div>

        <div className="mb-3 flex gap-2">
          {(['image', 'video'] as const).map((type) => (
            <button
              key={type}
              type="button"
              disabled={!canUpdate}
              onClick={() => switchHeroType(type)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                heroMediaType === type
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              } disabled:opacity-60`}
            >
              {type}
            </button>
          ))}
        </div>
        <p className="mb-3 text-xs text-slate-500">
          {heroMediaType === 'video'
            ? `Upload one hero video (max ${formatMb(HERO_VIDEO_MAX_BYTES)} MB).`
            : 'Upload a hero background image.'}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {heroMediaType === 'image' && form.hero_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.hero_image_url}
              alt="Hero preview"
              className="h-16 w-28 rounded-lg border border-slate-200 object-cover"
            />
          ) : null}
          {heroMediaType === 'video' && form.hero_video_url ? (
            <video
              src={form.hero_video_url}
              className="h-16 w-28 rounded-lg border border-slate-200 object-cover"
              muted
              playsInline
            />
          ) : null}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
            {uploadingHero ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploadingHero
              ? 'Uploading…'
              : heroMediaType === 'video'
                ? 'Upload hero video'
                : 'Upload hero image'}
            <input
              type="file"
              accept={
                heroMediaType === 'video'
                  ? 'video/mp4,video/webm,video/quicktime'
                  : 'image/*'
              }
              className="hidden"
              disabled={!canUpdate || uploadingHero}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                handleUpload(
                  file,
                  heroMediaType === 'video' ? 'hero_video_url' : 'hero_image_url'
                );
                e.target.value = '';
              }}
            />
          </label>
          {canUpdate &&
          ((heroMediaType === 'image' && form.hero_image_url) ||
            (heroMediaType === 'video' && form.hero_video_url)) ? (
            <button
              type="button"
              className="text-sm text-slate-500 underline"
              onClick={() => {
                if (heroMediaType === 'image') update('hero_image_url', '');
                else update('hero_video_url', '');
              }}
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <Type className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Hero copy</h2>
            <p className="text-sm text-slate-500">Optional overrides</p>
          </div>
        </div>
        <div className="space-y-4">
          {(
            [
              ['hero_eyebrow', 'Eyebrow', 'Small label above title'],
              ['hero_title_override', 'Title override', 'Optional headline'],
              ['hero_tagline', 'Tagline', 'Supporting sentence'],
              ['hero_cta_label', 'CTA label', 'e.g. Order Now'],
            ] as const
          ).map(([key, label, placeholder]) => (
            <div key={key}>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
              </label>
              <input
                type="text"
                value={form[key]}
                disabled={!canUpdate}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:opacity-60"
              />
            </div>
          ))}
        </div>
      </div>

      {canUpdate ? (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setForm(snapshot);
              setHeroMediaType(snapshot.hero_video_url ? 'video' : 'image');
            }}
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
