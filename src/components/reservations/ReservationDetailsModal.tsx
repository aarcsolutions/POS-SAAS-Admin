'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Loader2,
  Mail,
  Phone,
  Users,
  X,
} from 'lucide-react';
import { Select } from '@/components/ui/Select';
import {
  Reservation,
  ReservationConflict,
  STATUS_BADGE,
} from '@/types/reservation.types';

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

interface Props {
  reservation: Reservation | null;
  loading?: boolean;
  accepting?: boolean;
  rejecting?: boolean;
  canDecide?: boolean;
  onClose: () => void;
  onAccept: (tableId: string | null) => void;
  onReject: () => void;
}

function ConflictRow({ c }: { c: ReservationConflict }) {
  const badge = STATUS_BADGE[c.status] || STATUS_BADGE.pending;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold text-slate-800">{c.guest_name}</div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            c.clash_type === 'table'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {c.clash_type === 'table' ? 'Same table' : 'Time overlap'}
        </span>
      </div>
      <div className="mt-1 text-xs text-slate-600">
        {formatDateTime(c.reserved_at)} · {c.duration_minutes} min
        {c.table_name ? ` · ${c.table_name}` : ''}
      </div>
      <div className="mt-1">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
    </div>
  );
}

export default function ReservationDetailsModal({
  reservation,
  loading = false,
  accepting = false,
  rejecting = false,
  canDecide = false,
  onClose,
  onAccept,
  onReject,
}: Props) {
  const busy = accepting || rejecting;
  const conflicts = reservation?.conflicts || [];
  const availableTables = reservation?.available_tables || [];
  const isPending = reservation?.status === 'pending';
  const showActions = canDecide && isPending;

  const [selectedTableId, setSelectedTableId] = useState('');

  useEffect(() => {
    if (!reservation) {
      setSelectedTableId('');
      return;
    }
    const assigned = reservation.restaurant_table_id || '';
    const stillAvailable =
      !!assigned &&
      (reservation.available_tables || []).some((t) => t.id === assigned);
    setSelectedTableId(stillAvailable ? assigned : '');
  }, [reservation?.id, reservation?.restaurant_table_id, reservation?.available_tables]);

  const tableOptions = useMemo(() => {
    return availableTables.map((t) => {
      const code = t.code?.trim();
      const capacity =
        t.capacity != null ? ` · ${t.capacity} seats` : ' · capacity n/a';
      const label = `${code ? `${code} — ` : ''}${t.name}${capacity}`;
      return { value: t.id, label };
    });
  }, [availableTables]);

  const selectedTable = availableTables.find((t) => t.id === selectedTableId);
  const tableClashOnSelected =
    !!selectedTableId &&
    conflicts.some(
      (c) =>
        c.clash_type === 'table' &&
        c.restaurant_table_id === selectedTableId
    );

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
              Reservation details
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Assign a free table, then accept or reject
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
          {loading || !reservation ? (
            <div className="flex justify-center py-12 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-base font-bold text-slate-900">
                    {reservation.guest_name}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      (STATUS_BADGE[reservation.status] || STATUS_BADGE.pending)
                        .className
                    }`}
                  >
                    {
                      (STATUS_BADGE[reservation.status] || STATUS_BADGE.pending)
                        .label
                    }
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    {formatDateTime(reservation.reserved_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    {reservation.party_size} guests ·{' '}
                    {reservation.duration_minutes} min
                  </div>
                  {reservation.guest_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {reservation.guest_phone}
                    </div>
                  )}
                  {reservation.guest_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {reservation.guest_email}
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">Current table: </span>
                    {reservation.table_name || 'Not assigned'}
                  </div>
                  <div>
                    <span className="text-slate-500">Branch: </span>
                    {reservation.branch_name || '—'}
                  </div>
                </div>
                {reservation.notes && (
                  <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                    {reservation.notes}
                  </p>
                )}
                {!reservation.guest_email && (
                  <p className="mt-3 text-xs font-medium text-amber-700">
                    No guest email on this reservation — accept/reject will not
                    send email.
                  </p>
                )}
              </div>

              {showActions && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-800">
                    Assign table
                  </label>
                  <Select
                    value={selectedTableId}
                    onChange={setSelectedTableId}
                    options={tableOptions}
                    placeholder="Select available table"
                    allowEmpty
                    searchable
                    searchPlaceholder="Search table…"
                    variant="form"
                    size="lg"
                    emptyMessage="No free tables for this time"
                    aria-label="Assign table"
                  />
                  <p className="text-xs text-slate-500">
                    Free for this date/time only. Tables matching{' '}
                    {reservation.party_size} seats are listed first, then other
                    available tables.
                  </p>
                  {selectedTable && !selectedTable.fits_party && (
                    <p className="text-xs font-medium text-amber-700">
                      This table seats {selectedTable.capacity ?? 'fewer'} — less
                      than party size ({reservation.party_size}).
                    </p>
                  )}
                  {tableOptions.length === 0 && (
                    <p className="text-xs font-medium text-rose-700">
                      All tables are booked for this window. Reject conflicting
                      bookings or pick another time before accepting.
                    </p>
                  )}
                </div>
              )}

              {conflicts.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    {conflicts.length} same-table clash
                    {conflicts.length > 1 ? 'es' : ''}
                  </div>
                  <p className="text-xs text-rose-700">
                    This table is already held in this time window. Pick another
                    free table before accepting.
                  </p>
                  <div className="space-y-2">
                    {conflicts.map((c) => (
                      <ConflictRow key={c.id} c={c} />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  No same-table clash for this booking. Parallel reservations at
                  the same time are fine on different tables.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Close
          </button>
          {showActions && (
            <>
              <button
                type="button"
                onClick={onReject}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
              >
                {rejecting && <Loader2 className="h-4 w-4 animate-spin" />}
                Reject
              </button>
              <button
                type="button"
                onClick={() => onAccept(selectedTableId || null)}
                disabled={busy || !selectedTableId || tableClashOnSelected}
                title={
                  !selectedTableId
                    ? 'Select an available table to accept'
                    : tableClashOnSelected
                      ? 'Selected table still conflicts'
                      : undefined
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
              >
                {accepting && <Loader2 className="h-4 w-4 animate-spin" />}
                Accept
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
