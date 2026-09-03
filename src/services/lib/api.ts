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

export const BRANCH_NOT_FOUND_MESSAGE = 'This branch does not exist';

function getResponseData(error: unknown): {
  errorCode?: string;
  message?: string | { message?: string; errorCode?: string };
} | undefined {
  return (error as AxiosError<{ errorCode?: string; message?: any }>)?.response?.data;
}

function hasErrorCode(error: unknown, code: string): boolean {
  const data = getResponseData(error);
  if (!data) return false;
  if (data.errorCode === code) return true;
  const nested =
    typeof data.message === 'object' && data.message
      ? data.message
      : null;
  return nested?.errorCode === code;
}

export function isTenantDisabledError(error: unknown): boolean {
  if (hasErrorCode(error, 'TENANT_DISABLED')) return true;
  const data = getResponseData(error);
  if (!data) return false;
  const nested =
    typeof data.message === 'object' && data.message
      ? data.message
      : null;
  const msg =
    typeof data.message === 'string'
      ? data.message
      : typeof nested?.message === 'string'
        ? nested.message
        : '';
  return msg.toLowerCase().includes('temporarily locked');
}

export function isBranchNotFoundError(error: unknown): boolean {
  if (hasErrorCode(error, 'BRANCH_NOT_FOUND')) return true;
  const data = getResponseData(error);
  if (!data) return false;
  const nested =
    typeof data.message === 'object' && data.message
      ? data.message
      : null;
  const msg =
    typeof data.message === 'string'
      ? data.message
      : typeof nested?.message === 'string'
        ? nested.message
        : '';
  return msg.toLowerCase().includes('branch does not exist');
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

export function getBranchNotFoundMessage(error: unknown): string {
  const data = getResponseData(error);
  if (!data) return BRANCH_NOT_FOUND_MESSAGE;
  if (typeof data.message === 'string' && data.message) return data.message;
  if (
    typeof data.message === 'object' &&
    data.message &&
    typeof data.message.message === 'string'
  ) {
    return data.message.message;
  }
  return BRANCH_NOT_FOUND_MESSAGE;
}

function kickToLoginWithMessage(message: string) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(TENANT_DISABLED_STORAGE_KEY, message);
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

function kickToLoginForTenantDisabled(error?: unknown) {
  kickToLoginWithMessage(getTenantDisabledMessage(error));
}

function kickToLoginForBranchNotFound(error?: unknown) {
  kickToLoginWithMessage(getBranchNotFoundMessage(error));
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

function getTenantIdFromAccessToken(): string | undefined {
  const token = Cookies.get('access_token');
  if (!token) return undefined;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.tenantId || payload.tenant_id;
  } catch {
    return undefined;
  }
}

// Request Interceptor: Attach access_token and tenant_id for tenant-scoped APIs
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const tenantId =
      useAuthStore.getState().user?.tenantId || getTenantIdFromAccessToken();
    if (tenantId) {
      config.headers.tenant_id = tenantId;
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

    if (status === 403 && isBranchNotFoundError(error)) {
      kickToLoginForBranchNotFound(error);
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
        } else if (isBranchNotFoundError(refreshError)) {
          kickToLoginForBranchNotFound(refreshError);
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
