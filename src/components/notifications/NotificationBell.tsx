'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Bell,
  ClipboardList,
  FileText,
  Package,
} from 'lucide-react';
import { useDashboardQuery } from '@/hooks/dashboard';
import { useOpenInvoicesSummaryQuery } from '@/hooks/tenant-billing';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import { defaultLastDaysRange } from '@/components/ui/DateRangePicker';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const canDashboard = usePermission(ENTITY_PERMS.dashboard.overview);
  const canBilling = usePermission(ENTITY_PERMS.tenant_billing.list);

  const { data } = useDashboardQuery(defaultLastDaysRange(30), {
    poll: canDashboard,
  });
  const overview = data?.data;
  const lowStockItems = overview?.low_stock_items || [];
  const lowStockCount = overview?.low_stock_count ?? lowStockItems.length;

  const billingSummary = useOpenInvoicesSummaryQuery(canBilling);
  const billingData = billingSummary.data?.data;
  const billingInvoices = billingData?.invoices || [];
  const billingCount = billingData?.count ?? billingInvoices.length;

  const count = lowStockCount + billingCount;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!canDashboard && !canBilling) {
    return (
      <button
        type="button"
        disabled
        className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-[var(--admin-border)] bg-white text-[var(--admin-muted)] shadow-sm"
        title="No notification access"
      >
        <Bell className="h-4 w-4" />
      </button>
    );
  }

  const materialsParam = lowStockItems.map((i) => i.id).filter(Boolean).join(',');

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-11 w-11 items-center justify-center rounded-[18px] border border-[var(--admin-border)] bg-white text-[var(--brand-primary-dark)] shadow-sm transition hover:bg-[var(--brand-primary-soft)]"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-primary)] px-1 text-[10px] font-bold text-white ring-2 ring-[var(--admin-surface)]">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-white shadow-xl shadow-[color-mix(in_srgb,var(--brand-primary-dark)_10%,transparent)]">
          <div className="border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-[var(--brand-primary-dark)]">
                  Notifications
                </div>
                <div className="text-xs text-[var(--admin-muted)]">
                  {count > 0
                    ? `${count} item${count === 1 ? '' : 's'} need attention`
                    : 'You are all caught up'}
                </div>
              </div>
              {count > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                  <AlertTriangle className="h-3 w-3" />
                  Action needed
                </span>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {count === 0 ? (
              <div className="px-4 py-10 text-center">
                <Package className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">
                  No alerts right now
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {billingInvoices.map((inv: any) => (
                  <li key={inv.id}>
                    <Link
                      href="/billing"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 transition hover:bg-amber-50/70"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-slate-800">
                            Invoice {inv.invoice_number}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {inv.currency} {Number(inv.total).toFixed(2)} ·{' '}
                            <span className="uppercase font-semibold">
                              {inv.status}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] font-semibold text-amber-700">
                            Pay / upload proof →
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
                {lowStockItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/suppliers?createPo=1&materials=${item.id}`}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 transition hover:bg-amber-50/70"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-slate-800">
                            {item.name}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            On hand{' '}
                            <span className="font-semibold text-amber-800">
                              {item.stock_quantity}
                              {item.unit ? ` ${item.unit}` : ''}
                            </span>
                            {' · '}
                            Min{' '}
                            <span className="font-semibold text-slate-700">
                              {item.min_stock_level}
                              {item.unit ? ` ${item.unit}` : ''}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] font-semibold text-amber-700">
                            Create purchase order →
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2 border-t border-[var(--admin-border)] bg-[var(--admin-bg)] p-3">
            {canBilling && (
              <Link
                href="/billing"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-[var(--admin-border)] bg-white px-3 py-2 text-center text-xs font-semibold text-[var(--brand-primary-dark)] hover:bg-[var(--brand-primary-soft)]"
              >
                Billing
              </Link>
            )}
            {canDashboard && (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-[var(--admin-border)] bg-white px-3 py-2 text-center text-xs font-semibold text-[var(--brand-primary-dark)] hover:bg-[var(--brand-primary-soft)]"
              >
                Dashboard
              </Link>
            )}
            {lowStockItems.length > 0 && (
              <Link
                href={`/suppliers?createPo=1&materials=${materialsParam}`}
                onClick={() => setOpen(false)}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-[var(--brand-primary)] px-3 py-2 text-xs font-semibold text-white hover:brightness-95"
              >
                <ClipboardList className="h-3.5 w-3.5" />
                Create PO
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
