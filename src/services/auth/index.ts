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
        theme?: {
          primary_color: string;
          primary_dark: string;
          accent_color: string;
          gold_color: string;
          icon_color?: string;
          chart_color?: string;
          chart_secondary?: string;
          toast_color?: string;
          logo_url: string | null;
        };
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

  verifyPassword: async (current_password: string) => {
    const { data } = await api.post(ROUTES.AUTH.VERIFY_PASSWORD, {
      current_password,
    });
    return data;
  },

  changePassword: async (payload: {
    current_password: string;
    new_password: string;
  }) => {
    const { data } = await api.post(ROUTES.AUTH.CHANGE_PASSWORD, payload);
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post(
      ROUTES.AUTH.FORGOT_PASSWORD,
      { email },
      { headers: { domain: getTenantDomain() } }
    );
    return data;
  },

  resendOtp: async (email: string) => {
    const { data } = await api.post(
      ROUTES.AUTH.RESEND_OTP,
      { email },
      { headers: { domain: getTenantDomain() } }
    );
    return data;
  },

  verifyOtp: async (payload: { email: string; otp: string }) => {
    const { data } = await api.post(ROUTES.AUTH.VERIFY_OTP, payload, {
      headers: { domain: getTenantDomain() },
    });
    return data;
  },

  resetPassword: async (payload: {
    reset_token: string;
    new_password: string;
    confirm_password: string;
  }) => {
    const { data } = await api.post(ROUTES.AUTH.RESET_PASSWORD, payload, {
      headers: { domain: getTenantDomain() },
    });
    return data;
  },
};
