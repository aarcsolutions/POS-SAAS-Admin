import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cateringApi } from '@/services/catering';
import { CateringEventPayload } from '@/types/catering.types';
import { toast } from 'sonner';

export const useCateringEventsQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
    status?: string;
    venue_type?: string;
    date_from?: string;
    date_to?: string;
  } = {}
) => {
  return useQuery({
    queryKey: ['catering-events', params],
    queryFn: () => cateringApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useCateringEventByIdQuery = (
  id: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: ['catering-events', id],
    queryFn: () => cateringApi.getById(id!),
    enabled: Boolean(id) && enabled,
  });
};

export const useCreateCateringEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CateringEventPayload) => cateringApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Catering event created successfully');
        queryClient.invalidateQueries({ queryKey: ['catering-events'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create catering event'
      );
    },
  });
};

export const useUpdateCateringEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: CateringEventPayload & { id: string }) =>
      cateringApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Catering event updated successfully');
        queryClient.invalidateQueries({ queryKey: ['catering-events'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update catering event'
      );
    },
  });
};

export const useDeleteCateringEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cateringApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Catering event deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['catering-events'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete catering event'
      );
    },
  });
};
