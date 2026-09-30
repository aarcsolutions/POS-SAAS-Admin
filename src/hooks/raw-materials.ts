import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rawMaterialsApi } from '@/services/raw-materials';
import { RawMaterialPayload } from '@/types/raw-material.types';
import { toast } from 'sonner';

export const useRawMaterialsQuery = (
  params: { page?: number; limit?: number; search?: string } = {}
) => {
  return useQuery({
    queryKey: ['raw-materials', params],
    queryFn: () => rawMaterialsApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateRawMaterialMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RawMaterialPayload) =>
      rawMaterialsApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Raw material created successfully');
        queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create raw material'
      );
    },
  });
};

export const useCreateRawMaterialsBulkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payloads: RawMaterialPayload[]) =>
      rawMaterialsApi.createBulk(payloads),
    onSuccess: (response) => {
      if (response.status) {
        const count = response?.data?.count ?? 0;
        toast.success(
          response.message ||
            `${count} raw material${count === 1 ? '' : 's'} created successfully`
        );
        queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to create raw materials'
      );
    },
  });
};

export const useUpdateRawMaterialMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: RawMaterialPayload & { id: string }) =>
      rawMaterialsApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Raw material updated successfully');
        queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update raw material'
      );
    },
  });
};

export const useDeleteRawMaterialMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rawMaterialsApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Raw material deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete raw material'
      );
    },
  });
};
