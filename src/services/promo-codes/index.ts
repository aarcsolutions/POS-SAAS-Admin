import api from '../lib/api';
import {
  PromoCodeDetailResponse,
  PromoCodePayload,
  PromoCodesListResponse,
} from '@/types/promo-code.types';

export const promoCodesApi = {
  getAll: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      branch_id?: string;
    } = {}
  ) => {
    const { data } = await api.get<PromoCodesListResponse>(
      '/promo-codes/getAll',
      { params }
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<PromoCodeDetailResponse>(
      `/promo-codes/getById/${id}`
    );
    return data;
  },

  create: async (payload: PromoCodePayload) => {
    const { data } = await api.post('/promo-codes/create', payload);
    return data;
  },

  update: async (id: string, payload: Partial<PromoCodePayload>) => {
    const { data } = await api.put('/promo-codes/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/promo-codes/delete', { data: { id } });
    return data;
  },
};
