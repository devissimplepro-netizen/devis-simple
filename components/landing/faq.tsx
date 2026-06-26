'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Comment puis-je candidater pour Devis Simple ?',
    answer: 'Remplissez le formulaire de candidature sur cette page ou contactez-nous par WhatsApp. Notre équipe examine chaque demande et vous recontacte dans les 24 heures.',
  },
  {
    question: 'Quel est le tarif du service ?',
    answer: 'Une seule offre : 19,99 € par mois ou 199,99 € par an (2 mois offerts). Toutes les fonctionnalités sont incluses sans limitation de documents.',
  },
  {
    question: 'Comment fonctionne la signature électronique ?',
    answer: 'Chaque devis possède un lien sécurisé unique que vous envoyez à votre client. Il peut alors consulter, télécharger et signer le devis en ligne. Vous recevez une notification à chaque action.',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Absolument. Vos données sont hébergées en France, cryptées et sauvegardées quotidiennement. Nous respectons le RGPD et vos données vous appartiennent.',
  },
  {
    question: 'Puis-je personnaliser mes devis ?',
    answer: 'Oui, vous pouvez ajouter votre logo, choisir vos couleurs, sélectionner parmi 5 modèles de PDF professionnels et ajouter vos mentions légales.',
  },
  {
    question: "L'IA vocale est-elle incluse ?",
    answer: "Oui, l'assistant vocal IA est inclus dans l'offre unique. Dictez votre devis et il se génère automatiquement en quelques secondes.",
  },
  {
    question: 'Comment fonctionne la transformation devis → facture ?',
    answer: 'Une fois un devis accepté, un simple clic sur "Transformer en facture" crée automatiquement une facture avec les mêmes lignes, les mêmes montants et une nouvelle numérotation conforme.',
  },
  {
    question: 'Puis-je annuler à tout moment ?',
    answer: 'Oui, votre abonnement est sans engagement. Vous pouvez le résilier à tout moment depuis votre espace. Votre accès reste actif jusqu’à la fin de la période payée.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-lg text-gray-600">
            Tout ce que vous devez savoir sur Devis Simple.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
