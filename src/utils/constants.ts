export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
};

export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/tenantLogin',
    LOGOUT: '/auth/tenantLogout',
    REFRESH: '/auth/tenantRefresh',
    TENANT_INFO: '/auth/tenantInfo',
    VERIFY_PASSWORD: '/auth/tenantVerifyPassword',
    CHANGE_PASSWORD: '/auth/tenantChangePassword',
    FORGOT_PASSWORD: '/auth/tenantForgotPassword',
    RESEND_OTP: '/auth/tenantResendOtp',
    VERIFY_OTP: '/auth/tenantVerifyOtp',
    RESET_PASSWORD: '/auth/tenantResetPassword',
  },
};
