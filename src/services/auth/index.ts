import api from '../lib/api';
import { ROUTES } from '@/utils/constants';

export const authApi = {
  login: async (credentials: any) => {
    const { data } = await api.post(ROUTES.AUTH.LOGIN, credentials);
    return data;
  },

  signup: async (payload: any) => {
    const { data } = await api.post(ROUTES.AUTH.SIGNUP, payload);
    return data;
  },

  logout: async () => {
    const { data } = await api.post(ROUTES.AUTH.LOGOUT);
    return data;
  },

  me: async () => {
    const { data } = await api.get(ROUTES.AUTH.ME);
    return data;
  },

  refresh: async (refresh_token: string) => {
    const { data } = await api.post('/auth/refresh', { refresh_token });
    return data;
  }
};
