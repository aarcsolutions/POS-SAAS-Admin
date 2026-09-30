import api from '../lib/api';
import {
  FinanceAccountPayload,
  FinanceAccountRow,
} from '@/types/finance.types';

export const financeAccountsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  }) => {
    const { data } = await api.get('/finance-accounts/getAll', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/finance-accounts/getById/${id}`);
    return data;
  },

  create: async (payload: FinanceAccountPayload) => {
    const { data } = await api.post('/finance-accounts/create', payload);
    return data;
  },

  update: async (id: string, payload: Partial<FinanceAccountPayload>) => {
    const { data } = await api.put('/finance-accounts/update', {
      id,
      ...payload,
    });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/finance-accounts/delete', {
      data: { id },
    });
    return data;
  },

  recalculateBalance: async (id: string) => {
    const { data } = await api.post(
      `/finance-accounts/recalculateBalance/${id}`
    );
    return data as { status: boolean; message?: string; data?: FinanceAccountRow };
  },
};
