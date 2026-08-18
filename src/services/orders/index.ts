import api from '../lib/api';
import {
  CreateOrderPayload,
  OrderDetailResponse,
  OrdersListResponse,
  OrderStatus,
  PaymentMethod,
} from '@/types/order.types';

export const ordersApi = {
  getAll: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: OrderStatus | '';
    } = {}
  ) => {
    const { data } = await api.get<OrdersListResponse>('/orders/getAll', {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<OrderDetailResponse>(
      `/orders/getById/${id}`
    );
    return data;
  },

  create: async (payload: CreateOrderPayload) => {
    const { data } = await api.post('/orders/create', payload);
    return data;
  },

  update: async (payload: { id: string } & Partial<CreateOrderPayload>) => {
    const { data } = await api.put('/orders/update', payload);
    return data;
  },

  updateStatus: async (id: string, status: OrderStatus) => {
    const { data } = await api.patch('/orders/updateStatus', { id, status });
    return data;
  },

  recordPayment: async (payload: {
    order_id: string;
    method: PaymentMethod;
    amount?: number;
    transaction_no?: string;
  }) => {
    const { data } = await api.post('/orders/recordPayment', payload);
    return data;
  },
};
