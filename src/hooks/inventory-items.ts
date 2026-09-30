import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryItemsApi } from '@/services/inventory-items';
import { InventoryItemPayload } from '@/types/inventory-item.types';
import { toast } from 'sonner';

export const useInventoryItemsQuery = (
  params: { page?: number; limit?: number; search?: string } = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ['inventory-items', params],
    queryFn: () => inventoryItemsApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateInventoryItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InventoryItemPayload) =>
      inventoryItemsApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(
          response.message || 'Inventory item created successfully'
        );
        queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create inventory item'
      );
    },
  });
};

export const useUpdateInventoryItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: InventoryItemPayload & { id: string }) =>
      inventoryItemsApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(
          response.message || 'Inventory item updated successfully'
        );
        queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update inventory item'
      );
    },
  });
};

export const useDeleteInventoryItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryItemsApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(
          response.message || 'Inventory item deleted successfully'
        );
        queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete inventory item'
      );
    },
  });
};

export const useDayEndClosingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: Array<{ id: string; stock_quantity: number }>) =>
      inventoryItemsApi.dayEndClosing(items),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Day-end closing saved');
        queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
        queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
        queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to save day-end closing'
      );
    },
  });
};
