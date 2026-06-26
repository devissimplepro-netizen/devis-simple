'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/images/449DD949-1F0A-44B8-BC5B-6C98FEED14A8.PNG"
              alt="Devis Simple"
              width={140}
              height={36}
              style={{ height: 36, width: 'auto', objectFit: 'contain' }}
              priority
            />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions Generales de Vente (CGV)</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Objet</h2>
            <p className="text-gray-600 leading-relaxed">
              Les presentes Conditions Generales de Vente (CGV) regissent les relations contractuelles entre Netizen (editeur de Devis Simple) et ses clients pour la souscription a nos services d'abonnement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description des services</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Devis Simple propose une formule unique d'abonnement avec toutes les fonctionnalités incluses :
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Formule Pro (19,99 EUR/mois ou 199,99 EUR/an)</h3>
              <p className="text-gray-600 text-sm">
                Devis et factures illimités, acceptation en ligne, assistant vocal IA, bibliothèque de prestations, modèles personnalisés, partage email et WhatsApp, conversion devis-facture, aperçu PDF, couleurs personnalisées, support prioritaire.
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              L'accès au service est conditionné à une candidature validée par Devis Simple. Les artisans ne peuvent pas s'inscrire directement sans candidature préalable acceptée.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Tarifs et paiement</h2>
            <p className="text-gray-600 leading-relaxed">
              Les tarifs sont indiqués en euros TTC. Le paiement s'effectue par carte bancaire via notre prestataire de paiement sécurisé Stripe. Les abonnements sont facturés mensuellement ou annuellement selon la périodicité choisie.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              Le paiement est dû à l'activation du compte, après validation de la candidature. En cas de non-paiement, l'accès au service sera suspendu après un rappel par email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Période d'essai</h2>
            <p className="text-gray-600 leading-relaxed">
              Une période d'essai gratuite de 14 jours est proposée aux nouveaux utilisateurs après validation de leur candidature. À l'issue de cette période, vous pouvez choisir de souscrire au forfait payant ou résilier votre compte sans frais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Engagement et resiliation</h2>
            <p className="text-gray-600 leading-relaxed">
              L'abonnement est sans engagement. Vous pouvez a tout moment resilier votre abonnement depuis votre espace client ou en nous contactant. La resiliation prend effet a la fin de la periode de facturation en cours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Remboursement</h2>
            <p className="text-gray-600 leading-relaxed">
              Les sommes versees ne sont pas remboursables, sauf en cas de dysfonctionnement majeur du service imputable a Netizen. Les demarches de retractation legales s'appliquent conformement a l'article L.221-28 du Code de la Consommation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Obligations des parties</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              <strong>Netizen s'engage a :</strong>
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-4">
              <li>Fournir un service conforme a la description</li>
              <li>Assurer un acces au service 24h/24, 7j/7 (sauf maintenance)</li>
              <li>Proteger les donnees de ses clients</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mb-4">
              <strong>Le client s'engage a :</strong>
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Fournir des informations exactes</li>
              <li>Utiliser le service de maniere loyale</li>
              <li>Regler ses factures dans les delais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Responsabilite</h2>
            <p className="text-gray-600 leading-relaxed">
              La responsabilite de Netizen est limitee aux dommages directs previsibles. En aucun cas Netizen ne pourra etre tenu responsable des dommages indirects, pertes de profit ou de chiffre d'affaires.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Propriete intellectuelle</h2>
            <p className="text-gray-600 leading-relaxed">
              Les documents crees par le client (devis, factures) restent sa propriete. Les donnees saisies par le client lui appartiennent et ne seront jamais utilisees commercialement par Netizen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Droit applicable et juridiction</h2>
            <p className="text-gray-600 leading-relaxed">
              Les presentes CGV sont regies par le droit francais. En cas de litige, une solution amiable sera recherchee avant toute action judiciaire. A defaut, les tribunaux competents seront ceux du ressort de la Cour d'Appel de Paris.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute question relative a vos achats ou abonnements, contactez-nous a : support@devis-simple.fr
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/legal" className="text-blue-600 hover:underline">Mentions legales</Link>
          <span className="text-gray-300">|</span>
          <Link href="/terms" className="text-blue-600 hover:underline">Conditions d'utilisation</Link>
          <span className="text-gray-300">|</span>
          <Link href="/privacy" className="text-blue-600 hover:underline">Politique de confidentialite</Link>
        </div>
      </main>
    </div>
  );
}
