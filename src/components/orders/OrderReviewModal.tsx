'use client';

import { useState } from 'react';
import { Loader2, Star, X } from 'lucide-react';

interface Props {
  open: boolean;
  orderLabel: string;
  customerName?: string | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: { rating: number; comment: string }) => Promise<void> | void;
}

export default function OrderReviewModal({
  open,
  orderLabel,
  customerName,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a rating');
      return;
    }
    setError('');
    await onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Leave a review</h2>
            <p className="mt-1 text-sm font-medium text-[var(--brand-primary)]">
              {customerName?.trim()
                ? `Thanks for visiting, ${customerName.trim()}!`
                : 'Thanks for visiting!'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{orderLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Rating
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => {
                const active = value <= (hover || rating);
                return (
                  <button
                    key={value}
                    type="button"
                    onMouseEnter={() => setHover(value)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(value)}
                    className="rounded-lg p-1 transition hover:scale-110"
                    aria-label={`${value} star${value === 1 ? '' : 's'}`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        active
                          ? 'fill-[var(--brand-primary)] text-[var(--brand-primary)]'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share feedback about this order…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
            />
          </div>

          {error && (
            <p className="text-xs text-[var(--brand-primary-dark)]">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
