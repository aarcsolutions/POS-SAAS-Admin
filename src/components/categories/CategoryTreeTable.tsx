'use client';

import {
  Eye,
  Loader2,
  Pencil,
  SearchX,
  Trash2,
} from 'lucide-react';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import type { VisibleTreeRow } from '@/utils/categoryTree';

const BUTTON_PAD_X = 6;
const HALF_RADIO = 8;
const RADIO_CENTER_X = BUTTON_PAD_X + HALF_RADIO;
const BRANCH_WIDTH = 32;

function radioCenterX(depth: number) {
  return RADIO_CENTER_X + depth * (RADIO_CENTER_X + BRANCH_WIDTH);
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface CategoryTreeTableProps {
  rows: VisibleTreeRow[];
  loading: boolean;
  expanded: Set<string>;
  parentNameById: Map<string, string>;
  isTenantAdmin: boolean;
  dropdownOpen: string | null;
  canUpdate: boolean;
  canDelete: boolean;
  onToggleExpand: (id: string) => void;
  onView: (row: VisibleTreeRow) => void;
  onEdit: (row: VisibleTreeRow) => void;
  onDelete: (id: string) => void;
  onDropdownOpenChange: (id: string | null) => void;
}

export default function CategoryTreeTable({
  rows,
  loading,
  expanded,
  parentNameById,
  isTenantAdmin,
  dropdownOpen,
  canUpdate,
  canDelete,
  onToggleExpand,
  onView,
  onEdit,
  onDelete,
  onDropdownOpenChange,
}: CategoryTreeTableProps) {
  const colSpan = isTenantAdmin ? 8 : 7;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-wider text-slate-600">
            <tr>
              <th className="px-5 py-3 font-bold">Category</th>
              <th className="px-5 py-3 font-bold">Description</th>
              <th className="px-5 py-3 font-bold">Parent</th>
              {isTenantAdmin ? (
                <th className="px-5 py-3 font-bold">Branch</th>
              ) : null}
              <th className="px-5 py-3 font-bold">Image</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold">Created</th>
              <th className="px-5 py-3 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading categories…
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100">
                      <SearchX className="h-5 w-5 text-slate-400" />
                    </span>
                    <div className="text-sm font-semibold text-slate-800">
                      Category not found
                    </div>
                    <div className="text-xs text-slate-500">
                      Try a different search term.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const isLast = idx === rows.length - 1;
                const hasChildren = row.children.length > 0;
                const isExpanded = expanded.has(row.id);
                const treePadLeft =
                  row.depth > 0 ? radioCenterX(row.depth) - RADIO_CENTER_X : 0;
                const parentRailX =
                  row.depth > 0 ? radioCenterX(row.depth - 1) : 0;

                return (
                  <tr key={row.id} className="border-b border-slate-100 bg-white hover:bg-slate-50/60">
                    <td className="relative overflow-visible px-5 py-3">
                      {row.depth > 0 ? (
                        <div
                          className="pointer-events-none absolute inset-y-0 left-5 right-0"
                          aria-hidden
                        >
                          {row.ancestorIsLast.map((ancLast, level) =>
                            !ancLast ? (
                              <span
                                key={`rail-${level}`}
                                className="absolute inset-y-0 w-0.5 bg-slate-300"
                                style={{ left: radioCenterX(level) - 1 }}
                              />
                            ) : null,
                          )}
                          <span
                            className="absolute w-0.5 bg-slate-300"
                            style={{
                              left: parentRailX - 1,
                              top: 0,
                              height: row.isLastSibling ? '50%' : '100%',
                            }}
                          />
                          <span
                            className="absolute h-0.5 bg-slate-300"
                            style={{
                              left: parentRailX - 1,
                              top: '50%',
                              width: BRANCH_WIDTH + BUTTON_PAD_X + 1,
                              transform: 'translateY(-50%)',
                            }}
                          />
                        </div>
                      ) : null}

                      <div
                        className="relative flex min-h-[40px] items-center"
                        style={{ paddingLeft: treePadLeft }}
                      >
                        <button
                          type="button"
                          onClick={() => hasChildren && onToggleExpand(row.id)}
                          className="relative flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1.5 text-left text-sm transition-colors hover:bg-slate-100"
                        >
                          <span
                            className={cn(
                              'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 bg-white',
                              isExpanded
                                ? 'border-slate-500'
                                : 'border-slate-300',
                            )}
                            aria-hidden
                          >
                            {isExpanded ? (
                              <span className="h-2 w-2 rounded-full bg-slate-500" />
                            ) : null}
                          </span>
                          <div className="min-w-0">
                            <div
                              className={cn(
                                'truncate leading-snug text-slate-900',
                                isExpanded ? 'font-semibold' : 'font-medium',
                              )}
                            >
                              {row.name}
                            </div>
                            {hasChildren ? (
                              <div className="text-xs text-slate-500">
                                {row.children.length} subcategor
                                {row.children.length === 1 ? 'y' : 'ies'}
                              </div>
                            ) : null}
                          </div>
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      <div className="max-w-[220px] truncate">
                        {row.description || '—'}
                      </div>
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {row.parent_id ? (
                        parentNameById.get(row.parent_id) ?? '—'
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          Main
                        </span>
                      )}
                    </td>

                    {isTenantAdmin ? (
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                            row.branch_id
                              ? 'bg-sky-50 text-sky-700'
                              : 'bg-slate-100 text-slate-600',
                          )}
                        >
                          {row.branch_name ||
                            (row.branch_id ? 'Branch' : 'Tenant')}
                        </span>
                      </td>
                    ) : null}

                    <td className="px-5 py-3">
                      {row.image_url ? (
                        <img
                          src={row.image_url}
                          alt={row.name}
                          className="h-10 w-10 rounded-md border border-slate-200 object-cover"
                        />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-bold',
                          row.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-xs text-slate-500">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleDateString()
                        : '—'}
                    </td>

                    <td className={cn('px-5 py-3 text-right', isLast && '')}>
                      <RowActionsMenu
                        open={dropdownOpen === row.id}
                        onOpenChange={(open) =>
                          onDropdownOpenChange(open ? row.id : null)
                        }
                      >
                        <button
                          type="button"
                          onClick={() => onView(row)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" /> View
                        </button>
                        {canUpdate ? (
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => onDelete(row.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        ) : null}
                      </RowActionsMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
