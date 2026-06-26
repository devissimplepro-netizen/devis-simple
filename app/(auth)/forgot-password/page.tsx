'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
      toast.success('Email envoye');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <Link href="/">
              <Image src="/images/449DD949-1F0A-44B8-BC5B-6C98FEED14A8.PNG" alt="Devis Simple" width={160} height={40} style={{ objectFit: 'contain', height: 40, width: 'auto' }} priority />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Email envoye</h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Si un compte existe avec cette adresse, vous recevrez un email avec les instructions pour reinitialiser votre mot de passe.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full h-11 sm:h-12">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour a la connexion
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Mot de passe oublie ?</h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Entrez votre email pour recevoir un lien de reinitialisation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 sm:h-12 text-base"
                    autoComplete="email"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 sm:h-12 gradient-primary text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Envoyer le lien
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Retour a la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
