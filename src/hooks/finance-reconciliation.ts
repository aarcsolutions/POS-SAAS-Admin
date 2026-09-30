import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeReconciliationApi } from '@/services/finance-reconciliation';
import { CreateBankStatementPayload } from '@/types/finance.types';
import { toast } from 'sonner';

export const useFinanceReconciliationQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  } = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['finance-reconciliation', params],
    queryFn: () => financeReconciliationApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useFinanceStatementQuery = (id: string | null, enabled = true) =>
  useQuery({
    queryKey: ['finance-reconciliation', id],
    queryFn: () => financeReconciliationApi.getById(id!),
    enabled: !!id && enabled,
  });

export const useCreateBankStatementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBankStatementPayload) =>
      financeReconciliationApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Statement created');
        queryClient.invalidateQueries({
          queryKey: ['finance-reconciliation'],
        });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create statement'
      );
    },
  });
};

export const useMatchStatementLineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      line_id: string;
      finance_transaction_id: string;
    }) => financeReconciliationApi.match(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Line matched');
        queryClient.invalidateQueries({
          queryKey: ['finance-reconciliation'],
        });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to match line');
    },
  });
};

export const useUnmatchStatementLineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (line_id: string) =>
      financeReconciliationApi.unmatch({ line_id }),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Line unmatched');
        queryClient.invalidateQueries({
          queryKey: ['finance-reconciliation'],
        });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to unmatch line'
      );
    },
  });
};

export const useReconcileStatementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeReconciliationApi.reconcile({ id }),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Statement reconciled');
        queryClient.invalidateQueries({
          queryKey: ['finance-reconciliation'],
        });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to reconcile statement'
      );
    },
  });
};

export const useReopenStatementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeReconciliationApi.reopen({ id }),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Statement reopened');
        queryClient.invalidateQueries({
          queryKey: ['finance-reconciliation'],
        });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to reopen statement'
      );
    },
  });
};
