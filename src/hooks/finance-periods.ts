import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financePeriodsApi } from '@/services/finance-periods';
import { CreateFinancePeriodPayload } from '@/types/finance.types';
import { toast } from 'sonner';

export const useFinancePeriodsQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  } = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['finance-periods', params],
    queryFn: () => financePeriodsApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useCreateFinancePeriodMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFinancePeriodPayload) =>
      financePeriodsApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Period created');
        queryClient.invalidateQueries({ queryKey: ['finance-periods'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create period'
      );
    },
  });
};

export const useCloseFinancePeriodMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financePeriodsApi.close({ id }),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Period closed');
        queryClient.invalidateQueries({ queryKey: ['finance-periods'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to close period');
    },
  });
};

export const useReopenFinancePeriodMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financePeriodsApi.reopen({ id }),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Period reopened');
        queryClient.invalidateQueries({ queryKey: ['finance-periods'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to reopen period'
      );
    },
  });
};
