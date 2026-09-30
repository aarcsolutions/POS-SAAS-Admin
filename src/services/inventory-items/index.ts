import api from '../lib/api';
import {
  InventoryItemDetailResponse,
  InventoryItemPayload,
  InventoryItemsListResponse,
} from '@/types/inventory-item.types';

export const inventoryItemsApi = {
  getAll: async (
    params: { page?: number; limit?: number; search?: string } = {}
  ) => {
    const { data } = await api.get<InventoryItemsListResponse>(
      '/inventory-items/getAll',
      { params }
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<InventoryItemDetailResponse>(
      `/inventory-items/getById/${id}`
    );
    return data;
  },

  create: async (payload: InventoryItemPayload) => {
    const { data } = await api.post('/inventory-items/create', payload);
    return data;
  },

  update: async (id: string, payload: Partial<InventoryItemPayload>) => {
    const { data } = await api.put('/inventory-items/update', {
      id,
      ...payload,
    });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/inventory-items/delete', {
      data: { id },
    });
    return data;
  },

  dayEndClosing: async (
    items: Array<{ id: string; stock_quantity: number }>
  ) => {
    const { data } = await api.put('/inventory-items/dayEndClosing', {
      items,
    });
    return data;
  },
};
