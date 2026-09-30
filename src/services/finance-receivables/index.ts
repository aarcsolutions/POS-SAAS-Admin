import api from '../lib/api';

export const financeReceivablesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  }) => {
    const { data } = await api.get('/finance-receivables/getAll', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/finance-receivables/getById/${id}`);
    return data;
  },
};
