import api from '../lib/api';
import {
  QuickCreateReservationPayload,
  ReservationDetailResponse,
  ReservationPayload,
  ReservationsListResponse,
  RestaurantTableOption,
} from '@/types/reservation.types';

export const reservationsApi = {
  getAll: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      branch_id?: string;
      status?: string;
      date_from?: string;
      date_to?: string;
    } = {}
  ) => {
    const { data } = await api.get<ReservationsListResponse>(
      '/reservations/getAll',
      { params }
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ReservationDetailResponse>(
      `/reservations/getById/${id}`
    );
    return data;
  },

  getAllTables: async (branch_id?: string) => {
    const { data } = await api.get<{
      status: boolean;
      data: RestaurantTableOption[];
    }>('/reservations/getAllTables', {
      params: branch_id ? { branch_id } : undefined,
    });
    return data;
  },

  create: async (payload: ReservationPayload) => {
    const { data } = await api.post('/reservations/create', payload);
    return data;
  },

  quickCreate: async (payload: QuickCreateReservationPayload) => {
    const { data } = await api.post('/reservations/quickCreate', payload);
    return data;
  },

  markSeatedForOrder: async (id: string) => {
    const { data } = await api.post('/reservations/markSeatedForOrder', {
      id,
    });
    return data;
  },

  update: async (id: string, payload: Partial<ReservationPayload>) => {
    const { data } = await api.put('/reservations/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/reservations/delete', { data: { id } });
    return data;
  },
};
