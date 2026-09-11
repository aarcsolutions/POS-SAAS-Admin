'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardPaymentMixItem } from '@/types/dashboard.types';
import { readCssVar } from '@/components/providers/ThemeProvider';
import { THEME_COLOR_DEFAULTS } from '@/constants/theme-defaults';

const methodLabels: Record<string, string> = {
  cod: 'Cash on Delivery',
  cash: 'Cash',
  card: 'Card',
  unknown: 'Unknown',
};

interface Props {
  items: DashboardPaymentMixItem[];
}

function buildPalette(primary: string, secondary: string) {
  return [
    primary,
    secondary,
    `color-mix(in srgb, ${primary} 70%, white)`,
    `color-mix(in srgb, ${secondary} 70%, black)`,
    `color-mix(in srgb, ${primary} 45%, ${secondary})`,
  ];
}

export default function PaymentMixChart({ items }: Props) {
  const [palette, setPalette] = useState(() =>
    buildPalette(
      THEME_COLOR_DEFAULTS.chart_color,
      THEME_COLOR_DEFAULTS.chart_secondary
    )
  );

  useEffect(() => {
    setPalette(
      buildPalette(
        readCssVar('--brand-chart', THEME_COLOR_DEFAULTS.chart_color),
        readCssVar(
          '--brand-chart-secondary',
          THEME_COLOR_DEFAULTS.chart_secondary
        )
      )
    );
  }, []);

  const total = items.reduce((sum, i) => sum + i.amount, 0);

  const segments = useMemo(() => {
    if (items.length === 0 || total <= 0) return [];
    let cumulative = 0;
    return items.map((item, index) => {
      const start = cumulative;
      cumulative += item.percent;
      return {
        ...item,
        start,
        end: cumulative,
        color: palette[index % palette.length],
      };
    });
  }, [items, palette, total]);

  if (items.length === 0 || total <= 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        No payment data for this period
      </div>
    );
  }

  const gradient = segments
    .map((s) => `${s.color} ${s.start}% ${s.end}%`)
    .join(', ');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center">
        <div
          className="relative h-36 w-36 rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white text-center">
            <span className="text-[10px] font-semibold uppercase text-slate-400">
              Total
            </span>
            <span className="text-sm font-bold text-slate-800">
              {items.reduce((s, i) => s + i.count, 0)} orders
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.method}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: palette[index % palette.length] }}
                />
                {methodLabels[item.method] || item.method}
              </span>
              <span className="font-semibold text-slate-900">
                {item.percent}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${item.percent}%`,
                  backgroundColor: palette[index % palette.length],
                }}
              />
            </div>
            <div className="mt-0.5 text-xs text-slate-400">
              {item.count} orders · {item.amount_formatted}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
