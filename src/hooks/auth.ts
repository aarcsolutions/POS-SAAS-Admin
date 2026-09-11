import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

/**
 * Centralized Auth Hooks — tenant domain login
 */

export const useLoginMutation = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authApi.login(credentials),
    onSuccess: (response) => {
      if (response.status && response.data) {
        const { user, modules, access_token, refresh_token } = response.data;
        const Cookies = require('js-cookie');

        Cookies.set('access_token', access_token, { path: '/' });
        if (refresh_token) {
          Cookies.set('refresh_token', refresh_token, { path: '/' });
        }

        setAuth(user, modules || []);

        toast.success('Login successful');
        window.location.replace('/dashboard');
      } else {
        // Inline banner on login page — no toast for validation/login failure
      }
    },
    onError: () => {
      // Inline banner on login page handles credential errors
    },
  });
};

export const useLogoutMutation = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      const Cookies = require('js-cookie');
      Cookies.remove('access_token', { path: '/' });
      Cookies.remove('refresh_token', { path: '/' });
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      logout();
      window.location.replace('/login');
    },
  });
};

export const useVerifyPasswordMutation = () => {
  return useMutation({
    mutationFn: (current_password: string) =>
      authApi.verifyPassword(current_password),
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: {
      current_password: string;
      new_password: string;
    }) => authApi.changePassword(payload),
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update password';
      toast.error(
        Array.isArray(message) ? message.join(', ') : String(message),
      );
    },
  });
};
