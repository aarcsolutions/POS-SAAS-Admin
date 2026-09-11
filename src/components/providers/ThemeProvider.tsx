'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import { useThemeSettingsQuery } from '@/hooks/theme';
import type { ThemeSettings } from '@/types/theme.types';
import { useAuthStore } from '@/store/authStore';
import { THEME_COLOR_DEFAULTS } from '@/constants/theme-defaults';

type ThemeContextValue = {
  theme: ThemeSettings | null;
  loading: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: null,
  loading: true,
});

export function applyThemeToDocument(theme: Partial<ThemeSettings> | null) {
  const root = document.documentElement;
  const primary = theme?.primary_color || THEME_COLOR_DEFAULTS.primary_color;
  const primaryDark =
    theme?.primary_dark || THEME_COLOR_DEFAULTS.primary_dark;
  const accent = theme?.accent_color || THEME_COLOR_DEFAULTS.accent_color;
  const gold = theme?.gold_color || THEME_COLOR_DEFAULTS.gold_color;
  const icon = theme?.icon_color || THEME_COLOR_DEFAULTS.icon_color;
  const chart = theme?.chart_color || THEME_COLOR_DEFAULTS.chart_color;
  const chartSecondary =
    theme?.chart_secondary || THEME_COLOR_DEFAULTS.chart_secondary;
  const toast = theme?.toast_color || THEME_COLOR_DEFAULTS.toast_color;

  root.style.setProperty('--brand-primary', primary);
  root.style.setProperty('--brand-primary-dark', primaryDark);
  root.style.setProperty('--brand-accent', accent);
  root.style.setProperty('--brand-gold', gold);
  root.style.setProperty('--brand-icon', icon);
  root.style.setProperty('--brand-chart', chart);
  root.style.setProperty('--brand-chart-secondary', chartSecondary);
  root.style.setProperty('--brand-toast', toast);
  root.style.setProperty(
    '--brand-primary-soft',
    `color-mix(in srgb, ${primary} 14%, white)`
  );
  root.style.setProperty(
    '--brand-accent-soft',
    `color-mix(in srgb, ${accent} 14%, white)`
  );
  root.style.setProperty(
    '--brand-icon-soft',
    `color-mix(in srgb, ${icon} 14%, white)`
  );
  root.style.setProperty(
    '--brand-toast-soft',
    `color-mix(in srgb, ${toast} 14%, white)`
  );
  root.style.setProperty(
    '--admin-bg',
    `color-mix(in srgb, ${gold} 18%, white)`
  );
  root.style.setProperty(
    '--admin-surface',
    `color-mix(in srgb, ${gold} 10%, white)`
  );
  root.style.setProperty(
    '--admin-border',
    `color-mix(in srgb, ${primaryDark} 22%, white)`
  );
  root.style.setProperty(
    '--admin-muted',
    `color-mix(in srgb, ${primaryDark} 55%, white)`
  );
  root.style.setProperty(
    '--admin-sidebar-text',
    `color-mix(in srgb, ${gold} 72%, white)`
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  // Require a real access cookie — stale zustand alone must not call theme/getAll on /login
  const [hasAccessToken, setHasAccessToken] = useState(false);
  useEffect(() => {
    setHasAccessToken(Boolean(Cookies.get('access_token')));
  }, [user?.tenantId]);

  const { data, isLoading, isFetching } = useThemeSettingsQuery(
    hasAccessToken && !!user?.tenantId
  );
  const theme = (data?.data ?? null) as ThemeSettings | null;

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [
    theme?.id,
    theme?.updated_at,
    theme?.primary_color,
    theme?.primary_dark,
    theme?.accent_color,
    theme?.gold_color,
    theme?.icon_color,
    theme?.chart_color,
    theme?.chart_secondary,
    theme?.toast_color,
    theme?.logo_url,
  ]);

  return (
    <ThemeContext.Provider
      value={{ theme, loading: isLoading || isFetching }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(ThemeContext);
}

/** Read a CSS variable from :root (client only). */
export function readCssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}
