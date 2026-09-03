import api from '../lib/api';
import {
  CreateOrderPayload,
  OrderDetailResponse,
  OrdersListResponse,
  OrderStatus,
  OrderType,
  PaymentMethod,
} from '@/types/order.types';

export const ordersApi = {
  getAll: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: OrderStatus | '';
      order_type?: OrderType;
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

  dispatch: async (id: string, driver_id: string) => {
    const { data } = await api.post('/orders/dispatch', { id, driver_id });
    return data;
  },

  trackPublic: async (tenantSlug: string, token: string) => {
    const { data } = await api.get(`/orders/track/${tenantSlug}/${token}`);
    return data;
  },

  deliverByToken: async (tenantSlug: string, token: string) => {
    const { data } = await api.post(
      `/orders/track/${tenantSlug}/${token}/deliver`
    );
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
