'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2, ShieldOff } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <ShieldOff className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Accès refusé</h2>
        <p className="text-gray-500 max-w-sm">
          Cette section est réservée aux administrateurs.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
