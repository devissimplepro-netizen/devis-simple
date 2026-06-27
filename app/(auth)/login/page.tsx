'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import { translateAuthError } from '@/lib/auth-errors';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch role from profiles to redirect accordingly
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) throw new Error('Erreur lors de la récupération du profil');

      if (!profile) {
        await supabase.auth.signOut();
        throw new Error('Profil introuvable, contactez l\'administrateur');
      }

      if (profile.role === 'admin') {
        toast.success('Connexion réussie');
        router.push('/admin/candidatures');
        return;
      }

      toast.success('Connexion réussie');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(translateAuthError(error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <div className="hidden lg:flex lg:w-1/2 relative" style={{ background: 'linear-gradient(135deg, #1B3C96 0%, #2554C7 100%)' }}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center items-center p-8 sm:p-12 text-white">
          <div className="max-w-md text-center">
            <div className="flex justify-center mb-8">
              <Image
                src="/images/449DD949-1F0A-44B8-BC5B-6C98FEED14A8.PNG"
                alt="Devis Simple"
                width={200}
                height={52}
                style={{ objectFit: 'contain', height: 52, width: 'auto' }}
                priority
              />
            </div>
            <p className="text-lg text-blue-100">
              La solution de devis et facturation pensee pour les artisans.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <Link href="/">
                  <Image
                    src="/images/449DD949-1F0A-44B8-BC5B-6C98FEED14A8.PNG"
                    alt="Devis Simple"
                    width={140}
                    height={36}
                    style={{ objectFit: 'contain', height: 36, width: 'auto' }}
                    priority
                  />
                </Link>
              </div>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Bon retour</h2>
              <p className="text-gray-600 text-sm sm:text-base">Connectez-vous a votre compte</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 sm:h-12 text-base"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link href="/forgot-password" className="text-xs sm:text-sm text-blue-600 hover:text-blue-800">
                    Mot de passe oublie ?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 sm:h-12 pr-10 text-base"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 sm:h-12 gradient-primary text-white text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            <p className="mt-6 sm:mt-8 text-center text-gray-600 text-sm">
              Pas encore de compte ?{' '}
              <Link href="/candidature" className="text-blue-600 hover:text-blue-800 font-medium">
                Candidater
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
