import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesApi } from '@/services/tables';
import { TablePayload } from '@/types/table.types';
import { toast } from 'sonner';

export const useTablesQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
    status?: string;
  } = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ['tables', params],
    queryFn: () => tablesApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateTableMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TablePayload) => tablesApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Table created successfully');
        queryClient.invalidateQueries({ queryKey: ['tables'] });
        queryClient.invalidateQueries({ queryKey: ['reservation-tables'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create table');
    },
  });
};

export const useUpdateTableMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: TablePayload & { id: string }) => tablesApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Table updated successfully');
        queryClient.invalidateQueries({ queryKey: ['tables'] });
        queryClient.invalidateQueries({ queryKey: ['reservation-tables'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update table');
    },
  });
};

export const useDeleteTableMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tablesApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Table deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['tables'] });
        queryClient.invalidateQueries({ queryKey: ['reservation-tables'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete table');
    },
  });
};
