import api from '../lib/api';
import {
  CustomerDetailResponse,
  CustomerPayload,
  CustomersListResponse,
} from '@/types/customer.types';

export const customersApi = {
  getAll: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      /** Tenant Admin: branch uuid | 'tenant' | omit for all */
      branch_id?: string;
    } = {}
  ) => {
    const { data } = await api.get<CustomersListResponse>('/customers/getAll', {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<CustomerDetailResponse>(
      `/customers/getById/${id}`
    );
    return data;
  },

  create: async (payload: CustomerPayload) => {
    const { data } = await api.post('/customers/create', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CustomerPayload>) => {
    const { data } = await api.put('/customers/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/customers/delete', { data: { id } });
    return data;
  },
};
