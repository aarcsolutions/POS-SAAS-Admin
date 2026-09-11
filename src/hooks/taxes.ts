import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxesApi } from '@/services/taxes';
import { TaxPayload } from '@/types/tax.types';
import { toast } from 'sonner';

export const useTaxesQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  } = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ['taxes', params],
    queryFn: () => taxesApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateTaxMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaxPayload) => taxesApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Tax created');
        queryClient.invalidateQueries({ queryKey: ['taxes'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create tax');
    },
  });
};

export const useUpdateTaxMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: TaxPayload & { id: string }) =>
      taxesApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Tax updated');
        queryClient.invalidateQueries({ queryKey: ['taxes'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update tax');
    },
  });
};

export const useDeleteTaxMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taxesApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Tax deleted');
        queryClient.invalidateQueries({ queryKey: ['taxes'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete tax');
    },
  });
};
