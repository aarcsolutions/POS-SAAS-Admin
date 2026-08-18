import api from '../lib/api';
import {
  RawMaterialDetailResponse,
  RawMaterialPayload,
  RawMaterialsListResponse,
} from '@/types/raw-material.types';

export const rawMaterialsApi = {
  getAll: async (
    params: { page?: number; limit?: number; search?: string } = {}
  ) => {
    const { data } = await api.get<RawMaterialsListResponse>(
      '/raw-materials/getAll',
      { params }
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<RawMaterialDetailResponse>(
      `/raw-materials/getById/${id}`
    );
    return data;
  },

  create: async (payload: RawMaterialPayload) => {
    const { data } = await api.post('/raw-materials/create', payload);
    return data;
  },

  update: async (id: string, payload: Partial<RawMaterialPayload>) => {
    const { data } = await api.put('/raw-materials/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/raw-materials/delete', {
      data: { id },
    });
    return data;
  },
};
