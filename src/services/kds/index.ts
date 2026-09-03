import api from '../lib/api';
import { OrderStatus } from '@/types/order.types';

export type KdsMarkReadyAction = 'start' | 'ready';

export interface KdsTicketItem {
  id?: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  product?: { id: string; title?: string; name?: string } | null;
  variant?: { id: string; name: string } | null;
}

export interface KdsTicket {
  id: string;
  order_number: string;
  order_type: string;
  table_name?: string | null;
  delivery_address?: string | null;
  delivery_city?: string | null;
  delivery_phone?: string | null;
  status: OrderStatus;
  customer: { id: string; name: string; phone?: string } | null;
  items: KdsTicketItem[];
  created_at: string;
  updated_at: string;
}

export const kdsApi = {
  getAll: async () => {
    const { data } = await api.get('/kds/getAll');
    return data;
  },

  markReady: async (payload: { id: string; action?: KdsMarkReadyAction }) => {
    const { data } = await api.patch('/kds/markReady', payload);
    return data;
  },
};
