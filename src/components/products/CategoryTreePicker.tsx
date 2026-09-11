'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ChevronDown, ChevronRight, Loader2, Search } from 'lucide-react';
import { Category } from '@/types/category.types';

interface Props {
  value: string | null;
  onChange: (categoryId: string) => void;
  categories: Category[];
  loading?: boolean;
  disabled?: boolean;
  error?: string;
}

type LoadedMap = Record<string, Category[]>;
const ROOT_KEY = 'root';

function buildChildrenMap(categories: Category[]): LoadedMap {
  const map: LoadedMap = { [ROOT_KEY]: [] };
  for (const cat of categories) {
    if (!cat.is_active) continue;
    const key = cat.parent_id ?? ROOT_KEY;
    if (!map[key]) map[key] = [];
    map[key].push(cat);
  }
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

function findPathLabel(
  categories: Category[],
  id: string | null
): string {
  if (!id) return 'Select category...';
  const byId = new Map(categories.map((c) => [c.id, c]));
  const parts: string[] = [];
  let current = byId.get(id);
  const guard = new Set<string>();
  while (current && !guard.has(current.id)) {
    guard.add(current.id);
    parts.unshift(current.name);
    current = current.parent_id ? byId.get(current.parent_id) : undefined;
  }
  return parts.length ? parts.join(' / ') : 'Selected category';
}

/** Keep a node if it or any descendant matches the needle. */
function collectVisibleIds(
  childrenMap: LoadedMap,
  needle: string
): Set<string> | null {
  if (!needle) return null;
  const visible = new Set<string>();

  const walk = (parentKey: string): boolean => {
    const items = childrenMap[parentKey] || [];
    let any = false;
    for (const cat of items) {
      const selfMatch = cat.name.toLowerCase().includes(needle);
      const childMatch = walk(cat.id);
      if (selfMatch || childMatch) {
        visible.add(cat.id);
        any = true;
      }
    }
    return any;
  };

  walk(ROOT_KEY);
  return visible;
}

function collectExpandForVisible(
  categories: Category[],
  visible: Set<string>
): Set<string> {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const expand = new Set<string>();
  for (const id of visible) {
    let current = byId.get(id);
    const guard = new Set<string>();
    while (current?.parent_id && !guard.has(current.id)) {
      guard.add(current.id);
      expand.add(current.parent_id);
      current = byId.get(current.parent_id);
    }
  }
  return expand;
}

export default function CategoryTreePicker({
  value,
  onChange,
  categories,
  loading = false,
  disabled = false,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const childrenMap = useMemo(
    () => buildChildrenMap(categories),
    [categories]
  );

  const needle = query.trim().toLowerCase();
  const visibleIds = useMemo(
    () => collectVisibleIds(childrenMap, needle),
    [childrenMap, needle]
  );

  const selectedLabel = useMemo(
    () => findPathLabel(categories, value),
    [categories, value]
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    window.requestAnimationFrame(() => searchRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!visibleIds) return;
    setExpanded(collectExpandForVisible(categories, visibleIds));
  }, [visibleIds, categories]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderNodes = (parentKey: string, depth: number): ReactNode => {
    const items = (childrenMap[parentKey] || []).filter(
      (cat) => !visibleIds || visibleIds.has(cat.id)
    );
    return items.map((cat) => {
      const isExpanded = expanded.has(cat.id) || Boolean(needle);
      const isSelected = value === cat.id;
      const childCount = (childrenMap[cat.id] || []).filter(
        (c) => !visibleIds || visibleIds.has(c.id)
      ).length;

      return (
        <div key={cat.id}>
          <div
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm ${
              isSelected
                ? 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
            style={{ paddingLeft: 8 + depth * 16 }}
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => toggleExpand(cat.id)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange(cat.id);
                setOpen(false);
              }}
              className="flex-1 truncate text-left font-medium"
            >
              {cat.name}
              {childCount > 0 && (
                <span className="ml-1 text-xs font-normal text-slate-400">
                  ({childCount})
                </span>
              )}
            </button>
          </div>
          {isExpanded && renderNodes(cat.id, depth + 1)}
        </div>
      );
    });
  };

  const rootVisible = visibleIds
    ? (childrenMap[ROOT_KEY] || []).some((c) => visibleIds.has(c.id))
    : (childrenMap[ROOT_KEY]?.length ?? 0) > 0;

  return (
    <div ref={containerRef} className="relative space-y-1">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-12 w-full items-center justify-between rounded-xl border bg-slate-50 px-4 text-left text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] ${
          error ? 'border-rose-300' : 'border-slate-200'
        } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-white'}`}
      >
        <span
          className={`truncate font-medium ${
            value ? 'text-slate-800' : 'text-slate-400'
          }`}
        >
          {loading ? 'Loading categories...' : selectedLabel}
        </span>
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />
        ) : (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-2 py-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Search categories…"
                className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 text-[12px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto p-2">
            {rootVisible ? (
              renderNodes(ROOT_KEY, 0)
            ) : loading ? null : (
              <p className="px-3 py-2 text-xs text-slate-400">
                {needle
                  ? 'No matching categories'
                  : 'No categories yet. Create one under Categories first.'}
              </p>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
