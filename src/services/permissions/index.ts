import api from '../lib/api';
import { omitEmptyParams } from '@/utils/helpers';

export type PermissionsQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  moduleId?: string;
};

export type PermissionPayload = {
  moduleId: string;
  title: string;
  slug: string;
  description?: string;
};

export const permissionsApi = {
  getAll: async (params: PermissionsQueryParams = {}) => {
    const { data } = await api.get('/permissions/getAll', {
      params: omitEmptyParams(params),
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/permissions/getById/${id}`);
    return data;
  },

  create: async (payload: PermissionPayload) => {
    const { data } = await api.post('/permissions/create', payload);
    return data;
  },

  update: async (
    id: string,
    payload: {
      moduleId: string;
      title: string;
      slug: string;
      description?: string;
    }
  ) => {
    const { data } = await api.put('/permissions/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/permissions/delete', { data: { id } });
    return data;
  },
};
