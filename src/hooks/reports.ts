import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/reports';
import { DashboardPeriod } from '@/types/dashboard.types';

export const useReportsQuery = (period: DashboardPeriod = '30d') =>
  useQuery({
    queryKey: ['reports', period],
    queryFn: () => reportsApi.getAll(period),
    placeholderData: (previousData) => previousData,
  });
