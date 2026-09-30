import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashRegistersApi } from '@/services/cash-registers';
import { CashRegisterPayload } from '@/types/finance.types';
import { toast } from 'sonner';

export const useCashRegistersQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  } = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['cash-registers', params],
    queryFn: () => cashRegistersApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useCreateCashRegisterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CashRegisterPayload) =>
      cashRegistersApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Register created');
        queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create register'
      );
    },
  });
};

export const useUpdateCashRegisterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: CashRegisterPayload & { id: string }) =>
      cashRegistersApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Register updated');
        queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update register'
      );
    },
  });
};

export const useDeleteCashRegisterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cashRegistersApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Register deleted');
        queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete register'
      );
    },
  });
};

export const useOpenShiftMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { register_id: string; opening_cash: number }) =>
      cashRegistersApi.openShift(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Shift opened');
        queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to open shift');
    },
  });
};

export const useCloseShiftMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { shift_id: string; actual_cash: number }) =>
      cashRegistersApi.closeShift(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Shift closed');
        queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to close shift');
    },
  });
};

export const useCashDropMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      shift_id: string;
      amount: number;
      description?: string;
    }) => cashRegistersApi.cashDrop(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Cash drop recorded');
        queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
        queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
        queryClient.invalidateQueries({ queryKey: ['finance-accounts'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to record cash drop');
    },
  });
};

export const useCashAddMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      shift_id: string;
      amount: number;
      description?: string;
    }) => cashRegistersApi.cashAdd(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Cash add recorded');
        queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
        queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
        queryClient.invalidateQueries({ queryKey: ['finance-accounts'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to record cash add');
    },
  });
};
