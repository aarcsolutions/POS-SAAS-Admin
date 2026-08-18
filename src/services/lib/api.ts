import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { API_CONFIG, ROUTES } from '@/utils/constants';
import { useAuthStore } from '@/store/authStore';

/**
 * Global Axios Instance
 * Handles standard configuration and interceptors for all modules.
 */
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

export const TENANT_DISABLED_STORAGE_KEY = 'tenant_disabled_lock';
export const TENANT_DISABLED_MESSAGE =
  'Your account has been temporarily locked due to some reason. Kindly contact administrator for further details.';

function getResponseData(error: unknown): {
  errorCode?: string;
  message?: string | { message?: string; errorCode?: string };
} | undefined {
  return (error as AxiosError<{ errorCode?: string; message?: any }>)?.response?.data;
}

export function isTenantDisabledError(error: unknown): boolean {
  const data = getResponseData(error);
  if (!data) return false;
  if (data.errorCode === 'TENANT_DISABLED') return true;
  const nested =
    typeof data.message === 'object' && data.message
      ? data.message
      : null;
  if (nested?.errorCode === 'TENANT_DISABLED') return true;
  const msg =
    typeof data.message === 'string'
      ? data.message
      : typeof nested?.message === 'string'
        ? nested.message
        : '';
  return msg.toLowerCase().includes('temporarily locked');
}

export function getTenantDisabledMessage(error: unknown): string {
  const data = getResponseData(error);
  if (!data) return TENANT_DISABLED_MESSAGE;
  if (typeof data.message === 'string' && data.message) return data.message;
  if (
    typeof data.message === 'object' &&
    data.message &&
    typeof data.message.message === 'string'
  ) {
    return data.message.message;
  }
  return TENANT_DISABLED_MESSAGE;
}

function kickToLoginForTenantDisabled(error?: unknown) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      TENANT_DISABLED_STORAGE_KEY,
      getTenantDisabledMessage(error)
    );
  } catch {
    // ignore storage failures
  }
  Cookies.remove('access_token', { path: '/' });
  Cookies.remove('refresh_token', { path: '/' });
  useAuthStore.getState().logout();
  if (!window.location.pathname.startsWith('/login')) {
    window.location.replace('/login');
  }
}

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

function applySessionFromRefreshPayload(payload: any) {
  if (!payload?.access_token) return;

  Cookies.set('access_token', payload.access_token, { path: '/' });
  if (payload.refresh_token) {
    Cookies.set('refresh_token', payload.refresh_token, { path: '/' });
  }

  if (payload.user && Array.isArray(payload.modules)) {
    useAuthStore.getState().setAuth(payload.user, payload.modules);
  }
}

// Request Interceptor: Attach access_token from cookies
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Silent Refresh via tenantRefresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status === 403 && isTenantDisabledError(error)) {
      kickToLoginForTenantDisabled(error);
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes('/auth/tenantLogin') ||
        originalRequest.url?.includes('/auth/tenantRefresh')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get('refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        window.location.replace('/login');
        return Promise.reject(error);
      }

      try {
        const { data: envelope } = await axios.post(
          `${API_CONFIG.BASE_URL}${ROUTES.AUTH.REFRESH}`,
          { refresh_token: refreshToken }
        );

        const payload = envelope?.data ?? envelope;
        if (!payload?.access_token) {
          throw new Error('No access_token in refresh response');
        }

        applySessionFromRefreshPayload(payload);
        api.defaults.headers.common['Authorization'] = `Bearer ${payload.access_token}`;
        processQueue(null, payload.access_token);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${payload.access_token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        if (isTenantDisabledError(refreshError)) {
          kickToLoginForTenantDisabled(refreshError);
        } else {
          Cookies.remove('access_token', { path: '/' });
          Cookies.remove('refresh_token', { path: '/' });
          window.location.replace('/login');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
