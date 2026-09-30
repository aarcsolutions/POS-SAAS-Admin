import api from '../lib/api';
import { TransferPayload } from '@/types/finance.types';

export const financeTransactionsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
    account_id?: string;
    direction?: string;
    transaction_type?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const { data } = await api.get('/finance-transactions/getAll', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/finance-transactions/getById/${id}`);
    return data;
  },

  transfer: async (payload: TransferPayload) => {
    const { data } = await api.post('/finance-transactions/transfer', payload);
    return data;
  },

  void: async (id: string) => {
    const { data } = await api.post('/finance-transactions/void', { id });
    return data;
  },
};
