export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
};

export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/tenantLogin',
    LOGOUT: '/auth/tenantLogout',
    REFRESH: '/auth/tenantRefresh',
    TENANT_INFO: '/auth/tenantInfo',
  },
};
