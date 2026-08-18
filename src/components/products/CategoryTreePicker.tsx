'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
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

export default function CategoryTreePicker({
  value,
  onChange,
  categories,
  loading = false,
  disabled = false,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const childrenMap = useMemo(
    () => buildChildrenMap(categories),
    [categories]
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

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderNodes = (parentKey: string, depth: number): ReactNode => {
    const items = childrenMap[parentKey] || [];
    return items.map((cat) => {
      const isExpanded = expanded.has(cat.id);
      const isSelected = value === cat.id;
      const childCount = childrenMap[cat.id]?.length ?? 0;

      return (
        <div key={cat.id}>
          <div
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm ${
              isSelected
                ? 'bg-emerald-50 text-emerald-800'
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

  return (
    <div ref={containerRef} className="relative space-y-1">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-12 w-full items-center justify-between rounded-xl border bg-slate-50 px-4 text-left text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${
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
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {renderNodes(ROOT_KEY, 0)}
          {(childrenMap[ROOT_KEY]?.length ?? 0) === 0 && !loading && (
            <p className="px-3 py-2 text-xs text-slate-400">
              No categories yet. Create one under Categories first.
            </p>
          )}
        </div>
      )}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
