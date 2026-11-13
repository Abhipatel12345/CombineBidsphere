'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function LoginRedirectContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams ? searchParams.toString() : '';
    const target = params ? `/login?${params}` : '/login';
    window.location.replace(target);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 font-sans">
      <div className="h-10 w-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-200">Redirecting to Enterprise Unified Login...</p>
      <p className="text-xs text-slate-500 mt-1">Single entry point for BidSphere and Project Management</p>
    </div>
  );
}

export default function PdmLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginRedirectContent />
    </Suspense>
  );
}
