'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CircleDot, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSignupMutation } from '@/hooks/auth';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; password?: boolean }>({});

  const signupMutation = useSignupMutation();

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    
    if (!name) {
      newErrors.name = 'Name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
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

  const handleSignup = async () => {
    setTouched({ name: true, email: true, password: true });
    if (validateForm()) {
      signupMutation.mutate({ name, email, password });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (touched.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
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

  const handleNameBlur = () => {
    setTouched(prev => ({ ...prev, name: true }));
    if (name && name.length < 2) {
      setErrors(prev => ({ ...prev, name: 'Name must be at least 2 characters' }));
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
          <p className="text-sm uppercase tracking-[0.3em] text-[#b0783d]">Baba Flour Mill</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#3e2a18]">Create Your Admin Account</h1>
          <p className="text-base text-[#6e553d] font-medium">Secure your mill operations with a strong admin account.</p>
        </div>

        <div className="relative rounded-[36px] border border-[#dec3a3] bg-white/95 p-10 shadow-[0_30px_70px_rgba(71,55,34,0.12)] ring-1 ring-[#f3e1cb]/60">
          {signupMutation.error && (
            <div className="mb-6 rounded-3xl border border-[#f1c0a2] bg-[#fff1ec] p-4 text-sm text-[#9b2b0d]">
              <span className="text-sm font-medium">
                {signupMutation.error.message || 'Signup failed. Please try again.'}
              </span>
            </div>
          )}
          <div className="mb-5">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Full name
            </label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <User className="h-5 w-5 text-[#7e6a54] group-focus-within:text-[#a86b19] transition-colors" strokeWidth={1.5} />
              </div>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-[#3b2a1b] placeholder:text-[#b79b7f] focus:outline-none focus:ring-4 transition-all ${
                  errors.name && touched.name
                    ? 'border-[#f0a38b] focus:border-[#c97a48] focus:ring-[#f3d2af]/50'
                    : 'border-[#e3d1be] focus:border-[#c47b1d] focus:ring-[#f5d4a5]/50'
                }`}
                placeholder="John Doe"
              />
              {errors.name && touched.name && (
                <div className="mt-2 flex items-center gap-1.5 text-red-600">
                  <AlertCircle className="h-4 w-4" strokeWidth={2} />
                  <span className="text-xs font-medium">{errors.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Email address
            </label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Mail className="h-5 w-5 text-[#7e6a54] group-focus-within:text-[#a86b19] transition-colors" strokeWidth={1.5} />
              </div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-[#3b2a1b] placeholder:text-[#b79b7f] focus:outline-none focus:ring-4 transition-all ${
                  errors.email && touched.email
                    ? 'border-[#f0a38b] focus:border-[#c97a48] focus:ring-[#f3d2af]/50'
                    : 'border-[#e3d1be] focus:border-[#c47b1d] focus:ring-[#f5d4a5]/50'
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
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock className="h-5 w-5 text-[#7e6a54] group-focus-within:text-[#a86b19] transition-colors" strokeWidth={1.5} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-[#3b2a1b] placeholder:text-[#b79b7f] focus:outline-none focus:ring-4 transition-all ${
                  errors.password && touched.password
                    ? 'border-[#f0a38b] focus:border-[#c97a48] focus:ring-[#f3d2af]/50'
                    : 'border-[#e3d1be] focus:border-[#c47b1d] focus:ring-[#f5d4a5]/50'
                }`}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#7e6a54] hover:text-[#5d3f1f] transition-colors"
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
            onClick={handleSignup}
            disabled={signupMutation.isPending}
            className="relative flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#b45309] px-4 text-sm font-bold text-white shadow-[0_16px_40px_rgba(180,83,9,0.25)] transition-all hover:bg-[#8f3f08] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {signupMutation.isPending ? (
              <>
                <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span className="ml-2">Creating account...</span>
              </>
            ) : (
              <>
                <span className="relative z-10">Create Account</span>
                <ArrowRight className="h-4.5 w-4.5 relative z-10 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </button>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#6e553d]">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-bold text-[#9c5a0e] hover:text-[#b76c10] transition-colors underline decoration-[#f2d2a0] underline-offset-2 hover:underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-[#7e6a54]">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#b45309]" strokeWidth={2} />
            <p>By signing up, you agree to our Terms and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
