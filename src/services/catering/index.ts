import api from '../lib/api';
import {
  CateringEventDetailResponse,
  CateringEventPayload,
  CateringEventsListResponse,
} from '@/types/catering.types';

export const cateringApi = {
  getAll: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      branch_id?: string;
      status?: string;
      venue_type?: string;
      date_from?: string;
      date_to?: string;
    } = {}
  ) => {
    const { data } = await api.get<CateringEventsListResponse>(
      '/catering/getAll',
      { params }
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<CateringEventDetailResponse>(
      `/catering/getById/${id}`
    );
    return data;
  },

  create: async (payload: CateringEventPayload) => {
    const { data } = await api.post('/catering/create', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CateringEventPayload>) => {
    const { data } = await api.put('/catering/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/catering/delete', { data: { id } });
    return data;
  },
};
