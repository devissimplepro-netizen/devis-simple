'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Calendar, Sparkles, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const { subscription, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const priceId = billingCycle === 'monthly'
        ? 'price_monthly_pro'
        : 'price_yearly_pro';

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            price_id: priceId,
            mode: 'subscription',
            success_url: `${window.location.origin}/dashboard/subscription?success=1`,
            cancel_url: `${window.location.origin}/dashboard/subscription?cancel=1`,
          }),
        }
      );

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Erreur lors de la redirection vers Stripe');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const { url } = await response.json();
      if (url) window.open(url, '_blank');
    } catch (error) {
      toast.error('Erreur lors de l\'ouverture du portail');
    }
  };

  const isTrialing = subscription?.status === 'trialing';
  const isActive = subscription?.status === 'active';
  const isPaid = isActive || isTrialing;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Abonnement</h1>
        <p className="text-sm sm:text-base text-gray-600">Gérez votre abonnement Devis Simple</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CreditCard className="h-5 w-5" />
            Abonnement actuel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Pro</h3>
                <Badge className="bg-blue-600 text-white text-xs">
                  {subscription?.billing_cycle === 'yearly' ? 'Annuel' : 'Mensuel'}
                </Badge>
                {isTrialing && (
                  <Badge className="bg-green-600 text-white text-xs">Période d'essai</Badge>
                )}
                {isActive && (
                  <Badge className="bg-green-600 text-white text-xs">Actif</Badge>
                )}
                {!isPaid && (
                  <Badge className="bg-red-600 text-white text-xs">Inactif</Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm">Une seule offre, tous les outils inclus</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {formatPrice(subscription?.billing_cycle === 'yearly' ? 199.99 : 19.99)}€
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                /{subscription?.billing_cycle === 'yearly' ? 'an' : 'mois'}
              </p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-medium text-sm sm:text-base">Ce qui est inclus :</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Devis illimités',
                'Factures illimitées',
                'Signature en ligne',
                'Assistant vocal IA',
                'Bibliothèque de prestations',
                'Partage WhatsApp & Email',
                'Conversion devis → facture',
                'PDF personnalisés',
                'Support prioritaire',
                'Statistiques en temps réel',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {subscription?.current_period_end && (
            <div className="pt-4 sm:pt-6 border-t">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  {isTrialing ? 'Fin de l\'essai : ' : 'Prochain renouvellement : '}
                  {new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!isPaid && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Souscrire</CardTitle>
            <CardDescription className="text-sm">
              Choisissez votre formule et activez votre abonnement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-6">
              <span className={`text-xs sm:text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Mensuel
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-12 h-6 sm:w-14 sm:h-7 bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ background: billingCycle === 'yearly' ? '#1B3C96' : '#d1d5db' }}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6 sm:translate-x-7' : ''
                  }`}
                />
              </button>
              <span className={`text-xs sm:text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Annuel
              </span>
              {billingCycle === 'yearly' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  <Sparkles className="h-3 w-3" />
                  2 mois offerts
                </span>
              )}
            </div>

            <div className="max-w-md mx-auto">
              <div className="relative rounded-xl p-4 sm:p-6 bg-blue-50 border-2 border-blue-600">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Formule unique
                  </Badge>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 text-center">Pro</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4 text-center">Tous les outils, sans limites</p>
                <div className="mb-4 text-center">
                  <span className="text-2xl sm:text-3xl font-bold">
                    {formatPrice(billingCycle === 'monthly' ? 19.99 : 199.99)}€
                  </span>
                  <span className="text-gray-500 text-sm">/{billingCycle === 'monthly' ? 'mois' : 'an'}</span>
                </div>
                <Button
                  className="w-full gradient-primary text-white"
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-pulse">Redirection...</span>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Souscrire maintenant
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isPaid && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Facturation</CardTitle>
            <CardDescription className="text-sm">
              Gérez vos moyens de paiement et vos factures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              Les paiements sont sécurisés par Stripe. Vous pouvez gérer vos moyens de paiement et télécharger vos factures depuis le portail client.
            </p>
            <Button variant="outline" className="w-full sm:w-auto" onClick={handleManageBilling}>
              <CreditCard className="mr-2 h-4 w-4" />
              Gérer les paiements
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
