'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions d'utilisation (CGU)</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Objet</h2>
            <p className="text-gray-600 leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site devis-simple.fr et de tous les services associés. Devis Simple est un service de devis et facturation en ligne destiné aux artisans et professionnels du bâtiment. En utilisant notre service, vous acceptez sans réserve ces conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Accès au service et candidature</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Devis Simple fonctionne sur un modèle de sélection. Pour accéder au service, les artisans doivent candidater via le formulaire dédié ou par WhatsApp. Notre équipe examine chaque candidature et valide l'accès dans un délai de 24h maximum. Devis Simple se réserve le droit de refuser une candidature sans avoir à en justifier la raison.
            </p>
            <p className="text-gray-600 leading-relaxed">
              L'accès au service est réservé aux professionnels du bâtiment, artisans et TPE/PME du secteur des travaux. Les artisans ne peuvent pas s'inscrire directement sans candidature préalable validée.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Inscription et compte</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Une fois la candidature acceptée, vous recevez un email avec un lien d'activation. Vous vous engagez à :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Fournir des informations exactes et complètes lors de l'inscription</li>
              <li>Maintenir la confidentialité de vos identifiants de connexion</li>
              <li>Notifier immédiatement toute utilisation non autorisée de votre compte</li>
              <li>Ne pas créer de compte sous une fausse identité</li>
              <li>Mettre à jour vos informations si elles deviennent inexactes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Utilisation du service</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Vous vous engagez à utiliser le service de manière loyale et conforme à sa destination. Sont notamment interdits :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>L'utilisation du service à des fins illicites ou contraires à l'ordre public</li>
              <li>La collecte de données personnelles d'autres utilisateurs sans leur consentement</li>
              <li>La perturbation ou la tentative de perturbation du fonctionnement du service</li>
              <li>L'intrusion ou la tentative d'intrusion dans nos systèmes informatiques</li>
              <li>La diffusion de contenus diffamatoires, injurieux ou portant atteinte aux droits d'autrui</li>
              <li>La revente ou la commercialisation de l'accès au service</li>
              <li>L'utilisation automatisée ou robotique du service (hors API autorisées)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Propriété intellectuelle</h2>
            <p className="text-gray-600 leading-relaxed">
              Tous les éléments constitutifs du site (graphismes, textes, logiciels, bases de données, code source, etc.) sont protégés par le droit de la propriété intellectuelle. Toute reproduction, même partielle, est interdite sans autorisation préalable écrite de Devis Simple.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              Les documents créés par les utilisateurs (devis, factures) restent leur propriété exclusive. Devis Simple ne revendique aucun droit sur les contenus créés par les utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Responsabilité</h2>
            <p className="text-gray-600 leading-relaxed">
              Devis Simple s'efforce de maintenir le service accessible et fonctionnel. Cependant, nous ne pouvons garantir une disponibilité continue et ne saurions être tenus responsables des dommages résultant d'une indisponibilité temporaire du service. La responsabilité de Devis Simple est limitée aux dommages directs prévisibles.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              Devis Simple n'est pas responsable de l'exactitude des données saisies par les utilisateurs. Les devis et factures sont émis sous la responsabilité exclusive de leur auteur. Les utilisateurs doivent s'assurer de la conformité de leurs documents avec les obligations légales applicables à leur activité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Suspension et résiliation</h2>
            <p className="text-gray-600 leading-relaxed">
              Devis Simple se réserve le droit de suspendre ou de résilier l'accès d'un utilisateur en cas de violation des présentes CGU, sans préavis ni indemnité. L'utilisateur peut résilier son compte à tout moment en nous contactant. Les données de l'utilisateur seront conservées pendant une période de 30 jours après la résiliation, puis supprimées ou anonymisées, sauf obligation légale contraire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Modification des CGU</h2>
            <p className="text-gray-600 leading-relaxed">
              Devis Simple se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle par notification sur le site ou par email. L'utilisation continue du service après modification des CGU vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Droit applicable</h2>
            <p className="text-gray-600 leading-relaxed">
              Les présentes CGU sont régies par le droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute question relative aux présentes CGU, contactez-nous à : legal@devis-simple.fr
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/legal" className="text-blue-600 hover:underline">Mentions légales</Link>
          <span className="text-gray-300">|</span>
          <Link href="/privacy" className="text-blue-600 hover:underline">Politique de confidentialité</Link>
          <span className="text-gray-300">|</span>
          <Link href="/cgv" className="text-blue-600 hover:underline">Conditions générales de vente</Link>
        </div>
      </main>
    </div>
  );
}
