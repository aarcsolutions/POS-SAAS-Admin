import api from '../lib/api';
import {
  TableDetailResponse,
  TablePayload,
  TablesListResponse,
} from '@/types/table.types';

export const tablesApi = {
  getAll: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      branch_id?: string;
      status?: string;
    } = {}
  ) => {
    const { data } = await api.get<TablesListResponse>('/tables/getAll', {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<TableDetailResponse>(
      `/tables/getById/${id}`
    );
    return data;
  },

  create: async (payload: TablePayload) => {
    const { data } = await api.post('/tables/create', payload);
    return data;
  },

  update: async (id: string, payload: Partial<TablePayload>) => {
    const { data } = await api.put('/tables/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/tables/delete', { data: { id } });
    return data;
  },
};
