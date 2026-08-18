'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  /** When true, list includes a blank option that clears value. Default: true if placeholder set. */
  allowEmpty?: boolean;
  disabled?: boolean;
  className?: string;
  /** Extra classes on the trigger button */
  triggerClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  /** filter = white border style; form = light fill used in forms */
  variant?: 'filter' | 'form';
  id?: string;
  name?: string;
  required?: boolean;
  'aria-label'?: string;
};

const sizeClasses = {
  sm: 'h-9 text-[12px] pl-3 pr-9',
  md: 'h-10 text-[13px] pl-4 pr-10',
  lg: 'h-11 text-[14px] pl-4 pr-10',
} as const;

const variantClasses = {
  filter:
    'border border-slate-200 bg-white text-slate-700 shadow-sm focus:border-[#d97706] focus:ring-4 focus:ring-[#fcd299]/60',
  form:
    'border border-slate-200 bg-slate-50 text-slate-800 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#fcd299]/60',
} as const;

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  allowEmpty,
  disabled = false,
  className = '',
  triggerClassName = '',
  size = 'md',
  variant = 'filter',
  id,
  name,
  required,
  'aria-label': ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);
  const showEmpty = allowEmpty ?? Boolean(placeholder);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name ? (
        <input type="hidden" name={name} value={value} required={required && !value} />
      ) : null}
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`relative w-full appearance-none rounded-xl text-left font-medium transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${variantClasses[variant]} ${triggerClassName}`}
      >
        <span className={`block truncate ${selected ? '' : 'text-slate-400'}`}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-150"
        >
          {showEmpty && (
            <li
              role="option"
              aria-selected={!value}
              className={`cursor-pointer px-3 py-2 text-[13px] text-slate-400 hover:bg-[#fff7ee] ${!value ? 'bg-[#fff4e6]' : ''}`}
              onClick={() => pick('')}
            >
              {placeholder}
            </li>
          )}
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled}
                className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-[13px] ${
                  opt.disabled
                    ? 'cursor-not-allowed text-slate-300'
                    : isSelected
                      ? 'bg-[#fff4e6] font-semibold text-[#b45309]'
                      : 'text-slate-700 hover:bg-[#fff7ee]'
                }`}
                onClick={() => {
                  if (!opt.disabled) pick(opt.value);
                }}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
