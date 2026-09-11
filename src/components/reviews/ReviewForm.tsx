'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Star, MessageSquare } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { ReviewPayload } from '@/types/review.types';

interface ReviewFormData {
  branch_id: string;
  order_id: string;
  rating: string;
  comment: string;
  reviewed_at: string;
}

interface Props {
  mode: 'create' | 'edit' | 'view';
  initialData?: Partial<ReviewFormData>;
  branchOptions?: Array<{ value: string; label: string }>;
  orderOptions?: Array<{ value: string; label: string }>;
  showBranchSelect?: boolean;
  branchFilterOptional?: boolean;
  saving?: boolean;
  onBranchChange?: (branchId: string) => void;
  onClose: () => void;
  onSubmit: (data: ReviewPayload) => Promise<void> | void;
}

const emptyData: ReviewFormData = {
  branch_id: '',
  order_id: '',
  rating: '5',
  comment: '',
  reviewed_at: '',
};

function toLocalDatetimeInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ReviewForm({
  mode,
  initialData,
  branchOptions = [],
  orderOptions = [],
  showBranchSelect = false,
  branchFilterOptional = false,
  saving = false,
  onBranchChange,
  onClose,
  onSubmit,
}: Props) {
  const [data, setData] = useState<ReviewFormData>({
    ...emptyData,
    ...initialData,
    reviewed_at: toLocalDatetimeInput(initialData?.reviewed_at),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const readOnly = mode === 'view';

  useEffect(() => {
    if (initialData) {
      setData({
        ...emptyData,
        ...initialData,
        reviewed_at: toLocalDatetimeInput(initialData.reviewed_at),
      });
    }
  }, [initialData]);

  const update = <K extends keyof ReviewFormData>(
    key: K,
    value: ReviewFormData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (showBranchSelect && !branchFilterOptional && !data.branch_id) {
      e.branch_id = 'Branch is required';
    }
    if (mode === 'create' && !data.order_id) {
      e.order_id = 'Order is required';
    }
    if (!data.rating) {
      e.rating = 'Rating is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (!validate()) return;

    await onSubmit({
      order_id: data.order_id,
      rating: Number(data.rating),
      comment: data.comment.trim() || null,
      reviewed_at: data.reviewed_at
        ? new Date(data.reviewed_at).toISOString()
        : undefined,
    });
  };

  const title =
    mode === 'create'
      ? 'Add Review'
      : mode === 'edit'
        ? 'Edit Review'
        : 'Review Details';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Reviews
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Star className="h-4 w-4" /> Review
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {showBranchSelect && mode === 'create' && (
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Branch{' '}
                  {branchFilterOptional && (
                    <span className="font-normal text-slate-400">
                      (optional — filter orders)
                    </span>
                  )}
                </label>
                <Select
                  value={data.branch_id}
                  onChange={(value) => {
                    update('branch_id', value);
                    update('order_id', '');
                    onBranchChange?.(value);
                  }}
                  disabled={readOnly}
                  placeholder={
                    branchFilterOptional ? 'All branches' : 'Select branch'
                  }
                  options={branchOptions}
                />
                {errors.branch_id && (
                  <p className="mt-1 text-xs text-rose-600">{errors.branch_id}</p>
                )}
              </div>
            )}

            {mode === 'create' ? (
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Completed order
                </label>
                <Select
                  value={data.order_id}
                  onChange={(value) => update('order_id', value)}
                  disabled={readOnly}
                  placeholder="Select order"
                  options={orderOptions}
                  searchable
                  searchPlaceholder="Search orders…"
                />
                {errors.order_id && (
                  <p className="mt-1 text-xs text-rose-600">{errors.order_id}</p>
                )}
              </div>
            ) : (
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Order
                </label>
                <input
                  value={orderOptions[0]?.label || data.order_id}
                  readOnly
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Rating
              </label>
              <div
                className="flex h-11 items-center gap-1"
                role="radiogroup"
                aria-label="Rating"
              >
                {[1, 2, 3, 4, 5].map((n) => {
                  const value = Number(data.rating) || 0;
                  const filled = n <= value;
                  return (
                    <button
                      key={n}
                      type="button"
                      disabled={readOnly}
                      onClick={() => update('rating', String(n))}
                      className="rounded p-0.5 transition hover:scale-110 disabled:cursor-default"
                      aria-label={`${n} stars`}
                      aria-checked={value === n}
                      role="radio"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          filled
                            ? 'fill-[#f5c518] text-[#f5c518]'
                            : 'fill-transparent text-[var(--brand-primary)]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              {errors.rating && (
                <p className="mt-1 text-xs text-rose-600">{errors.rating}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Reviewed at
              </label>
              <input
                type="datetime-local"
                value={data.reviewed_at}
                onChange={(e) => update('reviewed_at', e.target.value)}
                readOnly={readOnly}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Comment
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  value={data.comment}
                  onChange={(e) => update('comment', e.target.value)}
                  readOnly={readOnly}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)] disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>

        {!readOnly && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white hover:brightness-95 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Review' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
