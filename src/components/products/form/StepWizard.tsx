'use client';

import { Info, DollarSign, Image as ImageIcon, Package, Globe, Check, ChevronUp, ChevronDown } from 'lucide-react';

const steps = [
  { id: 1, label: 'Basic Info', icon: Info },
  { id: 2, label: 'Pricing', icon: DollarSign },
  { id: 3, label: 'Media', icon: ImageIcon },
  { id: 4, label: 'Inventory & Shipping', icon: Package },
  { id: 5, label: 'SEO & Status', icon: Globe },
];

interface Props {
  step: number;
  onChange: (step: number) => void;
}

export default function StepWizard({ step, onChange }: Props) {
  return (
    <div className="mb-8 flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {steps.map((s) => {
        const Icon = s.icon;
        const active = step === s.id;
        const past = step > s.id;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition whitespace-nowrap
              ${active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : past ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
              ${active ? 'bg-emerald-600 text-white' : past ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}
            >
              {past ? <Check className="h-3.5 w-3.5" /> : s.id}
            </span>
            <Icon className="h-4 w-4" />
            {s.label}
          </button>
        );
      })}
      <div className="ml-auto flex flex-col gap-0.5">
        <button
          onClick={() => onChange(Math.max(1, step - 1))}
          disabled={step === 1}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => onChange(Math.min(5, step + 1))}
          disabled={step === 5}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
