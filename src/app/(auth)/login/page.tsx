'use client';

import { useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CircleDot,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useLoginMutation } from '@/hooks/auth';
import { authApi } from '@/services/auth';
import {
  TENANT_DISABLED_MESSAGE,
  TENANT_DISABLED_STORAGE_KEY,
  isTenantDisabledError,
  getTenantDisabledMessage,
  isBranchNotFoundError,
  getBranchNotFoundMessage,
} from '@/services/lib/api';

const LOCK_MESSAGE = TENANT_DISABLED_MESSAGE;

function getErrorMessage(err: unknown): string {
  if (isBranchNotFoundError(err)) {
    return getBranchNotFoundMessage(err);
  }
  if (isTenantDisabledError(err)) {
    return getTenantDisabledMessage(err);
  }
  const data = (err as { response?: { data?: { message?: string } }; message?: string })
    ?.response?.data;
  const msg = typeof data?.message === 'string' ? data.message : undefined;
  return (
    msg ||
    (err as { message?: string })?.message ||
    'Login failed. Please check your credentials.'
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('admin@pos.com');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [tenantName, setTenantName] = useState('Tenant Portal');
  const [tenantLoading, setTenantLoading] = useState(true);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockMessage, setLockMessage] = useState(LOCK_MESSAGE);

  const loginMutation = useLoginMutation();

  useEffect(() => {
    try {
      const lockedMsg = sessionStorage.getItem(TENANT_DISABLED_STORAGE_KEY);
      if (lockedMsg) {
        sessionStorage.removeItem(TENANT_DISABLED_STORAGE_KEY);
        setLockMessage(lockedMsg || LOCK_MESSAGE);
        setLockModalOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authApi.getTenantInfo();
        if (!cancelled && res.status && res.data?.title) {
          setTenantName(res.data.title);
          document.title = `${res.data.title} | Login`;
        }
      } catch (err) {
        if (!cancelled) {
          if (isTenantDisabledError(err)) {
            setLockMessage(getErrorMessage(err) || LOCK_MESSAGE);
            setLockModalOpen(true);
          }
          setTenantName('Tenant Portal');
        }
      } finally {
        if (!cancelled) setTenantLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loginMutation.error) return;
    if (
      isTenantDisabledError(loginMutation.error) ||
      isBranchNotFoundError(loginMutation.error)
    ) {
      setLockMessage(getErrorMessage(loginMutation.error) || LOCK_MESSAGE);
      setLockModalOpen(true);
    }
  }, [loginMutation.error]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setTouched({ email: true, password: true });
    if (validateForm()) {
      loginMutation.mutate({ email, password });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setErrors((prev) => ({ ...prev, email: 'Email is invalid' }));
    }
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    if (password && password.length < 6) {
      setErrors((prev) => ({
        ...prev,
        password: 'Password must be at least 6 characters',
      }));
    }
  };

  const showCredentialBanner =
    Boolean(loginMutation.error) && !isTenantDisabledError(loginMutation.error);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f7f1e6] via-[#f2e3cd] to-[#fff7ec] px-4 py-12 text-[#3e2a18]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -right-28 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-[#d7a469]/80 to-[#f4dcba]/50 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-[26rem] w-[26rem] rounded-full bg-gradient-to-tr from-[#b26407]/15 to-[#f6d29b]/15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[460px]">
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#8b5a2b] text-white shadow-[0_20px_50px_rgba(139,90,43,0.22)]">
            <CircleDot className="h-8 w-8" strokeWidth={2.5} />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#b0783d]">
            {tenantLoading ? '…' : tenantName}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#3e2a18]">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-[#6e553d]">
            Sign in to manage your store operations.
          </p>
        </div>

        <div className="relative rounded-[36px] border border-[#dec3a3] bg-white/95 p-10 shadow-[0_30px_70px_rgba(71,55,34,0.12)] ring-1 ring-[#f3e1cb]/60">
          {showCredentialBanner && (
            <div className="mb-6 rounded-3xl border border-[#f1c0a2] bg-[#fff1ec] p-4 text-sm text-[#9b2b0d]">
              {getErrorMessage(loginMutation.error)}
            </div>
          )}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold text-[#5f4b35]">
              Email address
            </label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Mail
                  className="h-5 w-5 text-[#7e6a54] transition-colors group-focus-within:text-[#a86b19]"
                  strokeWidth={1.5}
                />
              </div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                suppressHydrationWarning
                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-[#3b2a1b] placeholder:text-[#b79b7f] transition-all focus:outline-none focus:ring-4 ${
                  errors.email && touched.email
                    ? 'border-[#f0a38b] focus:border-[#c97a48] focus:ring-[#f3d2af]/50'
                    : 'border-[#e3d1be] focus:border-[#c47b1d] focus:ring-[#f5d4a5]/50'
                }`}
                placeholder="you@company.com"
              />
            </div>
            {errors.email && touched.email && (
              <div className="mt-2 flex items-center gap-1.5 text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="text-xs font-medium">{errors.email}</span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-semibold text-[#5f4b35]">
                Password
              </label>
              <a
                href="#"
                className="text-xs font-semibold text-[#9c5a0e] transition-colors hover:text-[#b76c10]"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock
                  className="h-5 w-5 text-[#7e6a54] transition-colors group-focus-within:text-[#a86b19]"
                  strokeWidth={1.5}
                />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                suppressHydrationWarning
                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-[#3b2a1b] placeholder:text-[#b79b7f] transition-all focus:outline-none focus:ring-4 ${
                  errors.password && touched.password
                    ? 'border-[#f0a38b] focus:border-[#c97a48] focus:ring-[#f3d2af]/50'
                    : 'border-[#e3d1be] focus:border-[#c47b1d] focus:ring-[#f5d4a5]/50'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                suppressHydrationWarning
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#7e6a54] transition-colors hover:text-[#5d3f1f]"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                ) : (
                  <Eye className="h-5 w-5" strokeWidth={1.5} />
                )}
              </button>
            </div>
            {errors.password && touched.password && (
              <div className="mt-2 flex items-center gap-1.5 text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="text-xs font-medium">{errors.password}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loginMutation.isPending || lockModalOpen}
            suppressHydrationWarning
            className="group relative flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#b45309] px-4 text-sm font-bold text-white shadow-[0_16px_40px_rgba(180,83,9,0.25)] transition-all hover:bg-[#8f3f08] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginMutation.isPending ? (
              <>
                <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span className="ml-2">Signing in...</span>
              </>
            ) : (
              <>
                <span className="relative z-10">Sign In</span>
                <ArrowRight
                  className="relative z-10 h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2.5}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </>
            )}
          </button>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#6e553d]">
              Tenant access is provisioned by your platform administrator.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-[#7e6a54]">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#b45309]" strokeWidth={2} />
            <p>Secure, encrypted connection</p>
          </div>
        </div>
      </div>

      {lockModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#3e2a18]/45 px-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setLockModalOpen(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="tenant-lock-title"
            aria-describedby="tenant-lock-desc"
            className="w-full max-w-md rounded-3xl border border-[#ecd6b6] bg-[#fff7ee] p-6 shadow-[0_24px_60px_rgba(91,59,30,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fde5c5]">
                <ShieldAlert className="h-6 w-6 text-[#d97706]" />
              </div>
              <h2 id="tenant-lock-title" className="text-xl font-bold text-[#3e2a18]">
                Account Locked
              </h2>
            </div>
            <p id="tenant-lock-desc" className="mb-6 text-sm leading-relaxed text-[#7a553d]">
              {lockMessage}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                autoFocus
                onClick={() => setLockModalOpen(false)}
                className="rounded-xl bg-[#d97706] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#d97706]/20 transition hover:bg-[#b45309]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
