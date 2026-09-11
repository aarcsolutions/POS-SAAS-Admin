import api from '../lib/api';
import { TaxPayload, TaxesListResponse } from '@/types/tax.types';

export const taxesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  }) => {
    const { data } = await api.get<TaxesListResponse>('/taxes/getAll', {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/taxes/getById/${id}`);
    return data;
  },

  create: async (payload: TaxPayload) => {
    const { data } = await api.post('/taxes/create', payload);
    return data;
  },

  update: async (id: string, payload: Partial<TaxPayload>) => {
    const { data } = await api.put('/taxes/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/taxes/delete', { data: { id } });
    return data;
  },
};
