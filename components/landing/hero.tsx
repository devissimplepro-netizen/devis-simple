'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, CheckCircle, Mic, MessageCircle } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50/30 -z-10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
            Créez vos devis en{' '}
            <span className="text-gradient">moins de 20&nbsp;secondes</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed">
            Pensé pour les artisans. Parlez, le devis se génère automatiquement.
            Envoyez, faites signer en ligne et facturez en un clic.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link href="/candidature">
              <Button size="lg" className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all text-lg px-8 h-14">
                Candidater
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a
              href="https://wa.me/33600000000?text=Bonjour%2C%20je%20souhaite%20candidater%20pour%20Devis%20Simple"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700">
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500 mb-16">
            {[
              'Sans engagement',
              'Accès sur validation',
              'Annulation facile',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {item}
              </div>
            ))}
          </div>

          {/* Voice CTA strip */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Mic className="h-5 w-5 text-[#F47319]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">"Remplacement chauffe-eau chez M. Martin. Fourniture 650€, main d'œuvre 250€."</p>
                <p className="text-xs text-gray-500 mt-0.5">→ Devis généré automatiquement en 3 secondes</p>
              </div>
            </div>
          </div>

          {/* App preview mockup */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-orange-400/20 rounded-3xl blur-2xl -z-10" />
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Browser bar */}
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-500 font-medium">app.devissimple.fr</span>
              </div>

              {/* Dashboard mockup */}
              <div className="bg-gray-50 p-6 sm:p-10 flex flex-col items-center gap-8">
                {/* Logo */}
                <Image
                  src="/images/449DD949-1F0A-44B8-BC5B-6C98FEED14A8.PNG"
                  alt="Devis Simple"
                  width={260}
                  height={68}
                  style={{ objectFit: 'contain', height: 68, width: 'auto' }}
                  priority
                />

                {/* KPI cards */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                  {[
                    { label: 'Devis ce mois', value: '12', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Acceptés', value: '9', color: 'text-green-600', bg: 'bg-green-50' },
                    { label: "Chiffre d'affaires", value: '8 450 €', color: 'text-[#F47319]', bg: 'bg-orange-50' },
                  ].map((kpi) => (
                    <div key={kpi.label} className={`${kpi.bg} rounded-xl p-4 text-center`}>
                      <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
                    </div>
                  ))}
                </div>

                {/* Fake quote row */}
                <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Derniers devis</span>
                    <span className="text-xs text-blue-600 font-medium">Voir tout</span>
                  </div>
                  {[
                    { num: 'DEV-2026-00012', client: 'M. Martin', amount: '1 100 €', status: 'Accepté', color: 'bg-green-100 text-green-700' },
                    { num: 'DEV-2026-00011', client: 'Mme Durand', amount: '850 €', status: 'Envoyé', color: 'bg-blue-100 text-blue-700' },
                    { num: 'DEV-2026-00010', client: 'M. Lefebvre', amount: '2 300 €', status: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
                  ].map((row) => (
                    <div key={row.num} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{row.num}</p>
                        <p className="text-xs text-gray-500">{row.client}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-800">{row.amount}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${row.color}`}>{row.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA row */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium text-gray-600">Signature en ligne</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                    <FileText className="h-4 w-4 text-[#1B3C96]" />
                    <span className="text-xs font-medium text-gray-600">PDF automatique</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
