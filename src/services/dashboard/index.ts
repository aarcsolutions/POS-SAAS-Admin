import api from '../lib/api';
import {
  DashboardDateRange,
  DashboardResponse,
} from '@/types/dashboard.types';

export type MenuPendingCounts = Record<string, number>;

export const dashboardApi = {
  getAll: async (range: DashboardDateRange) => {
    if (!range?.from || !range?.to) {
      throw new Error('date_from and date_to are required');
    }

    const { data } = await api.get<DashboardResponse>('/dashboard/getAll', {
      params: {
        date_from: range.from,
        date_to: range.to,
      },
    });
    return data;
  },

  getPendingCounts: async () => {
    const { data } = await api.get<{
      status: boolean;
      data: MenuPendingCounts;
    }>('/dashboard/getPendingCounts');
    return data;
  },
};
