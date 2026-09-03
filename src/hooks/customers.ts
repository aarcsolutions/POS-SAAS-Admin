import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/services/customers';
import { CustomerPayload } from '@/types/customer.types';
import { toast } from 'sonner';

export const useCustomersQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  } = {}
) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CustomerPayload) => customersApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Customer created successfully');
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create customer');
    },
  });
};

export const useUpdateCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: CustomerPayload & { id: string }) => customersApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Customer updated successfully');
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update customer');
    },
  });
};

export const useDeleteCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Customer deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete customer');
    },
  });
};
