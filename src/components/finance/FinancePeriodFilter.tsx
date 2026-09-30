'use client';

import DateRangePicker, {
  DateRangeValue,
  defaultLastDaysRange,
} from '@/components/ui/DateRangePicker';

export { defaultLastDaysRange };
export type { DateRangeValue };

interface Props {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  className?: string;
}

export function formatFinanceMoney(value?: number | null) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

/** Finance reports date filter — same calendar as main dashboard. */
export default function FinancePeriodFilter({
  value,
  onChange,
  className,
}: Props) {
  return (
    <DateRangePicker value={value} onChange={onChange} className={className} />
  );
}
