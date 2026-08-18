import api from '../lib/api';
import { omitEmptyParams } from '@/utils/helpers';

export type ModulesQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
};

export type ModulePayload = {
  title: string;
  slug: string;
  description?: string;
};

export const modulesApi = {
  getAll: async (params: ModulesQueryParams = {}) => {
    const { data } = await api.get('/modules/getAll', {
      params: omitEmptyParams(params),
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/modules/getById/${id}`);
    return data;
  },

  create: async (payload: ModulePayload) => {
    const { data } = await api.post('/modules/create', payload);
    return data;
  },

  update: async (id: string, payload: ModulePayload) => {
    const { data } = await api.put('/modules/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/modules/delete', { data: { id } });
    return data;
  },
};
