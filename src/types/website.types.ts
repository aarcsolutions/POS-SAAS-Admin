export type WebsiteSettings = {
  id: string;
  primary_color: string;
  primary_dark: string;
  accent_color: string;
  gold_color: string;
  hero_image_url: string | null;
  hero_video_url: string | null;
  favicon_url: string | null;
  hero_eyebrow: string | null;
  hero_title_override: string | null;
  hero_tagline: string | null;
  hero_cta_label: string | null;
  updated_at?: string;
};

export type WebsiteSettingsPayload = {
  primary_color?: string;
  primary_dark?: string;
  accent_color?: string;
  gold_color?: string;
  hero_image_url?: string | null;
  hero_video_url?: string | null;
  favicon_url?: string | null;
  hero_eyebrow?: string | null;
  hero_title_override?: string | null;
  hero_tagline?: string | null;
  hero_cta_label?: string | null;
};
