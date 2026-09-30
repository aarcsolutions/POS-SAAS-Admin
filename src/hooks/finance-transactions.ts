import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeTransactionsApi } from '@/services/finance-transactions';
import { TransferPayload } from '@/types/finance.types';
import { toast } from 'sonner';

export const useFinanceTransactionsQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
    account_id?: string;
    direction?: string;
    transaction_type?: string;
    date_from?: string;
    date_to?: string;
  } = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['finance-transactions', params],
    queryFn: () => financeTransactionsApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useTransferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferPayload) =>
      financeTransactionsApi.transfer(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Transfer completed');
        queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
        queryClient.invalidateQueries({ queryKey: ['finance-accounts'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Transfer failed');
    },
  });
};

export const useVoidFinanceTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeTransactionsApi.void(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Transaction voided');
        queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
        queryClient.invalidateQueries({ queryKey: ['finance-accounts'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to void transaction'
      );
    },
  });
};
