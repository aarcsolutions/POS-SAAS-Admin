import api from '../lib/api';
import { BusinessSettingsPayload } from '@/types/business-settings.types';

export const businessSettingsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    branch_id?: string;
  }) => {
    const { data } = await api.get('/business-settings/getAll', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/business-settings/getById/${id}`);
    return data;
  },

  create: async (payload: BusinessSettingsPayload) => {
    const { data } = await api.post('/business-settings/create', payload);
    return data;
  },

  update: async (payload: BusinessSettingsPayload) => {
    const { data } = await api.put('/business-settings/update', payload);
    return data;
  },
};
