import api from '../lib/api';
import { ROUTES } from '@/utils/constants';
import { getTenantDomain } from '@/utils/env';

export { getTenantDomain };

export const authApi = {
  getTenantInfo: async () => {
    const { data } = await api.get(ROUTES.AUTH.TENANT_INFO, {
      headers: { domain: getTenantDomain() },
    });
    return data as {
      status: boolean;
      message: string;
      data: {
        id: string;
        title: string;
        slug: string;
        description?: string | null;
      };
    };
  },

  login: async (credentials: { email: string; password: string }) => {
    const { data } = await api.post(ROUTES.AUTH.LOGIN, credentials, {
      headers: { domain: getTenantDomain() },
    });
    return data;
  },

  logout: async () => {
    const { data } = await api.post(ROUTES.AUTH.LOGOUT);
    return data;
  },

  refresh: async (refresh_token: string) => {
    const { data } = await api.post(ROUTES.AUTH.REFRESH, { refresh_token });
    return data;
  },
};
