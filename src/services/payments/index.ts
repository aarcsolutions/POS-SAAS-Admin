import api from '../lib/api';
import { PaymentDetailResponse, PaymentsListResponse, PaymentTab } from '@/types/payment.types';

export const paymentsApi = {
  getAll: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      tab?: PaymentTab;
      status?: string;
      method?: string;
      branch_id?: string;
    } = {}
  ) => {
    const { data } = await api.get<PaymentsListResponse>('/payments/getAll', {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<PaymentDetailResponse>(
      `/payments/getById/${id}`
    );
    return data;
  },
};
