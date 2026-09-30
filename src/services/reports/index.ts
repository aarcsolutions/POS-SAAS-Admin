import api from '../lib/api';
import {
  DashboardDateRange,
  ReportsResponse,
} from '@/types/dashboard.types';

export const reportsApi = {
  getAll: async (range: DashboardDateRange) => {
    if (!range?.from || !range?.to) {
      throw new Error('date_from and date_to are required');
    }

    const { data } = await api.get<ReportsResponse>('/reports/getAll', {
      params: {
        date_from: range.from,
        date_to: range.to,
      },
    });
    return data;
  },
};
