import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driversApi } from '@/services/drivers';
import { DriverPayload } from '@/types/driver.types';
import { toast } from 'sonner';

export const useDriversQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  } = {}
) => {
  return useQuery({
    queryKey: ['drivers', params],
    queryFn: () => driversApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateDriverMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DriverPayload) => driversApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Driver created successfully');
        queryClient.invalidateQueries({ queryKey: ['drivers'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create driver');
    },
  });
};

export const useUpdateDriverMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: DriverPayload & { id: string }) => driversApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Driver updated successfully');
        queryClient.invalidateQueries({ queryKey: ['drivers'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update driver');
    },
  });
};

export const useDeleteDriverMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => driversApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Driver deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['drivers'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete driver');
    },
  });
};
