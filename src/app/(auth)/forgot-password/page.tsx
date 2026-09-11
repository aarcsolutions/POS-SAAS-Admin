'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { authApi } from '@/services/auth';
import { applyThemeToDocument } from '@/components/providers/ThemeProvider';
import { THEME_COLOR_DEFAULTS } from '@/constants/theme-defaults';

type Step = 'email' | 'otp' | 'password' | 'success';

function getErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data;
  const msg = data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return (err as { message?: string })?.message || fallback;
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must include 1 uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must include 1 number';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'Password must include 1 special character';
  }
  return null;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [tenantName, setTenantName] = useState('Tenant Portal');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authApi.getTenantInfo();
        if (!cancelled && res.status && res.data) {
          if (res.data.title) setTenantName(res.data.title);
          if (res.data.theme) {
            applyThemeToDocument({
              ...THEME_COLOR_DEFAULTS,
              ...res.data.theme,
            } as any);
            setLogoUrl(res.data.theme.logo_url || null);
          }
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => {
      setResendSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  const countdownLabel = useMemo(() => {
    const m = Math.floor(resendSeconds / 60);
    const s = resendSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [resendSeconds]);

  const passwordChecks = [
    { ok: newPassword.length >= 8, label: 'At least 8 characters' },
    { ok: /[A-Z]/.test(newPassword), label: '1 uppercase letter' },
    { ok: /[0-9]/.test(newPassword), label: '1 number' },
    {
      ok: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
      label: '1 special character',
    },
  ];

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      const payload = res?.data ?? res;
      setMaskedEmail(payload?.masked_email || email.trim());
      setResendSeconds(Number(payload?.resend_after_seconds || 45));
      setOtp('');
      setStep('otp');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send OTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await authApi.resendOtp(email.trim());
      const payload = res?.data ?? res;
      setMaskedEmail(payload?.masked_email || maskedEmail);
      setResendSeconds(Number(payload?.resend_after_seconds || 45));
      setOtp('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to resend OTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) {
      setError('OTP is required');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({
        email: email.trim(),
        otp: otp.trim(),
      });
      const payload = res?.data ?? res;
      if (!payload?.reset_token) {
        throw new Error('Reset token missing from response');
      }
      setResetToken(payload.reset_token);
      setNewPassword('');
      setConfirmPassword('');
      setStep('password');
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const policyError = validatePassword(newPassword);
    if (policyError) {
      setError(policyError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setStep('success');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reset password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--admin-bg,#f8fafc)] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[var(--admin-border,#e2e8f0)] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-10 w-10 rounded-lg object-contain" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary-soft,#ffedd5)] text-[var(--brand-primary,#d97706)]">
              <KeyRound className="h-5 w-5" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-[var(--brand-primary-dark,#0f172a)]">
              {step === 'success' ? 'Password Reset Successfully' : 'Forgot Password'}
            </h1>
            <p className="text-xs text-[var(--admin-muted,#64748b)]">{tenantName}</p>
          </div>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <p className="text-sm text-[var(--admin-muted,#64748b)]">
              Enter your registered email address and we will send a 6-digit OTP.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--brand-primary-dark)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="h-11 w-full rounded-xl border border-[var(--admin-border)] bg-white pl-10 pr-3 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </div>
            {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white hover:brightness-95 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Send OTP
            </button>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to login
            </Link>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="rounded-xl border border-[var(--brand-primary-soft)] bg-[var(--brand-primary-soft)]/40 px-3 py-2 text-sm text-[var(--brand-primary-dark)]">
              We&apos;ve sent a 6-digit OTP to your email{' '}
              <span className="font-semibold">{maskedEmail}</span>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--brand-primary-dark)]">
                OTP
              </label>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  className="h-11 w-full rounded-xl border border-[var(--admin-border)] bg-white pl-10 pr-3 text-center text-lg font-bold tracking-[0.35em] outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                  placeholder="______"
                  autoComplete="one-time-code"
                />
              </div>
            </div>
            {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white hover:brightness-95 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Verify OTP
            </button>
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendSeconds > 0 || loading}
                className="font-semibold text-[var(--brand-primary)] disabled:opacity-50"
              >
                Resend OTP
              </button>
              <span className="text-[var(--admin-muted)]">
                {resendSeconds > 0 ? `Resend in ${countdownLabel}` : 'You can resend now'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError('');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--admin-muted)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Change email
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-[var(--admin-muted)]">
              Create a new password for your account.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--brand-primary-dark)]">
                New Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError('');
                  }}
                  className="h-11 w-full rounded-xl border border-[var(--admin-border)] bg-white pl-10 pr-11 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--brand-primary-dark)]">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  className="h-11 w-full rounded-xl border border-[var(--admin-border)] bg-white pl-10 pr-11 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <ul className="space-y-1 rounded-xl border border-[var(--admin-border)] bg-slate-50 px-3 py-2">
              {passwordChecks.map((c) => (
                <li
                  key={c.label}
                  className={`flex items-center gap-2 text-xs font-medium ${
                    c.ok ? 'text-emerald-600' : 'text-[var(--admin-muted)]'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {c.label}
                </li>
              ))}
            </ul>
            {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white hover:brightness-95 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Reset Password
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="text-sm text-[var(--admin-muted)]">
              Your password has been updated successfully.
            </p>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white hover:brightness-95"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
