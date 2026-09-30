import api from '../lib/api';
import { CreateBankStatementPayload } from '@/types/finance.types';

export const financeReconciliationApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  }) => {
    const { data } = await api.get('/finance-reconciliation/getAll', {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/finance-reconciliation/getById/${id}`);
    return data;
  },

  create: async (payload: CreateBankStatementPayload) => {
    const { data } = await api.post('/finance-reconciliation/create', payload);
    return data;
  },

  match: async (payload: {
    line_id: string;
    finance_transaction_id: string;
  }) => {
    const { data } = await api.post('/finance-reconciliation/match', payload);
    return data;
  },

  unmatch: async (payload: { line_id: string }) => {
    const { data } = await api.post('/finance-reconciliation/unmatch', payload);
    return data;
  },

  reconcile: async (payload: { id: string }) => {
    const { data } = await api.post(
      '/finance-reconciliation/reconcile',
      payload
    );
    return data;
  },

  reopen: async (payload: { id: string }) => {
    const { data } = await api.post('/finance-reconciliation/reopen', payload);
    return data;
  },
};
