import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard';
import { DashboardPeriod } from '@/types/dashboard.types';

export const useDashboardQuery = (period: DashboardPeriod = '30d') =>
  useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => dashboardApi.getAll(period),
    placeholderData: (previousData) => previousData,
  });
