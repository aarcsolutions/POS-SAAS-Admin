'use client';

import { LucideIcon } from 'lucide-react';

export interface KpiItem {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
}

interface Props {
  items: KpiItem[];
}

export default function KpiStrip({ items }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                <Icon className="h-5 w-5" />
              </div>
              {item.sublabel && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {item.sublabel}
                </span>
              )}
            </div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {item.label}
            </div>
            <div className="mt-1 text-xl font-bold text-slate-900">
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
