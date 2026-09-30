import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/services/inventory';

export const useInventoryBalancesQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    item_type?: string;
    low_stock?: string | boolean;
  } = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ['inventory-balances', params],
    queryFn: () => inventoryApi.getAll(params),
    enabled,
  });
};

export const useStockMovementsQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    item_type?: string;
    movement_type?: string;
  } = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ['inventory-movements', params],
    queryFn: () => inventoryApi.getMovements(params),
    enabled,
  });
};
