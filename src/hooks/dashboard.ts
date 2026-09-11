import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard';
import { DashboardDateRange } from '@/types/dashboard.types';
import { useOrderSocketConnected } from '@/components/realtime/OrderSocketProvider';

export const useDashboardQuery = (
  range: DashboardDateRange,
  options?: { poll?: boolean }
) => {
  const socketConnected = useOrderSocketConnected();

  return useQuery({
    queryKey: ['dashboard', range.from, range.to],
    queryFn: () => dashboardApi.getAll(range),
    enabled: Boolean(range.from && range.to),
    placeholderData: (previousData) => previousData,
    refetchInterval: options?.poll
      ? socketConnected
        ? 60000
        : 30000
      : false,
  });
};
