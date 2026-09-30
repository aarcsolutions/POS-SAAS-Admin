import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/reports';
import { DashboardDateRange } from '@/types/dashboard.types';

export const useReportsQuery = (range: DashboardDateRange) =>
  useQuery({
    queryKey: ['reports', range.from, range.to],
    queryFn: () => reportsApi.getAll(range),
    enabled: Boolean(range?.from && range?.to),
    placeholderData: (previousData) => previousData,
  });
