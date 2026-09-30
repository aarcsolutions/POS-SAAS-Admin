import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeAccountsApi } from '@/services/finance-accounts';
import { FinanceAccountPayload } from '@/types/finance.types';
import { toast } from 'sonner';

export const useFinanceAccountsQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  } = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['finance-accounts', params],
    queryFn: () => financeAccountsApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useCreateFinanceAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FinanceAccountPayload) =>
      financeAccountsApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Account created');
        queryClient.invalidateQueries({ queryKey: ['finance-accounts'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create account'
      );
    },
  });
};

export const useUpdateFinanceAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: FinanceAccountPayload & { id: string }) =>
      financeAccountsApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Account updated');
        queryClient.invalidateQueries({ queryKey: ['finance-accounts'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update account'
      );
    },
  });
};

export const useDeleteFinanceAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeAccountsApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Account deleted');
        queryClient.invalidateQueries({ queryKey: ['finance-accounts'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete account'
      );
    },
  });
};

export const useRecalculateBalanceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeAccountsApi.recalculateBalance(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Balance recalculated');
        queryClient.invalidateQueries({ queryKey: ['finance-accounts'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to recalculate balance'
      );
    },
  });
};
