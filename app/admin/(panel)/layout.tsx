'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Shield, LogOut, Users } from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'mohaa-elamri@hotmail.com';

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/admin');
        return;
      }
      if (session.user.email?.toLowerCase() !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        router.replace('/admin');
        return;
      }
      setChecking(false);
    };
    check();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Déconnecté');
    router.push('/admin');
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-3 h-16 px-5 border-b border-gray-200 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Administration</p>
            <p className="text-xs text-gray-500">Devis Simple</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Gestion</p>
          <Link
            href="/admin/candidatures"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #1E3A8A, #1B3C96)' }}
          >
            <Users className="h-5 w-5 flex-shrink-0" />
            Candidatures
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full transition-colors text-sm font-medium"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">Connecté en tant qu'administrateur</span>
          <span className="text-xs text-gray-400 font-mono">{ADMIN_EMAIL}</span>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
