'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de confidentialite</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Devis Simple respecte la vie privée de ses utilisateurs et s'engage à protéger les données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) n° 2016/679 du 27 avril 2016 et à la loi n° 78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés modifiée. La présente politique de confidentialité détaille comment nous collectons, utilisons, stockons et protégeons vos données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Responsable du traitement</h2>
            <p className="text-gray-600 leading-relaxed">
              Le responsable du traitement des données est Devis Simple, société à responsabilité limitée, dont le siège social est situé au 12 Rue de la Paix, 75002 Paris, France. Le Délégué à la Protection des Données (DPO) peut être contacté à : dpo@devis-simple.fr
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Données collectées</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nous collectons et traitons les catégories de données suivantes :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone, adresse postale</li>
              <li><strong>Données professionnelles :</strong> nom de l'entreprise, SIRET, numéro de TVA intracommunautaire, adresse professionnelle, métier</li>
              <li><strong>Données de facturation :</strong> historique des paiements, méthodes de paiement, coordonnées bancaires (via Stripe uniquement)</li>
              <li><strong>Données de connexion :</strong> adresse IP, identifiants de connexion, logs de session, dates et heures de connexion, type de navigateur</li>
              <li><strong>Données d'utilisation :</strong> préférences, historique des actions, documents créés (devis, factures)</li>
              <li><strong>Données clients :</strong> informations sur vos clients que vous saisissez dans l'application (nom, adresse, email, téléphone)</li>
              <li><strong>Données de candidature :</strong> nom, email, téléphone, métier, entreprise, SIRET, message pour les candidatures non approuvées</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Finalités et bases légales du traitement</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Vos données sont traitées pour les finalités suivantes, sur les bases légales indiquées :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Exécution du contrat :</strong> fournir et maintenir le service, créer et gérer votre compte, générer vos documents</li>
              <li><strong>Consentement :</strong> envoyer des communications marketing, newsletters et offres promotionnelles</li>
              <li><strong>Intérêts légitimes :</strong> améliorer nos services, assurer la sécurité du service, prévenir la fraude</li>
              <li><strong>Obligations légales :</strong> conservation comptable, respect des obligations fiscales, réponse aux réquisitions judiciaires</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Destinataires des données</h2>
            <p className="text-gray-600 leading-relaxed">
              Vos données sont destinées aux services internes de Devis Simple et peuvent être transmises aux sous-traitants suivants, dans le strict cadre de leurs missions et sous réserve de garanties contractuelles de conformité RGPD :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-2">
              <li><strong>Supabase</strong> : hébergement et base de données</li>
              <li><strong>Vercel</strong> : hébergement de l'application</li>
              <li><strong>Stripe</strong> : traitement des paiements</li>
              <li><strong>SendGrid / Mailgun</strong> : envoi d'emails transactionnels</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-2">
              Vos données ne sont jamais vendues à des tiers et ne sont pas utilisées à des fins commerciales par des partenaires sans votre consentement explicite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Transferts de données hors UE</h2>
            <p className="text-gray-600 leading-relaxed">
              Certains de nos sous-traitants (Vercel, Supabase) peuvent héberger des données en dehors de l'Union Européenne. Ces transferts sont encadrés par les clauses contractuelles types approuvées par la Commission européenne ou des certifications de conformité (comme le Privacy Shield pour les États-Unis), garantissant un niveau de protection équivalent à celui de l'UE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Durée de conservation</h2>
            <p className="text-gray-600 leading-relaxed">
              Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, et conformément aux obligations légales applicables. Concrètement :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-2">
              <li>Données de compte : durée de la relation contractuelle + 3 ans après la dernière activité</li>
              <li>Données de candidature refusée : 1 an après la réponse, puis suppression</li>
              <li>Données de facturation : 10 ans (obligation légale comptable)</li>
              <li>Données de connexion : 1 an</li>
              <li>Cookies : 13 mois maximum</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-2">
              Après suppression de votre compte, vos données sont anonymisées ou supprimées sous 30 jours, sauf obligation légale de conservation (données comptables, fiscales).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Vos droits</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Conformément au RGPD, vous disposez des droits suivants sur vos données :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> faire corriger des données inexactes ou incomplètes</li>
              <li><strong>Droit à l'effacement (droit à l'oubli) :</strong> demander la suppression de vos données dans certaines conditions</li>
              <li><strong>Droit à la limitation du traitement :</strong> obtenir la limitation du traitement dans certaines situations</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré et les transférer à un autre service</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement pour des motifs légitimes, notamment pour la prospection</li>
              <li><strong>Droit de retirer votre consentement :</strong> à tout moment pour les traitements fondés sur le consentement</li>
              <li><strong>Droit de ne pas faire l'objet d'une décision automatisée :</strong> vous opposer à une décision basée uniquement sur un traitement automatisé</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Pour exercer ces droits, contactez-nous par email à : privacy@devis-simple.fr ou par courrier à : Devis Simple - DPO, 12 Rue de la Paix, 75002 Paris, France. Nous vous répondrons dans un délai de 30 jours maximum.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Sécurité des données</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre la destruction, la perte, la modification, la divulgation ou l'accès non autorisé :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-2">
              <li>Chiffrement SSL/TLS de toutes les connexions (HTTPS)</li>
              <li>Chiffrement des données au repos (AES-256)</li>
              <li>Contrôle d'accès basé sur les rôles (RLS)</li>
              <li>Sauvegardes automatiques et sécurisées</li>
              <li>Authentification forte (mots de passe hachés avec bcrypt)</li>
              <li>Surveillance et audit de sécurité réguliers</li>
              <li>Formation du personnel aux bonnes pratiques de sécurité</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-2">
              En cas de violation de données à caractère personnel, nous vous informerons dans les meilleurs délais et notifierons la CNIL si les conditions légales sont remplies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Cookies et traceurs</h2>
            <p className="text-gray-600 leading-relaxed">
              Le site utilise des cookies et traceurs pour les finalités suivantes :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-2">
              <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site (authentification, session, sécurité). Ces cookies ne peuvent pas être désactivés.</li>
              <li><strong>Cookies de performance :</strong> mesure d'audience et d'analyse d'utilisation (Google Analytics, avec consentement)</li>
              <li><strong>Cookies de préférences :</strong> mémorisation de vos choix (langue, affichage)</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-2">
              Vous pouvez à tout moment gérer vos préférences de cookies via le bandeau de consentement ou les paramètres de votre navigateur. La durée de conservation des cookies ne dépasse pas 13 mois.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Modification de la politique</h2>
            <p className="text-gray-600 leading-relaxed">
              Devis Simple se réserve le droit de modifier la présente politique de confidentialité à tout moment. Toute modification substantielle sera notifiée sur le site et, si nécessaire, par email. Nous vous encourageons à consulter régulièrement cette page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute question relative à la présente politique de confidentialité ou au traitement de vos données, contactez le DPO à : dpo@devis-simple.fr ou par courrier à : Devis Simple, 12 Rue de la Paix, 75002 Paris, France.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              Vous pouvez également introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, ou via https://www.cnil.fr.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/legal" className="text-blue-600 hover:underline">Mentions legales</Link>
          <span className="text-gray-300">|</span>
          <Link href="/terms" className="text-blue-600 hover:underline">Conditions d'utilisation</Link>
          <span className="text-gray-300">|</span>
          <Link href="/cgv" className="text-blue-600 hover:underline">Conditions generales de vente</Link>
        </div>
      </main>
    </div>
  );
}
