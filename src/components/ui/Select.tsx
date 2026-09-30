'use client';

import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';

export type SelectOption = {
  value: string;
  label: string;
  /** Secondary text shown on the right (e.g. branch name) */
  meta?: string;
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
  searchable?: boolean;
  searchPlaceholder?: string;
  /** When true, panel shows Loading… and trigger cannot open meaningfully */
  loading?: boolean;
  /** Shown when not loading and options array is empty */
  emptyMessage?: string;
  'aria-label'?: string;
};

const sizeClasses = {
  sm: 'h-9 text-[12px] pl-3 pr-9',
  md: 'h-10 text-[13px] pl-4 pr-10',
  lg: 'h-11 text-[14px] pl-4 pr-10',
} as const;

const variantClasses = {
  filter:
    'border border-[var(--admin-border)] bg-white text-[var(--brand-primary-dark)] shadow-sm focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary-soft)]',
  form:
    'border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--brand-primary-dark)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary-soft)]',
} as const;

const PANEL_MAX_H = 240;
/** Cap visible rows so longer lists scroll (~4 options). */
const LIST_VIEWPORT_H = 152;

type PanelCoords = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: 'bottom' | 'top';
};

type ScrollMetrics = {
  thumbTop: number;
  thumbHeight: number;
  canScroll: boolean;
};

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
  searchable = false,
  searchPlaceholder = 'Search...',
  loading = false,
  emptyMessage = 'No options',
  'aria-label': ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<PanelCoords>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: PANEL_MAX_H,
    placement: 'bottom',
  });
  const [scrollMetrics, setScrollMetrics] = useState<ScrollMetrics>({
    thumbTop: 0,
    thumbHeight: 40,
    canScroll: false,
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);
  const showEmpty = allowEmpty ?? Boolean(placeholder);
  const isDisabled = disabled || loading;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!searchable || !needle) return options;
    return options.filter((option) => {
      const haystack = `${option.label} ${option.meta ?? ''}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [options, query, searchable]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 4;
    const spaceBelow = window.innerHeight - rect.bottom - gap - 8;
    const spaceAbove = rect.top - gap - 8;
    const preferBottom =
      spaceBelow >= Math.min(PANEL_MAX_H, 160) || spaceBelow >= spaceAbove;
    const maxHeight = Math.max(
      120,
      Math.min(PANEL_MAX_H, preferBottom ? spaceBelow : spaceAbove)
    );
    const measured = panelRef.current?.offsetHeight;
    const panelHeight = Math.min(maxHeight, measured && measured > 0 ? measured : maxHeight);
    const top = preferBottom
      ? rect.bottom + gap
      : Math.max(8, rect.top - gap - panelHeight);

    setCoords({
      top,
      left: rect.left,
      width: rect.width,
      maxHeight,
      placement: preferBottom ? 'bottom' : 'top',
    });
  };

  const updateScrollMetrics = () => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScroll = scrollHeight > clientHeight + 1;
    if (!canScroll) {
      setScrollMetrics({ thumbTop: 0, thumbHeight: clientHeight, canScroll: false });
      return;
    }
    const thumbHeight = Math.max(28, (clientHeight / scrollHeight) * clientHeight);
    const maxThumbTop = clientHeight - thumbHeight;
    const thumbTop =
      (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop;
    setScrollMetrics({ thumbTop, thumbHeight, canScroll: true });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const raf = requestAnimationFrame(() => {
      updatePosition();
      updateScrollMetrics();
    });
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, filtered.length, searchable, query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target) ||
        rootRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
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

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    if (searchable && !loading) {
      window.requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open, searchable, loading]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setOpen(false), 160);
  };

  const openOnHover = () => {
    if (isDisabled) return;
    cancelClose();
    if (!open) {
      updatePosition();
      setOpen(true);
    }
  };

  const toggleOpen = () => {
    if (isDisabled) return;
    cancelClose();
    if (open) {
      setOpen(false);
      return;
    }
    updatePosition();
    setOpen(true);
  };

  useEffect(() => {
    return () => cancelClose();
  }, []);

  const displayLabel = loading
    ? 'Loading…'
    : selected
      ? selected.meta
        ? `${selected.label} · ${selected.meta}`
        : selected.label
      : placeholder;

  const showClearOption = showEmpty && Boolean(value) && options.length > 0;

  const panelReady = open && !isDisabled && coords.width > 0;
  const searchBlockH = searchable ? 49 : 0;
  const listMaxH = Math.max(
    96,
    Math.min(LIST_VIEWPORT_H, coords.maxHeight - searchBlockH)
  );

  const panel =
    mounted &&
    panelReady &&
    createPortal(
      <div
        ref={panelRef}
        id={listId}
        role="listbox"
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        style={{
          top: coords.top,
          left: coords.left,
          width: coords.width,
          maxHeight: coords.maxHeight,
        }}
        className="fixed z-[200] flex flex-col overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary-dark)_12%,transparent)] origin-top animate-[selectPanelIn_280ms_ease-out]"
      >
        {searchable && (
          <div className="shrink-0 border-b border-[#fff7ee] bg-white px-2 py-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--admin-muted)]" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                placeholder={searchPlaceholder}
                className="h-8 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] pl-8 pr-3 text-[12px] text-[var(--brand-primary-dark)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>
        )}
        <div className="relative shrink-0" style={{ height: listMaxH }}>
          <ul
            ref={listRef}
            onScroll={updateScrollMetrics}
            className="h-full overflow-y-auto overscroll-contain py-1 pr-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {showClearOption && (
              <li
                role="option"
                aria-selected={false}
                className="cursor-pointer px-3 py-2 text-[13px] text-[var(--admin-muted)] hover:bg-[var(--admin-surface)]"
                onClick={() => pick('')}
              >
                {placeholder}
              </li>
            )}
            {options.length === 0 ? (
              <li className="px-3 py-2 text-[13px] text-[var(--admin-muted)]">
                {emptyMessage}
              </li>
            ) : filtered.length === 0 ? (
              <li className="px-3 py-2 text-[13px] text-[var(--admin-muted)]">No matches</li>
            ) : (
              filtered.map((opt, index) => {
                const isSelected = opt.value === value;
                const delayMs = Math.min(index, 8) * 35;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    style={{
                      animation: `selectItemIn 220ms ease-out ${delayMs}ms both`,
                    }}
                    className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-[13px] ${
                      opt.disabled
                        ? 'cursor-not-allowed text-[var(--admin-border)]'
                        : isSelected
                          ? 'bg-[var(--brand-primary-soft)] font-semibold text-[var(--brand-primary)]'
                          : 'text-[var(--brand-primary-dark)] hover:bg-[var(--admin-surface)]'
                    }`}
                    onClick={() => {
                      if (!opt.disabled) pick(opt.value);
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      {opt.meta ? (
                        <span
                          className={`max-w-[9rem] truncate text-[11px] font-medium ${
                            isSelected
                              ? 'text-[var(--brand-primary)]/80'
                              : 'text-[var(--admin-muted)]'
                          }`}
                        >
                          {opt.meta}
                        </span>
                      ) : null}
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      ) : null}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
          {/* Custom scrollbar — always painted (Windows hides native overlay bars). */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-1 right-1 top-1 w-1.5 rounded-full bg-[var(--brand-primary-soft)]"
          >
            <div
              className="absolute left-0 right-0 rounded-full bg-[var(--brand-primary)]"
              style={{
                top: scrollMetrics.canScroll ? scrollMetrics.thumbTop : 0,
                height: scrollMetrics.canScroll
                  ? scrollMetrics.thumbHeight
                  : '100%',
                opacity: scrollMetrics.canScroll ? 1 : 0.45,
              }}
            />
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value}
          required={required && !value}
        />
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-busy={loading || undefined}
        onClick={toggleOpen}
        onMouseEnter={openOnHover}
        onMouseLeave={scheduleClose}
        className={`relative z-0 w-full appearance-none rounded-xl text-left font-medium transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${variantClasses[variant]} ${triggerClassName}`}
      >
        <span
          className={`block truncate ${
            selected && !loading ? '' : 'text-[var(--admin-muted)]'
          }`}
        >
          {displayLabel}
        </span>
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {panel}
    </div>
  );
}
