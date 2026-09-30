import api from '../lib/api';
import {
  ExpenseCategoryPayload,
  ExpensePayload,
} from '@/types/finance.types';

export const expensesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  }) => {
    const { data } = await api.get('/expenses/getAll', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/expenses/getById/${id}`);
    return data;
  },

  create: async (payload: ExpensePayload) => {
    const { data } = await api.post('/expenses/create', payload);
    return data;
  },

  update: async (id: string, payload: Partial<ExpensePayload>) => {
    const { data } = await api.put('/expenses/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/expenses/delete', { data: { id } });
    return data;
  },

  void: async (id: string) => {
    const { data } = await api.post('/expenses/void', { id });
    return data;
  },

  getCategories: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const { data } = await api.get('/expenses/categories/getAll', { params });
    return data;
  },

  createCategory: async (payload: ExpenseCategoryPayload) => {
    const { data } = await api.post('/expenses/categories/create', payload);
    return data;
  },

  updateCategory: async (
    id: string,
    payload: Partial<ExpenseCategoryPayload>
  ) => {
    const { data } = await api.put('/expenses/categories/update', {
      id,
      ...payload,
    });
    return data;
  },

  deleteCategory: async (id: string) => {
    const { data } = await api.delete('/expenses/categories/delete', {
      data: { id },
    });
    return data;
  },
};
