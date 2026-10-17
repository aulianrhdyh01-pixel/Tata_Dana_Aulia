'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperadminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-zinc-400">Membuka Superadmin Console...</p>
      </div>
    </div>
  );
}
