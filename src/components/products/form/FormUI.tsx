import { type LucideIcon } from 'lucide-react';

export const Card = ({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
      <Icon className="h-4 w-4 text-emerald-600" />
      <span className="text-sm font-semibold text-slate-800">{title}</span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export const Label = ({ children, req }: { children: React.ReactNode; req?: boolean }) => (
  <label className="mb-1.5 block text-sm font-medium text-slate-700">
    {children}{req && <span className="ml-1 text-rose-500">*</span>}
  </label>
);

export const Inp = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...p}
    className={`h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 ${p.className || ''}`}
  />
);

export const Txt = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...p}
    className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-none ${p.className || ''}`}
  />
);

export const Sel = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...p}
    className={`h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 ${p.className || ''}`}
  />
);

export const Radio = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    type="radio"
    {...p}
    className={`h-4 w-4 border-slate-300 accent-emerald-600 focus:ring-emerald-500 ${p.className || ''}`}
  />
);

export const Checkbox = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    type="checkbox"
    {...p}
    className={`h-4 w-4 rounded border-slate-300 accent-emerald-600 focus:ring-emerald-500 ${p.className || ''}`}
  />
);

export const PKRInput = ({ value, onChange, placeholder = '0.00' }: { value: number; onChange: (v: number) => void; placeholder?: string }) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">PKR</span>
    <Inp type="number" value={value || ''} onChange={(e) => onChange(Number(e.target.value))} placeholder={placeholder} className="pl-12" />
  </div>
);
