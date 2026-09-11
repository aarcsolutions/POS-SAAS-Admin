'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChefHat, Clock, Loader2, CheckCircle2, Play } from 'lucide-react';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import { useKdsMarkReadyMutation, useKdsQueueQuery } from '@/hooks/kds';
import { KdsTicket } from '@/services/kds';

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function TicketCard({
  ticket,
  canMarkReady,
  onStart,
  onReady,
  busyId,
}: {
  ticket: KdsTicket;
  canMarkReady: boolean;
  onStart: (id: string) => void;
  onReady: (id: string) => void;
  busyId: string | null;
}) {
  const now = useNow();
  const anchor =
    ticket.status === 'in_kitchen'
      ? ticket.updated_at || ticket.created_at
      : ticket.created_at;
  const elapsed = now - new Date(anchor).getTime();
  const isBusy = busyId === ticket.id;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-slate-900">
            {ticket.order_number}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {ticket.order_type?.replace('_', '-')}
            {ticket.table_name ? ` · ${ticket.table_name}` : ''}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            ticket.status === 'in_kitchen'
              ? 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]'
              : 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary-dark)]'
          }`}
        >
          {ticket.status === 'in_kitchen' ? 'Cooking' : 'Confirmed'}
        </span>
      </div>

      <p className="mb-2 text-sm font-medium text-slate-700">
        {ticket.customer?.name || 'Walk-in'}
        {ticket.customer?.phone ? ` · ${ticket.customer.phone}` : ''}
      </p>

      {ticket.order_type === 'delivery' && ticket.delivery_address && (
        <p className="mb-3 text-xs text-slate-500">
          {ticket.delivery_address}
          {ticket.delivery_city ? `, ${ticket.delivery_city}` : ''}
        </p>
      )}

      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Clock className="h-4 w-4 text-[var(--brand-icon)]" />
        {formatElapsed(elapsed)}
      </div>

      <ul className="mb-4 flex-1 space-y-2 border-t border-slate-100 pt-3">
        {(ticket.items || []).map((item) => (
          <li
            key={item.id || `${item.product_id}-${item.variant_id}`}
            className="flex justify-between gap-2 text-sm"
          >
            <span className="text-slate-700">
              {item.product?.title || item.product?.name || 'Item'}
              {item.variant?.name ? ` (${item.variant.name})` : ''}
            </span>
            <span className="font-bold text-slate-900">×{item.quantity}</span>
          </li>
        ))}
      </ul>

      {canMarkReady && ticket.status === 'accepted' && (
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onStart(ticket.id)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {isBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Start
        </button>
      )}

      {canMarkReady && ticket.status === 'in_kitchen' && (
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onReady(ticket.id)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {isBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          MARK READY
        </button>
      )}
    </div>
  );
}

function KdsPageInner() {
  const canView = usePermission(ENTITY_PERMS.kds.list);
  const canMarkReady = usePermission(ENTITY_PERMS.kds.extras.markReady);
  const queueQuery = useKdsQueueQuery();
  const markMutation = useKdsMarkReadyMutation();
  const [busyId, setBusyId] = useState<string | null>(null);

  const tickets: KdsTicket[] = useMemo(() => {
    const payload = queueQuery.data?.data as any;
    return payload?.data ?? payload ?? [];
  }, [queueQuery.data]);

  const accepted = tickets.filter((t) => t.status === 'accepted');
  const cooking = tickets.filter((t) => t.status === 'in_kitchen');

  const runAction = async (id: string, action: 'start' | 'ready') => {
    setBusyId(id);
    try {
      await markMutation.mutateAsync({ id, action });
    } finally {
      setBusyId(null);
    }
  };

  if (!canView) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        You do not have permission to view the kitchen display.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--brand-primary-soft)] p-3 text-[var(--brand-icon)]">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kitchen Display</h1>
            <p className="text-sm text-slate-500">
              Confirmed and cooking orders · auto-refresh
            </p>
          </div>
        </div>
        {queueQuery.isFetching && (
          <Loader2 className="h-5 w-5 animate-spin text-[var(--brand-icon)]" />
        )}
      </div>

      {queueQuery.isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-icon)]" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-400">
          No orders in the kitchen queue
        </div>
      ) : (
        <div className="space-y-8">
          {accepted.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--brand-primary)]">
                Confirmed ({accepted.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {accepted.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    canMarkReady={canMarkReady}
                    busyId={busyId}
                    onStart={(id) => void runAction(id, 'start')}
                    onReady={(id) => void runAction(id, 'ready')}
                  />
                ))}
              </div>
            </section>
          )}

          {cooking.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--brand-icon)]">
                Cooking ({cooking.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cooking.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    canMarkReady={canMarkReady}
                    busyId={busyId}
                    onStart={(id) => void runAction(id, 'start')}
                    onReady={(id) => void runAction(id, 'ready')}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function KdsPage() {
  return <KdsPageInner />;
}
