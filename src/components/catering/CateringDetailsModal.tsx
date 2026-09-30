'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Users,
  X,
} from 'lucide-react';
import {
  CateringEvent,
  CateringSameDayEvent,
  STATUS_BADGE,
} from '@/types/catering.types';

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatMoney(value?: number | null) {
  if (value == null) return '—';
  return `$${Number(value).toFixed(2)}`;
}

interface Props {
  event: CateringEvent | null;
  loading?: boolean;
  quoting?: boolean;
  confirming?: boolean;
  declining?: boolean;
  completing?: boolean;
  canDecide?: boolean;
  onClose: () => void;
  onSendQuote: (amount: number) => void;
  onConfirm: () => void;
  onDecline: () => void;
  onMarkCompleted: () => void;
}

function SameDayRow({ e }: { e: CateringSameDayEvent }) {
  const badge = STATUS_BADGE[e.status] || STATUS_BADGE.inquiry;
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold text-slate-800">
          {e.event_name || e.contact_name}
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
      <div className="mt-1 text-xs text-slate-600">
        {formatDateTime(e.event_at)} · {e.party_size} guests ·{' '}
        {e.venue_type.replace('_', ' ')}
      </div>
    </div>
  );
}

export default function CateringDetailsModal({
  event,
  loading = false,
  quoting = false,
  confirming = false,
  declining = false,
  completing = false,
  canDecide = false,
  onClose,
  onSendQuote,
  onConfirm,
  onDecline,
  onMarkCompleted,
}: Props) {
  const busy = quoting || confirming || declining || completing;
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteError, setQuoteError] = useState('');

  useEffect(() => {
    if (!event) {
      setQuoteAmount('');
      setQuoteError('');
      return;
    }
    setQuoteAmount(
      event.estimated_total != null ? String(event.estimated_total) : ''
    );
    setQuoteError('');
  }, [event?.id, event?.estimated_total]);

  const status = event?.status;
  const showQuote = canDecide && status === 'inquiry';
  const showConfirm = canDecide && status === 'quoted';
  const showDecline =
    canDecide && (status === 'inquiry' || status === 'quoted');
  const showComplete = canDecide && status === 'confirmed';
  const sameDay = event?.same_day_events || [];

  const handleQuote = () => {
    const amount = Number(quoteAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      setQuoteError('Enter a valid quote amount');
      return;
    }
    setQuoteError('');
    onSendQuote(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Catering details
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Review, quote, confirm, or decline this inquiry
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading || !event ? (
            <div className="flex justify-center py-12 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-base font-bold text-slate-900">
                    {event.event_name || 'Untitled event'}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      (STATUS_BADGE[event.status] || STATUS_BADGE.inquiry)
                        .className
                    }`}
                  >
                    {
                      (STATUS_BADGE[event.status] || STATUS_BADGE.inquiry)
                        .label
                    }
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <div>
                    <span className="text-slate-500">Contact: </span>
                    {event.contact_name}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    {formatDateTime(event.event_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    {event.party_size} guests
                  </div>
                  {event.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {event.contact_phone}
                    </div>
                  )}
                  {event.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {event.contact_email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 capitalize">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {event.venue_type.replace('_', ' ')}
                  </div>
                  <div>
                    <span className="text-slate-500">Quote: </span>
                    {formatMoney(event.estimated_total)}
                  </div>
                  <div>
                    <span className="text-slate-500">Branch: </span>
                    {event.branch_name || '—'}
                  </div>
                </div>
                {event.venue_address && (
                  <p className="mt-3 text-sm text-slate-600">
                    <span className="font-medium text-slate-500">Address: </span>
                    {event.venue_address}
                  </p>
                )}
                {event.notes && (
                  <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                    {event.notes}
                  </p>
                )}
              </div>

              {sameDay.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    Other events that day
                  </div>
                  <div className="space-y-2">
                    {sameDay.map((e) => (
                      <SameDayRow key={e.id} e={e} />
                    ))}
                  </div>
                </div>
              )}

              {showQuote && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Quote amount
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={quoteAmount}
                    onChange={(e) => {
                      setQuoteAmount(e.target.value);
                      setQuoteError('');
                    }}
                    disabled={busy}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                    placeholder="0.00"
                  />
                  {quoteError && (
                    <p className="mt-1 text-xs text-rose-600">{quoteError}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {(showQuote || showConfirm || showDecline || showComplete) && event && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
            {showDecline && (
              <button
                type="button"
                disabled={busy}
                onClick={onDecline}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
              >
                {declining && <Loader2 className="h-4 w-4 animate-spin" />}
                Decline
              </button>
            )}
            {showComplete && (
              <button
                type="button"
                disabled={busy}
                onClick={onMarkCompleted}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {completing && <Loader2 className="h-4 w-4 animate-spin" />}
                Mark completed
              </button>
            )}
            {showConfirm && (
              <button
                type="button"
                disabled={busy}
                onClick={onConfirm}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {confirming && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm
              </button>
            )}
            {showQuote && (
              <button
                type="button"
                disabled={busy}
                onClick={handleQuote}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white hover:brightness-95 disabled:opacity-60"
              >
                {quoting && <Loader2 className="h-4 w-4 animate-spin" />}
                Send quote
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
