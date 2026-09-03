'use client';

import Link from 'next/link';
import { ArrowRight, CircleDot } from 'lucide-react';

/**
 * Tenant admins are provisioned from Master Admin — no public self-signup.
 */
export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex items-center gap-2 text-slate-500">
          <CircleDot className="h-5 w-5" />
          <span className="font-semibold tracking-wide">POS Admin</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Signup unavailable</h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Tenant accounts are created by the platform administrator. Use the login
          page with credentials provided for your organization.
        </p>
              <Link 
                href="/login" 
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
          Back to login
          <ArrowRight className="h-4 w-4" />
              </Link>
      </div>
    </div>
  );
}
