import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financePayablesApi } from '@/services/finance-payables';
import { PayPayablePayload } from '@/types/finance.types';
import { toast } from 'sonner';

export const useFinancePayablesQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  } = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['finance-payables', params],
    queryFn: () => financePayablesApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useFinancePayableQuery = (id: string | null, enabled = true) =>
  useQuery({
    queryKey: ['finance-payables', id],
    queryFn: () => financePayablesApi.getById(id!),
    enabled: !!id && enabled,
  });

export const usePayPayableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayPayablePayload) => financePayablesApi.pay(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Payment recorded');
        queryClient.invalidateQueries({ queryKey: ['finance-payables'] });
        queryClient.invalidateQueries({ queryKey: ['finance-accounts'] });
        queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to record payment'
      );
    },
  });
};

export const useVoidPayablePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financePayablesApi.voidPayment({ id }),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Payment voided');
        queryClient.invalidateQueries({ queryKey: ['finance-payables'] });
        queryClient.invalidateQueries({ queryKey: ['finance-accounts'] });
        queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to void payment'
      );
    },
  });
};
