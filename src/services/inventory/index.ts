import api from '../lib/api';
import {
  InventoryBalancesResponse,
  StockMovementsResponse,
} from '@/types/inventory.types';

export const inventoryApi = {
  getAll: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      item_type?: string;
      low_stock?: string | boolean;
    } = {}
  ) => {
    const { data } = await api.get<InventoryBalancesResponse>(
      '/inventory/getAll',
      { params }
    );
    return data;
  },

  getMovements: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      item_type?: string;
      movement_type?: string;
      from?: string;
      to?: string;
    } = {}
  ) => {
    const { data } = await api.get<StockMovementsResponse>(
      '/inventory/movements',
      { params }
    );
    return data;
  },
};
