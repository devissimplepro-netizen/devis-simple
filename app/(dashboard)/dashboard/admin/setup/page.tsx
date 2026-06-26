'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin, full_name, email')
        .eq('id', session.user.id)
        .single();
      setUser(userData);
      setIsAdmin(userData?.is_admin || false);
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const makeAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', session.user.id);
      if (error) throw error;
      setIsAdmin(true);
      toast.success('Vous êtes maintenant admin');
      router.push('/dashboard/admin/candidatures');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Espace Admin</h1>
        <p className="text-gray-600 mb-6">
          {user?.email || 'Utilisateur'}
        </p>
        {isAdmin ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700 font-medium">Vous êtes déjà admin</p>
            </div>
            <Button className="w-full gradient-primary text-white" onClick={() => router.push('/dashboard/admin/candidatures')}>
              Voir les candidatures
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Activez votre accès administrateur pour gérer les candidatures et les artisans.
            </p>
            <Button className="w-full gradient-primary text-white" onClick={makeAdmin} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Activer l'accès admin
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
