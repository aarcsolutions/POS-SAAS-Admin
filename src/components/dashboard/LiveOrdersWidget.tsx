'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { DashboardLiveOrder } from '@/types/dashboard.types';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-sky-100 text-sky-700',
  in_kitchen: 'bg-orange-100 text-orange-700',
  ready: 'bg-emerald-100 text-emerald-700',
  out_for_delivery: 'bg-violet-100 text-violet-700',
};

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

interface Props {
  orders: DashboardLiveOrder[];
}

export default function LiveOrdersWidget({ orders }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Live Orders</h2>
            <p className="text-sm text-slate-500">In-flight orders right now</p>
          </div>
        </div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          No active orders at the moment.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-800">
                    #{order.order_number || order.id.slice(0, 8)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyles[order.status] || 'bg-slate-100 text-slate-600'}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>
                <div className="mt-1 truncate text-xs text-slate-500">
                  {order.customer_name} · {order.order_type.replace(/_/g, ' ')}
                  {order.branch_name ? ` · ${order.branch_name}` : ''}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">
                  {order.final_total_formatted}
                </div>
                <div className="text-[11px] text-slate-400">
                  {formatTime(order.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
