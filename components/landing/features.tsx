'use client';

import { Clock, Zap, PenTool, Mic, FileText, BarChart, Check } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Gain de temps',
    description: 'Créez un devis complet en moins de 20 secondes. Fini les heures passées à rédiger manuellement.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Zap,
    title: 'Simplicité',
    description: 'Interface intuitive pensée par et pour les artisans. Aucune formation nécessaire.',
    color: 'from-blue-700 to-blue-800',
  },
  {
    icon: PenTool,
    title: 'Signature en ligne',
    description: 'Vos clients signent électroniquement leurs devis. Plus besoin de déplacements.',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Mic,
    title: 'IA Vocale',
    description: 'Dictez votre devis à l\'IA vocale. Elle génère automatiquement le document complet.',
    color: 'from-orange-400 to-orange-600',
  },
  {
    icon: FileText,
    title: 'Facturation instantanée',
    description: 'Transformez vos devis acceptés en factures professionnelles en un seul clic.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: BarChart,
    title: 'Statistiques',
    description: 'Suivez votre chiffre d\'affaires, taux d\'acceptation et performances en temps réel.',
    color: 'from-teal-500 to-teal-600',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une solution complète pour gérer vos devis et factures, conçue spécialement pour les artisans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
