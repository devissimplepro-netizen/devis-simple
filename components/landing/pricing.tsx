'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

const plan = {
  id: 'pro',
  name: 'Pro',
  description: 'Tout ce dont vous avez besoin pour votre activité',
  monthlyPrice: 19.99,
  yearlyPrice: 199.99,
  features: [
    'Documents illimités',
    'Devis illimités',
    'Factures illimitées',
    'Acceptation en ligne des devis',
    'Assistant vocal IA',
    'Bibliothèque de prestations',
    'Modèles personnalisés',
    'Couleurs personnalisées',
    'Conversion devis en facture',
    'Partage par email',
    'Partage WhatsApp',
    'Aperçu PDF',
    'Support prioritaire',
  ],
  cta: 'Candidater',
  popular: true,
};

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Un seul tarif, tout inclus
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Un seul plan Pro avec toutes les fonctionnalités. Pas d'options cachées, pas de surprise.
          </p>

          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Mensuel
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: billingCycle === 'yearly' ? '#1B3C96' : '#d1d5db' }}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-7' : ''
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Annuel
            </span>
            {billingCycle === 'yearly' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                2 mois offerts
              </span>
            )}
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div
            className="relative rounded-2xl p-8 border-2 shadow-xl"
            style={{ background: 'linear-gradient(to bottom, #EFF6FF, #FFFFFF)', borderColor: '#1B3C96' }}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-white text-sm font-medium" style={{ background: '#1B3C96' }}>
                <Sparkles className="h-4 w-4" />
                Formule unique
              </span>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-500">{plan.description}</p>
            </div>

            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-gray-900">
                  {billingCycle === 'monthly'
                    ? formatPrice(plan.monthlyPrice)
                    : formatPrice(plan.yearlyPrice)}
                </span>
                <span className="text-gray-500">
                  €/{billingCycle === 'monthly' ? 'mois' : 'an'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {billingCycle === 'monthly'
                  ? 'Sans engagement, annulez à tout moment'
                  : 'Économisez 40 € par rapport au mensuel'}
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#F47319' }} />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/candidature">
              <Button
                className="w-full text-white"
                style={{
                  background: 'linear-gradient(135deg, #1B3C96 0%, #2563EB 100%)',
                }}
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Accès sur candidature validée — Sans engagement
        </p>
      </div>
    </section>
  );
}
