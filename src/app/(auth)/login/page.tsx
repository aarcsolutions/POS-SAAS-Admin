'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CircleDot, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLoginMutation } from '@/hooks/auth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('admin@pos.com');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const loginMutation = useLoginMutation();

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
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (touched.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Email is invalid' }));
    }
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    if (password && password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-stone-100 px-4 py-12 text-slate-800">
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-emerald-200/40 to-emerald-100/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-amber-200/40 to-amber-100/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-100/20 to-purple-100/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[420px]">
        {/* Logo / Brand */}
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-xl shadow-emerald-600/25 ring-4 ring-white/50 backdrop-blur-sm">
            <CircleDot className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Admin Portal
          </h1>
          <p className="text-base text-slate-600 font-medium">
            Sign in to manage your business
          </p>
        </div>

        {/* Card */}
        <div className="relative rounded-3xl border border-slate-200/60 bg-white/90 p-9 shadow-2xl shadow-slate-200/60 backdrop-blur-xl ring-1 ring-white/20">
          {loginMutation.error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50/80 p-4 text-red-700 border border-red-200/60">
              <AlertCircle className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
              <span className="text-sm font-medium">
                {loginMutation.error.message || 'Login failed. Please check your credentials.'}
              </span>
            </div>
          )}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Email address
            </label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" strokeWidth={1.5} />
              </div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all ${
                  errors.email && touched.email
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
                placeholder="you@company.com"
              />
              {errors.email && touched.email && (
                <div className="mt-2 flex items-center gap-1.5 text-red-600">
                  <AlertCircle className="h-4 w-4" strokeWidth={2} />
                  <span className="text-xs font-medium">{errors.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <a href="#" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" strokeWidth={1.5} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all ${
                  errors.password && touched.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors group-focus-within:text-emerald-500"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                ) : (
                  <Eye className="h-5 w-5" strokeWidth={1.5} />
                )}
              </button>
              {errors.password && touched.password && (
                <div className="mt-2 flex items-center gap-1.5 text-red-600">
                  <AlertCircle className="h-4 w-4" strokeWidth={2} />
                  <span className="text-xs font-medium">{errors.password}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loginMutation.isPending}
            className="relative flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:from-emerald-700 hover:to-emerald-800 hover:shadow-emerald-600/35 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 group"
          >
            {loginMutation.isPending ? (
              <>
                <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span className="ml-2">Signing in...</span>
              </>
            ) : (
              <>
                <span className="relative z-10">Sign In</span>
                <ArrowRight className="h-4.5 w-4.5 relative z-10 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </button>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link 
                href="/signup" 
                className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors underline decoration-2 underline-offset-2 hover:underline-offset-4"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-slate-400">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
            <p>Secure, encrypted connection</p>
          </div>
        </div>
      </div>
    </div>
  );
}
