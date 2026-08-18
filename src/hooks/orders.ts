import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/services/orders';
import {
  CreateOrderPayload,
  OrderStatus,
  PaymentMethod,
} from '@/types/order.types';
import { toast } from 'sonner';

export const useOrdersQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus | '';
  } = {}
) =>
  useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });

export const useOrderDetailQuery = (id: string | null) =>
  useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.getById(id!),
    enabled: !!id,
  });

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Order created');
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create order');
    },
  });
};

export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Status updated');
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update order status'
      );
    },
  });
};

export const useRecordPaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      order_id: string;
      method: PaymentMethod;
      amount?: number;
    }) => ordersApi.recordPayment(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Payment recorded');
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to record payment'
      );
    },
  });
};
