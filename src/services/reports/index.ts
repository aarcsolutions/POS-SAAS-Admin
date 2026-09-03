import api from '../lib/api';
import { DashboardPeriod, ReportsResponse } from '@/types/dashboard.types';

export const reportsApi = {
  getAll: async (period: DashboardPeriod = '30d') => {
    const { data } = await api.get<ReportsResponse>('/reports/getAll', {
      params: { period },
    });
    return data;
  },
};
