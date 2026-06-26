'use client';

import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  product: [
    { name: 'Fonctionnalités', href: '#features' },
    { name: 'Tarifs', href: '#pricing' },
    { name: 'Témoignages', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ],
  legal: [
    { name: 'Mentions légales', href: '/legal' },
    { name: 'CGU', href: '/terms' },
    { name: 'Politique de confidentialité', href: '/privacy' },
    { name: 'CGV', href: '/cgv' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/449DD949-1F0A-44B8-BC5B-6C98FEED14A8.PNG"
                alt="Devis Simple"
                width={160}
                height={42}
                style={{ objectFit: 'contain', height: 42, width: 'auto', filter: 'brightness(0) invert(1)' }}
              />
            </Link>
            <p className="text-sm text-gray-400 max-w-xs">
              La solution de devis et facturation pensée pour les artisans.
              Créez, envoyez et facturez en quelques secondes.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Produit
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Légal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Devis Simple. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
