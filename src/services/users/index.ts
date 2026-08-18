import api from '../lib/api';
import { UsersListResponse } from '@/types/rbac.types';

export const usersApi = {
  getAll: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const { data } = await api.get<UsersListResponse>('/users/getAll', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/users/getById/${id}`);
    return data;
  },

  create: async (payload: {
    name: string;
    email: string;
    password: string;
    roleId: string;
  }) => {
    const { data } = await api.post('/users/create', payload);
    return data;
  },

  update: async (
    id: string,
    payload: {
      name?: string;
      email?: string;
      password?: string;
      roleId?: string;
    }
  ) => {
    const { data } = await api.put('/users/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/users/delete', { data: { id } });
    return data;
  },
};
