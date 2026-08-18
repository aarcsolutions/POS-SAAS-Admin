import api from '../lib/api';
import {
  DashboardPeriod,
  DashboardResponse,
} from '@/types/dashboard.types';

export const dashboardApi = {
  getAll: async (period: DashboardPeriod = '30d') => {
    const { data } = await api.get<DashboardResponse>('/dashboard/getAll', {
      params: { period },
    });
    return data;
  },
};
