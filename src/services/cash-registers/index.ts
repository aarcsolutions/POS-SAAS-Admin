import api from '../lib/api';
import { CashRegisterPayload } from '@/types/finance.types';

export const cashRegistersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  }) => {
    const { data } = await api.get('/cash-registers/getAll', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/cash-registers/getById/${id}`);
    return data;
  },

  create: async (payload: CashRegisterPayload) => {
    const { data } = await api.post('/cash-registers/create', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CashRegisterPayload>) => {
    const { data } = await api.put('/cash-registers/update', {
      id,
      ...payload,
    });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/cash-registers/delete', {
      data: { id },
    });
    return data;
  },

  openShift: async (payload: { register_id: string; opening_cash: number }) => {
    const { data } = await api.post('/cash-registers/openShift', payload);
    return data;
  },

  closeShift: async (payload: { shift_id: string; actual_cash: number }) => {
    const { data } = await api.post('/cash-registers/closeShift', payload);
    return data;
  },

  getShiftById: async (id: string) => {
    const { data } = await api.get(`/cash-registers/getShiftById/${id}`);
    return data;
  },

  cashDrop: async (payload: {
    shift_id: string;
    amount: number;
    description?: string;
  }) => {
    const { data } = await api.post('/cash-registers/cashDrop', payload);
    return data;
  },

  cashAdd: async (payload: {
    shift_id: string;
    amount: number;
    description?: string;
  }) => {
    const { data } = await api.post('/cash-registers/cashAdd', payload);
    return data;
  },
};
