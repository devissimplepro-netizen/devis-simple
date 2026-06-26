'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function LegalPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions légales</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Éditeur du site</h2>
            <p className="text-gray-600 leading-relaxed">
              Le site devis-simple.fr est édité par la société Devis Simple, société à responsabilité limitée au capital de 10 000 euros, immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro 912 345 678 00012, dont le siège social est situé :
            </p>
            <p className="text-gray-600 mt-4">
              Adresse : 12 Rue de la Paix, 75002 Paris, France<br />
              Téléphone : +33 1 23 45 67 89<br />
              Email : contact@devis-simple.fr<br />
              SIRET : 912 345 678 00012<br />
              Numéro de TVA intracommunautaire : FR 91 912 345 678
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Directeur de la publication</h2>
            <p className="text-gray-600 leading-relaxed">
              Le Directeur de la publication est M. Jean Dupont, en qualité de Gérant de la société Devis Simple.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Hébergement</h2>
            <p className="text-gray-600 leading-relaxed">
              Le site est hébergé par Vercel Inc., dont le siège est situé 340 S Lemon Ave #4133, Walnut, CA 91789, USA.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              La base de données est hébergée par Supabase, dont le siège est situé 97 Battery Street, Suite 402, San Francisco, CA 94111, USA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Propriété intellectuelle</h2>
            <p className="text-gray-600 leading-relaxed">
              L'ensemble des contenus du site (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) sont la propriété exclusive de Devis Simple ou de ses partenaires. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site est interdite sans autorisation écrite préalable.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              Le nom « Devis Simple », le logo, les couleurs et l'identité visuelle sont des marques déposées auprès de l'INPI. Toute utilisation non autorisée est strictement interdite et constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Données personnelles</h2>
            <p className="text-gray-600 leading-relaxed">
              Les informations concernant la collecte et le traitement des données personnelles sont détaillées dans notre{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Politique de confidentialité
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Le site utilise des cookies essentiels au fonctionnement du service (authentification, session utilisateur) et des cookies analytiques (avec votre consentement) pour améliorer l'expérience utilisateur. En continuant à naviguer sur ce site, vous acceptez l'utilisation des cookies essentiels. Vous pouvez à tout moment modifier vos préférences via votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter à : legal@devis-simple.fr
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Droit applicable</h2>
            <p className="text-gray-600 leading-relaxed">
              Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux compétents seront ceux du ressort de la Cour d'Appel de Paris.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/terms" className="text-blue-600 hover:underline">Conditions d'utilisation</Link>
          <span className="text-gray-300">|</span>
          <Link href="/privacy" className="text-blue-600 hover:underline">Politique de confidentialité</Link>
          <span className="text-gray-300">|</span>
          <Link href="/cgv" className="text-blue-600 hover:underline">Conditions générales de vente</Link>
        </div>
      </main>
    </div>
  );
}
