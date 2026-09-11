'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  UserRound,
  Mail,
  Shield,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/auth';
import {
  useChangePasswordMutation,
  useVerifyPasswordMutation,
} from '@/hooks/auth';
import { toast } from 'sonner';

type PasswordStep = 'verify' | 'otp' | 'password' | 'success';
type PasswordMode = 'known' | 'otp';

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

export default function MyAccountPage() {
  const user = useAuthStore((s) => s.user);
  const verifyMutation = useVerifyPasswordMutation();
  const changeMutation = useChangePasswordMutation();

  const [step, setStep] = useState<PasswordStep>('verify');
  const [mode, setMode] = useState<PasswordMode>('known');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
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

  useEffect(() => {
    resetFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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

  const infoRows = [
    { label: 'Name', value: user?.name || '—', icon: UserRound },
    { label: 'Email', value: user?.email || '—', icon: Mail },
    { label: 'Role', value: user?.role || '—', icon: Shield },
    {
      label: 'Branch',
      value: user?.branchId ? 'Branch-scoped' : 'Tenant-wide',
      icon: Building2,
    },
    {
      label: 'Tenant',
      value: user?.tenantName || user?.tenantSlug || '—',
      icon: Building2,
    },
  ];

  const resetFlow = () => {
    setStep('verify');
    setMode('known');
    setCurrentPassword('');
    setShowCurrent(false);
    setMaskedEmail('');
    setOtp('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setResendSeconds(0);
    setLoading(false);
  };

  const handleVerifyCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!currentPassword.trim()) {
      setError('Current password is required');
      return;
    }
    try {
      await verifyMutation.mutateAsync(currentPassword);
      setMode('known');
      setNewPassword('');
      setConfirmPassword('');
      setStep('password');
    } catch (err) {
      setError(getErrorMessage(err, 'Current password is incorrect'));
    }
  };

  const handleSendOtp = async () => {
    setError('');
    if (!user?.email) {
      setError('Account email not found');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(user.email);
      const payload = res?.data ?? res;
      setMaskedEmail(payload?.masked_email || user.email);
      setResendSeconds(Number(payload?.resend_after_seconds || 45));
      setOtp('');
      setMode('otp');
      setStep('otp');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send OTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || loading || !user?.email) return;
    setError('');
    setLoading(true);
    try {
      const res = await authApi.resendOtp(user.email);
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
    if (!user?.email) {
      setError('Account email not found');
      return;
    }
    if (!otp.trim()) {
      setError('OTP is required');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({
        email: user.email,
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

  const handleSavePassword = async (e: React.FormEvent) => {
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

    if (mode === 'known') {
      try {
        await changeMutation.mutateAsync({
          current_password: currentPassword,
          new_password: newPassword,
        });
        setStep('success');
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to update password'));
      }
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast.success('Password updated successfully');
      setStep('success');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reset password'));
    } finally {
      setLoading(false);
    }
  };

  const busy =
    loading || verifyMutation.isPending || changeMutation.isPending;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Account
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View your profile and update your password
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Profile</h2>
            <p className="text-sm text-slate-500">Your account information</p>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          {infoRows.map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
            >
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <row.icon className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                {row.label}
              </dt>
              <dd className="mt-1 truncate text-sm font-semibold text-slate-800">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Change password</h2>
            <p className="text-sm text-slate-500">
              Verify your current password, then set a new one
            </p>
          </div>
        </div>

        {step === 'verify' && (
          <form onSubmit={handleVerifyCurrent} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Current password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setError('');
                  }}
                  autoComplete="current-password"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 pr-11 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="mt-1.5 flex justify-end">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={busy || !user?.email}
                  className="text-xs font-semibold text-[var(--brand-primary)] hover:underline disabled:opacity-50"
                >
                  {loading ? 'Sending OTP…' : 'Forgot password?'}
                </button>
              </div>
            </div>

            {error ? (
              <p className="text-xs font-medium text-rose-600">{error}</p>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white hover:brightness-95 disabled:opacity-60"
              >
                {verifyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Verify password
              </button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="rounded-xl border border-[var(--brand-primary-soft)] bg-[var(--brand-primary-soft)] px-3 py-2 text-sm font-medium text-[var(--brand-primary-dark)]">
              We&apos;ve sent a 6-digit OTP to your email{' '}
              <span className="font-semibold">{maskedEmail}</span>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                OTP
              </label>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-center text-lg font-bold tracking-[0.35em] outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                  placeholder="______"
                  autoComplete="one-time-code"
                />
              </div>
            </div>
            {error ? (
              <p className="text-xs font-medium text-rose-600">{error}</p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendSeconds > 0 || busy}
                  className="font-semibold text-[var(--brand-primary)] disabled:opacity-50"
                >
                  Resend OTP
                </button>
                <span className="text-slate-500">
                  {resendSeconds > 0
                    ? `Resend in ${countdownLabel}`
                    : 'You can resend now'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetFlow}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white hover:brightness-95 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Verify OTP
                </button>
              </div>
            </div>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--brand-primary-soft)] bg-[var(--brand-primary-soft)] px-3 py-2 text-sm font-medium text-[var(--brand-primary-dark)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--brand-primary)]" />
              {mode === 'otp'
                ? 'OTP verified. Set your new password below.'
                : 'Current password verified. Set your new password below.'}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                New password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError('');
                  }}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 pr-11 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 pr-11 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <ul className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              {passwordChecks.map((c) => (
                <li
                  key={c.label}
                  className={`flex items-center gap-2 text-xs font-medium ${
                    c.ok ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {c.label}
                </li>
              ))}
            </ul>

            {error ? (
              <p className="text-xs font-medium text-rose-600">{error}</p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={resetFlow}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white hover:brightness-95 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {mode === 'otp' ? 'Reset password' : 'Update password'}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="space-y-4 text-center sm:text-left">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Password updated successfully.
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={resetFlow}
                className="rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white hover:brightness-95"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
