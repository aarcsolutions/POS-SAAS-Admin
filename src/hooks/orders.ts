import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/services/orders';
import {
  CreateOrderPayload,
  OrderStatus,
  OrderType,
  PaymentMethod,
} from '@/types/order.types';
import { toast } from 'sonner';

export const useOrdersQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus | '';
    order_type?: OrderType;
  } = {},
  options?: { pollMs?: number }
) =>
  useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getAll(params),
    refetchInterval: options?.pollMs,
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
        queryClient.invalidateQueries({ queryKey: ['kds'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update order status'
      );
    },
  });
};

export const useDispatchOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      driver_id,
    }: {
      id: string;
      driver_id: string;
    }) => ordersApi.dispatch(id, driver_id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Order dispatched');
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['kds'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to dispatch order'
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
