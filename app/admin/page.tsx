'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'mohaa-elamri@hotmail.com';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
        throw new Error('Accès non autorisé');
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();

      if (!userData?.is_admin) {
        await supabase.auth.signOut();
        throw new Error('Accès non autorisé');
      }

      toast.success('Connecté en tant qu\'admin');
      router.push('/admin/candidatures');
    } catch (error: any) {
      toast.error(error.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Administration</h1>
        <p className="text-gray-500 mb-8 text-sm">Espace réservé à l'administrateur</p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@devis-simple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Mot de passe</Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
              autoComplete="current-password"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 gradient-primary text-white mt-2"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Connexion...</>
            ) : (
              <><Shield className="mr-2 h-5 w-5" />Se connecter</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
