import { useQuery } from '@tanstack/react-query';
import { financeReceivablesApi } from '@/services/finance-receivables';

export const useFinanceReceivablesQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  } = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['finance-receivables', params],
    queryFn: () => financeReceivablesApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useFinanceReceivableQuery = (id: string | null, enabled = true) =>
  useQuery({
    queryKey: ['finance-receivables', id],
    queryFn: () => financeReceivablesApi.getById(id!),
    enabled: !!id && enabled,
  });
