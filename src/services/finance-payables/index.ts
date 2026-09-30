import api from '../lib/api';
import { PayPayablePayload } from '@/types/finance.types';

export const financePayablesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  }) => {
    const { data } = await api.get('/finance-payables/getAll', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/finance-payables/getById/${id}`);
    return data;
  },

  pay: async (payload: PayPayablePayload) => {
    const { data } = await api.post('/finance-payables/pay', payload);
    return data;
  },

  voidPayment: async (payload: { id: string }) => {
    const { data } = await api.post('/finance-payables/voidPayment', payload);
    return data;
  },
};
