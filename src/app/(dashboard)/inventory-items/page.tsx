'use client';

import { useEffect, useState } from 'react';
import { ClipboardCheck, Plus, Search } from 'lucide-react';
import InventoryItemTable from '@/components/inventory-items/InventoryItemTable';
import InventoryItemForm from '@/components/inventory-items/InventoryItemForm';
import DayEndClosingPanel from '@/components/inventory-items/DayEndClosingPanel';
import ListPager from '@/components/ui/ListPager';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useInventoryItemsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useDayEndClosingMutation,
} from '@/hooks/inventory-items';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { InventoryItem } from '@/types/inventory-item.types';
import { confirmDialog } from '@/store/dialogStore';

const LIMIT = 10;
const DAY_END_LIMIT = 100;

export default function InventoryItemsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [dayEndMode, setDayEndMode] = useState(false);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const canCreate = usePermission(ENTITY_PERMS.inventory_items.create);
  const canUpdate = usePermission(ENTITY_PERMS.inventory_items.update);
  const canDelete = usePermission(ENTITY_PERMS.inventory_items.delete);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useInventoryItemsQuery(
    {
      page,
      limit: LIMIT,
      search: debouncedSearch || undefined,
    },
    !dayEndMode
  );

  const {
    data: dayEndData,
    isLoading: dayEndLoading,
    isFetching: dayEndFetching,
  } = useInventoryItemsQuery(
    {
      page: 1,
      limit: DAY_END_LIMIT,
    },
    dayEndMode
  );

  const createMutation = useCreateInventoryItemMutation();
  const updateMutation = useUpdateInventoryItemMutation();
  const deleteMutation = useDeleteInventoryItemMutation();
  const dayEndMutation = useDayEndClosingMutation();

  const items = extractListItems<InventoryItem>(data);
  const pagination = extractPagination(data, LIMIT);
  const dayEndItems = extractListItems<InventoryItem>(dayEndData);

  const handleOpen = (
    mode: 'create' | 'edit' | 'view',
    item?: InventoryItem
  ) => {
    setFormMode(mode);
    setSelected(item || null);
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);
    const ok = await confirmDialog({
      title: 'Delete Inventory Item',
      message: 'Delete this inventory item? This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  if (dayEndMode && canUpdate) {
    return (
      <DayEndClosingPanel
        items={dayEndItems}
        loading={dayEndLoading || dayEndFetching}
        saving={dayEndMutation.isPending}
        onClose={() => setDayEndMode(false)}
        onSubmit={async (rows) => {
          const res = await dayEndMutation.mutateAsync(rows);
          if (res?.status) setDayEndMode(false);
        }}
      />
    );
  }

  if (formMode) {
    return (
      <InventoryItemForm
        mode={formMode}
        initial={selected}
        saving={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormMode(null)}
        onSubmit={async (payload) => {
          if (formMode === 'create') {
            await createMutation.mutateAsync(payload);
          } else if (formMode === 'edit' && selected) {
            await updateMutation.mutateAsync({
              id: selected.id,
              ...payload,
            });
          }
          setFormMode(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Items</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage operational supplies that are not sold as menu products.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inventory items..."
              className="h-11 w-[280px] rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
            />
          </div>
          {canUpdate && (
            <button
              type="button"
              onClick={() => {
                setFormMode(null);
                setDayEndMode(true);
              }}
              className="flex items-center gap-2 rounded-xl border border-[var(--brand-primary-soft)] bg-[var(--brand-primary-soft)] px-4 py-2.5 text-sm font-bold text-[var(--brand-primary)] transition hover:brightness-95"
            >
              <ClipboardCheck className="h-4 w-4" /> Day End Closing
            </button>
          )}
          {canCreate && (
            <button
              type="button"
              onClick={() => handleOpen('create')}
              className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95"
            >
              <Plus className="h-4 w-4" /> Add Inventory Item
            </button>
          )}
        </div>
      </div>

      <InventoryItemTable
        items={items}
        loading={isLoading || isFetching}
        canUpdate={canUpdate}
        canDelete={canDelete}
        dropdownOpen={dropdownOpen}
        onDropdownChange={setDropdownOpen}
        onView={(m) => handleOpen('view', m)}
        onEdit={(m) => handleOpen('edit', m)}
        onDelete={handleDelete}
      />

      <ListPager
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={LIMIT}
        onPageChange={setPage}
        label="inventory items"
        disabled={isLoading || isFetching}
      />
    </div>
  );
}
