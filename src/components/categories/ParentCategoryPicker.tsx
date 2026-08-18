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
  onChange: (parentId: string | null) => void;
  categories: Category[];
  loading?: boolean;
  /** Hide these IDs from the picker (self + descendants on edit). */
  excludeIds?: Set<string>;
  disabled?: boolean;
}

type LoadedMap = Record<string, Category[]>;

const ROOT_KEY = 'root';

function buildChildrenMap(
  categories: Category[],
  excludeIds?: Set<string>
): LoadedMap {
  const map: LoadedMap = { [ROOT_KEY]: [] };

  for (const cat of categories) {
    if (!cat.is_active || excludeIds?.has(cat.id)) continue;
    const key = cat.parent_id ?? ROOT_KEY;
    if (!map[key]) map[key] = [];
    map[key].push(cat);
  }

  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => a.name.localeCompare(b.name));
  }

  return map;
}

export default function ParentCategoryPicker({
  value,
  onChange,
  categories,
  loading = false,
  excludeIds,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const childrenMap = useMemo(
    () => buildChildrenMap(categories, excludeIds),
    [categories, excludeIds]
  );

  const selectedLabel = useMemo(() => {
    if (!value) return 'None (top-level)';
    return categories.find((c) => c.id === value)?.name ?? 'Selected category';
  }, [value, categories]);

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

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const startLongPress = (id: string) => {
    clearLongPress();
    longPressTimer.current = setTimeout(() => {
      toggleExpand(id);
    }, 450);
  };

  const selectParent = (parentId: string | null, label: string) => {
    onChange(parentId);
    setOpen(false);
  };

  const renderNodes = (parentKey: string, depth: number): ReactNode => {
    const items = childrenMap[parentKey] || [];

    return items.map((cat) => {
      const isExpanded = expanded.has(cat.id);
      const isSelected = value === cat.id;
      const childKey = cat.id;
      const childCount = childrenMap[childKey]?.length ?? 0;

      return (
        <div key={cat.id}>
          <div
            className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm ${
              isSelected
                ? 'bg-emerald-50 text-emerald-800'
                : 'hover:bg-slate-50 text-slate-700'
            }`}
            style={{ paddingLeft: 8 + depth * 16 }}
            onTouchStart={() => startLongPress(cat.id)}
            onTouchEnd={clearLongPress}
            onTouchMove={clearLongPress}
            onContextMenu={(e) => e.preventDefault()}
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => toggleExpand(cat.id)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
              onClick={() => selectParent(cat.id, cat.name)}
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
          {isExpanded && renderNodes(childKey, depth + 1)}
        </div>
      );
    });
  };

  const rootCount = childrenMap[ROOT_KEY]?.length ?? 0;

  return (
    <div ref={containerRef} className="relative space-y-2">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 text-left text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${
          disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-white'
        }`}
      >
        <span className="truncate font-medium text-slate-800">
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
          <button
            type="button"
            onClick={() => selectParent(null, 'None (top-level)')}
            className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold ${
              value === null
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            None (top-level)
          </button>

          {renderNodes(ROOT_KEY, 0)}

          {!loading && rootCount === 0 && (
            <p className="px-3 py-2 text-xs text-slate-400">
              No parent categories yet — this will be top-level.
            </p>
          )}
        </div>
      )}

      <p className="text-[11px] text-slate-400">
        Click to open. Expand subcategories with the arrow; on mobile,
        press-and-hold to expand.
      </p>
    </div>
  );
}
