import api from '../lib/api';
import {
  EligibleOrder,
  ReviewDetailResponse,
  ReviewPayload,
  ReviewsListResponse,
} from '@/types/review.types';

export const reviewsApi = {
  getAll: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      branch_id?: string;
      rating?: number;
      date_from?: string;
      date_to?: string;
    } = {}
  ) => {
    const { data } = await api.get<ReviewsListResponse>('/reviews/getAll', {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ReviewDetailResponse>(
      `/reviews/getById/${id}`
    );
    return data;
  },

  getEligibleOrders: async (branch_id?: string) => {
    const { data } = await api.get<{
      status: boolean;
      data: EligibleOrder[];
    }>('/reviews/getEligibleOrders', {
      params: branch_id ? { branch_id } : undefined,
    });
    return data;
  },

  create: async (payload: ReviewPayload) => {
    const { data } = await api.post('/reviews/create', payload);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<Pick<ReviewPayload, 'rating' | 'comment' | 'reviewed_at'>>
  ) => {
    const { data } = await api.put('/reviews/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/reviews/delete', { data: { id } });
    return data;
  },
};
