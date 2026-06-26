import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Devis Simple - Créez vos devis en moins de 20 secondes',
  description: 'Pensé pour les artisans. Envoyez vos devis, faites-les accepter en ligne et transformez-les en facture en un clic.',
  keywords: ['devis', 'facture', 'artisan', 'bâtiment', 'plombier', 'électricien', 'SaaS'],
  authors: [{ name: 'Devis Simple' }],
  openGraph: {
    title: 'Devis Simple - Créez vos devis en moins de 20 secondes',
    description: 'Pensé pour les artisans. Envoyez vos devis, faites-les accepter en ligne et transformez-les en facture en un clic.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Devis Simple',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Devis Simple - Devis professionnels en 20 secondes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Devis Simple - Créez vos devis en moins de 20 secondes',
    description: 'Pensé pour les artisans. Envoyez vos devis, faites-les accepter en ligne et transformez-les en facture en un clic.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
