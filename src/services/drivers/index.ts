import api from '../lib/api';
import {
  DriverDetailResponse,
  DriverPayload,
  DriversListResponse,
} from '@/types/driver.types';

export const driversApi = {
  getAll: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      branch_id?: string;
    } = {}
  ) => {
    const { data } = await api.get<DriversListResponse>('/drivers/getAll', {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<DriverDetailResponse>(
      `/drivers/getById/${id}`
    );
    return data;
  },

  create: async (payload: DriverPayload) => {
    const { data } = await api.post('/drivers/create', payload);
    return data;
  },

  update: async (id: string, payload: Partial<DriverPayload>) => {
    const { data } = await api.put('/drivers/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/drivers/delete', { data: { id } });
    return data;
  },
};
