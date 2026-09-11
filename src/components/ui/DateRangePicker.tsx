'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

export type DateRangeValue = {
  from: string;
  to: string;
};

type Props = {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  className?: string;
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function inRange(day: Date, from: Date | null, to: Date | null): boolean {
  if (!from || !to) return false;
  const t = day.getTime();
  return t >= from.getTime() && t <= to.getTime();
}

function formatLabel(iso: string): string {
  return parseIso(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildMonthCells(month: Date): Array<Date | null> {
  const first = startOfMonth(month);
  const startPad = first.getDay();
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function defaultLastDaysRange(days = 30): DateRangeValue {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (days - 1));
  return { from: toIso(from), to: toIso(to) };
}

export default function DateRangePicker({
  value,
  onChange,
  className = '',
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() =>
    startOfMonth(parseIso(value.to))
  );
  const [draftFrom, setDraftFrom] = useState<string | null>(value.from);
  const [draftTo, setDraftTo] = useState<string | null>(value.to);

  useEffect(() => {
    if (!open) return;
    setDraftFrom(value.from);
    setDraftTo(value.to);
    setMonthCursor(startOfMonth(parseIso(value.to)));
  }, [open, value.from, value.to]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const months = useMemo(
    () => [monthCursor, addMonths(monthCursor, 1)],
    [monthCursor]
  );

  const draftFromDate = draftFrom ? parseIso(draftFrom) : null;
  const draftToDate = draftTo ? parseIso(draftTo) : null;

  const pickDay = (day: Date) => {
    const iso = toIso(day);
    if (!draftFrom || (draftFrom && draftTo)) {
      setDraftFrom(iso);
      setDraftTo(null);
      return;
    }
    // Same day again = single-day range
    if (iso === draftFrom) {
      setDraftTo(iso);
      return;
    }
    if (iso < draftFrom) {
      setDraftTo(draftFrom);
      setDraftFrom(iso);
      return;
    }
    setDraftTo(iso);
  };

  const applyRange = () => {
    if (!draftFrom) return;
    const to = draftTo || draftFrom;
    onChange({ from: draftFrom, to });
    setOpen(false);
  };

  const renderMonth = (month: Date, key: string) => {
    const cells = buildMonthCells(month);
    const title = month.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });

    return (
      <div key={key} className="min-w-[240px] flex-1">
        <div className="mb-3 text-center text-sm font-bold text-[var(--brand-primary-dark)]">
          {title}
        </div>
        <div className="mb-1 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--admin-muted)]"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-9" />;
            }

            const iso = toIso(day);
            const isStart = draftFromDate ? sameDay(day, draftFromDate) : false;
            const isEnd = draftToDate ? sameDay(day, draftToDate) : false;
            const selected = isStart || isEnd;
            const between = inRange(day, draftFromDate, draftToDate) && !selected;
            const isToday = sameDay(day, new Date());

            return (
              <button
                key={iso}
                type="button"
                onClick={() => pickDay(day)}
                className={[
                  'relative h-9 rounded-lg text-sm font-semibold transition',
                  selected
                    ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                    : between
                      ? 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary-dark)]'
                      : 'text-[var(--brand-primary-dark)] hover:bg-[var(--brand-primary-soft)]',
                  isToday && !selected
                    ? 'ring-1 ring-[var(--brand-primary)]'
                    : '',
                ].join(' ')}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 min-w-[240px] items-center justify-between gap-3 rounded-xl border border-[var(--admin-border)] bg-white px-3 text-sm font-semibold text-[var(--brand-primary-dark)] transition hover:bg-[var(--brand-primary-soft)]"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[var(--brand-primary)]" />
          {value.from === value.to
            ? formatLabel(value.from)
            : `${formatLabel(value.from)} – ${formatLabel(value.to)}`}
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Select date range"
          className="absolute right-0 z-40 mt-2 w-[min(92vw,560px)] rounded-2xl border border-[var(--admin-border)] bg-white p-4 shadow-xl shadow-[color-mix(in_srgb,var(--brand-primary)_14%,transparent)]"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonthCursor((m) => addMonths(m, -1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--admin-border)] text-[var(--brand-primary-dark)] hover:bg-[var(--brand-primary-soft)]"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-xs font-semibold text-[var(--admin-muted)]">
              {draftFrom && draftTo
                ? draftFrom === draftTo
                  ? formatLabel(draftFrom)
                  : `${formatLabel(draftFrom)} – ${formatLabel(draftTo)}`
                : draftFrom
                  ? `${formatLabel(draftFrom)} · pick end or Apply for one day`
                  : 'Select a date'}
            </p>
            <button
              type="button"
              onClick={() => setMonthCursor((m) => addMonths(m, 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--admin-border)] text-[var(--brand-primary-dark)] hover:bg-[var(--brand-primary-soft)]"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            {months.map((month) =>
              renderMonth(
                month,
                `${month.getFullYear()}-${month.getMonth()}`
              )
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-[var(--admin-border)] pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-[var(--admin-border)] px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!draftFrom}
              onClick={applyRange}
              className="rounded-xl bg-[var(--brand-primary)] px-3 py-2 text-sm font-bold text-white hover:brightness-95 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
