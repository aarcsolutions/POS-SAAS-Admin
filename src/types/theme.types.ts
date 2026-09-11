export type ThemeSettings = {
  id: string;
  primary_color: string;
  primary_dark: string;
  accent_color: string;
  gold_color: string;
  icon_color: string;
  chart_color: string;
  chart_secondary: string;
  toast_color: string;
  logo_url: string | null;
  updated_at?: string;
};

export type ThemeSettingsPayload = {
  primary_color?: string;
  primary_dark?: string;
  accent_color?: string;
  gold_color?: string;
  icon_color?: string;
  chart_color?: string;
  chart_secondary?: string;
  toast_color?: string;
  logo_url?: string | null;
};
