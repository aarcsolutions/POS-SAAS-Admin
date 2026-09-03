import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/services/payments';
import { PaymentTab } from '@/types/payment.types';

export const usePaymentsQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    tab?: PaymentTab;
    status?: string;
    method?: string;
    branch_id?: string;
  } = {}
) =>
  useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentsApi.getAll(params),
    placeholderData: (previousData) => previousData,
    retry: 1,
    staleTime: 30_000,
  });

export const usePaymentDetailQuery = (id: string | null) =>
  useQuery({
    queryKey: ['payments', 'detail', id],
    queryFn: () => paymentsApi.getById(id!),
    enabled: Boolean(id),
  });
