'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  AlertTriangle,
  Search,
  Package,
  FileText,
  TrendingUp,
  TrendingDown,
  Warehouse,
  Loader2,
  ClipboardList,
} from 'lucide-react';
import LowStockPanel from '@/components/inventory/LowStockPanel';
import { Select } from '@/components/ui/Select';
import {
  useInventoryBalancesQuery,
  useStockMovementsQuery,
} from '@/hooks/inventory';
import { extractListItems, formatDate } from '@/utils/helpers';
import {
  InventoryBalance,
  InventoryBalanceItemType,
  StockMovementRow,
} from '@/types/inventory.types';
import { createPoHref } from '@/utils/inventory-po-links';

const TYPE_LABELS: Record<InventoryBalanceItemType, string> = {
  raw_material: 'Raw Material',
  product_variant: 'Product (Direct Stock)',
  inventory_item: 'Inventory Item',
};

function isInbound(movementType: string) {
  const t = (movementType || '').toLowerCase();
  return (
    t.includes('in') ||
    t.includes('receive') ||
    t.includes('purchase') ||
    t.includes('adjust_in') ||
    t === 'opening'
  );
}

function formatQty(n: number) {
  if (!Number.isFinite(n)) return '0';
  const rounded = Math.round(n * 1000) / 1000;
  return Number.isInteger(rounded)
    ? String(rounded)
    : String(parseFloat(rounded.toFixed(3)));
}

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all');
  const [movementDirFilter, setMovementDirFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'transactions' | 'alerts'
  >('overview');

  const balancesQuery = useInventoryBalancesQuery({
    page: 1,
    limit: 200,
    search: searchQuery || undefined,
    item_type: itemTypeFilter === 'all' ? undefined : itemTypeFilter,
  });

  const movementsQuery = useStockMovementsQuery(
    {
      page: 1,
      limit: 100,
      item_type: itemTypeFilter === 'all' ? undefined : itemTypeFilter,
    },
    activeTab === 'transactions' || activeTab === 'overview'
  );

  const inventory = extractListItems<InventoryBalance>(balancesQuery.data);
  const movements = extractListItems<StockMovementRow>(movementsQuery.data);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.item_type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [inventory, searchQuery, statusFilter]);

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        !searchQuery ||
        (m.item_name || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (m.reference_id || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const inbound = isInbound(m.movement_type);
      const matchesDir =
        movementDirFilter === 'all' ||
        (movementDirFilter === 'in' && inbound) ||
        (movementDirFilter === 'out' && !inbound);
      return matchesSearch && matchesDir;
    });
  }, [movements, searchQuery, movementDirFilter]);

  const lowStockItems = inventory.filter(
    (item) =>
      item.status === 'low' ||
      item.status === 'critical' ||
      item.status === 'out'
  );
  const criticalItems = inventory.filter(
    (item) => item.status === 'critical' || item.status === 'out'
  );

  const totalStockUnits = inventory.reduce(
    (sum, item) => sum + Number(item.stock_quantity || 0),
    0
  );
  const stockInCount = movements
    .filter((t) => isInbound(t.movement_type))
    .reduce((sum, t) => sum + Math.abs(Number(t.qty || 0)), 0);
  const stockOutCount = movements
    .filter((t) => !isInbound(t.movement_type))
    .reduce((sum, t) => sum + Math.abs(Number(t.qty || 0)), 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]';
      case 'low':
        return 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]';
      case 'critical':
        return 'bg-[color-mix(in_srgb,var(--brand-primary)_22%,white)] text-[var(--brand-primary-dark)]';
      case 'out':
        return 'bg-[color-mix(in_srgb,var(--brand-primary-dark)_10%,white)] text-[var(--brand-primary-dark)]';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'Optimal';
      case 'low':
        return 'Low Stock';
      case 'critical':
        return 'Critical';
      case 'out':
        return 'Out of Stock';
      default:
        return status;
    }
  };

  const loading = balancesQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Stock Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live balances and movements for raw materials, direct-stock
            products, and inventory items.
          </p>
        </div>
        <Link
          href="/suppliers?createPo=1"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95"
        >
          <ClipboardList className="h-4 w-4" />
          Create purchase order
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <Boxes className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Items</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {inventory.length}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <Warehouse className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">
            Total Stock Units
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {formatQty(totalStockUnits)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">
            Low Stock Alerts
          </div>
          <div className="mt-1 text-2xl font-bold text-[var(--brand-primary-dark)]">
            {lowStockItems.length}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">
            Recent Stock In
          </div>
          <div className="mt-1 text-2xl font-bold text-[var(--brand-primary)]">
            {formatQty(stockInCount)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">
            Recent Stock Out
          </div>
          <div className="mt-1 text-2xl font-bold text-[var(--brand-chart-secondary)]">
            {formatQty(stockOutCount)}
          </div>
        </div>
      </div>

      {criticalItems.length > 0 && (
        <div className="rounded-2xl border border-[var(--brand-primary-soft)] bg-[var(--brand-primary-soft)] p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--brand-primary)_22%,white)] text-[var(--brand-primary)]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[var(--brand-primary-dark)]">
                Critical Stock Alert
              </h3>
              <p className="text-xs text-[var(--brand-primary-dark)]/80">
                {criticalItems.length} item(s) are critically low or out of
                stock.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className="rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-sm font-bold text-white transition hover:brightness-95"
            >
              View Alerts
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {[
          { id: 'overview' as const, label: 'Inventory Overview', icon: Package },
          {
            id: 'transactions' as const,
            label: 'Stock Movements',
            icon: FileText,
          },
          {
            id: 'alerts' as const,
            label: 'Low Stock Alerts',
            icon: AlertTriangle,
          },
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition
                ${
                  activeTab === tab.id
                    ? 'bg-[var(--brand-primary)] text-white shadow-md shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or type..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
          />
        </div>
        <Select
          value={itemTypeFilter}
          onChange={setItemTypeFilter}
          size="lg"
          allowEmpty={false}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'raw_material', label: 'Raw Material' },
            { value: 'product_variant', label: 'Product (Direct Stock)' },
            { value: 'inventory_item', label: 'Inventory Item' },
          ]}
        />
        {activeTab === 'overview' && (
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            size="lg"
            allowEmpty={false}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'optimal', label: 'Optimal' },
              { value: 'low', label: 'Low Stock' },
              { value: 'critical', label: 'Critical' },
              { value: 'out', label: 'Out of Stock' },
            ]}
          />
        )}
        {activeTab === 'transactions' && (
          <Select
            value={movementDirFilter}
            onChange={setMovementDirFilter}
            size="lg"
            allowEmpty={false}
            options={[
              { value: 'all', label: 'All Movements' },
              { value: 'in', label: 'Stock In' },
              { value: 'out', label: 'Stock Out' },
            ]}
          />
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : activeTab === 'overview' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Item</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">On Hand</th>
                <th className="px-5 py-4">Min Level</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No inventory balances found.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr
                    key={`${item.item_type}-${item.id}`}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-sm font-bold text-[var(--brand-icon)]">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.unit || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {TYPE_LABELS[item.item_type] || item.item_type}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {formatQty(Number(item.stock_quantity || 0))}
                      {item.unit ? (
                        <span className="ml-1 text-xs font-medium text-slate-500">
                          {item.unit}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.min_stock_level}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${getStatusStyle(item.status)}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={createPoHref({
                          lineType: item.item_type,
                          ids: [item.id],
                        })}
                        className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
                      >
                        Create PO
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'transactions' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Item</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Movement</th>
                <th className="px-5 py-4">Qty</th>
                <th className="px-5 py-4">Balance After</th>
                <th className="px-5 py-4">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {movementsQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No stock movements yet.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const inbound = isInbound(m.movement_type);
                  return (
                    <tr key={m.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(m.created_at)}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {m.item_name || m.item_id}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {TYPE_LABELS[m.item_type as InventoryBalanceItemType] ||
                          m.item_type}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            inbound
                              ? 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]'
                              : 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]'
                          }`}
                        >
                          {m.movement_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {inbound ? '+' : '-'}
                        {Math.abs(Number(m.qty || 0))}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {m.balance_after ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {m.reference_type
                          ? `${m.reference_type}${m.reference_id ? ` · ${m.reference_id.slice(0, 8)}` : ''}`
                          : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <LowStockPanel items={lowStockItems} />
      )}
    </div>
  );
}
