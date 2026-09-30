import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '@/services/expenses';
import {
  ExpenseCategoryPayload,
  ExpensePayload,
} from '@/types/finance.types';
import { toast } from 'sonner';

export const useExpensesQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  } = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expensesApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useExpenseCategoriesQuery = (
  params: { page?: number; limit?: number; search?: string } = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['expense-categories', params],
    queryFn: () => expensesApi.getCategories(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExpensePayload) => expensesApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Expense created');
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        queryClient.invalidateQueries({ queryKey: ['finance-accounts'] });
        queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create expense'
      );
    },
  });
};

export const useUpdateExpenseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: ExpensePayload & { id: string }) =>
      expensesApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Expense updated');
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update expense'
      );
    },
  });
};

export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Expense deleted');
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        queryClient.invalidateQueries({ queryKey: ['finance-accounts'] });
        queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete expense'
      );
    },
  });
};

export const useCreateExpenseCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExpenseCategoryPayload) =>
      expensesApi.createCategory(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Category created');
        queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create category'
      );
    },
  });
};

export const useDeleteExpenseCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.deleteCategory(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Category deleted');
        queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete category'
      );
    },
  });
};
