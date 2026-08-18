'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

type ListPagerProps = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  label?: string;
  disabled?: boolean;
};

export default function ListPager({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  label = 'items',
  disabled = false,
}: ListPagerProps) {
  const showing = total === 0 ? 0 : Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between text-sm text-slate-500">
      <span>
        Showing {showing} of {total} {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="rounded-md border border-slate-200 p-2 hover:bg-white disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[4rem] text-center font-medium text-slate-700">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="rounded-md border border-slate-200 p-2 hover:bg-white disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
