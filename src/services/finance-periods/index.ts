import api from '../lib/api';
import { CreateFinancePeriodPayload } from '@/types/finance.types';

export const financePeriodsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  }) => {
    const { data } = await api.get('/finance-periods/getAll', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/finance-periods/getById/${id}`);
    return data;
  },

  create: async (payload: CreateFinancePeriodPayload) => {
    const { data } = await api.post('/finance-periods/create', payload);
    return data;
  },

  close: async (payload: { id: string }) => {
    const { data } = await api.post('/finance-periods/close', payload);
    return data;
  },

  reopen: async (payload: { id: string }) => {
    const { data } = await api.post('/finance-periods/reopen', payload);
    return data;
  },
};
