export const APP_NAME = 'Devis Simple';
export const APP_DESCRIPTION = 'Créez vos devis en moins de 20 secondes. Pensé pour les artisans.';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://devis-simple.fr';

export const PLAN_PRICES = {
  starter: {
    monthly: 9.99,
    yearly: 99.90,
  },
  pro: {
    monthly: 19.99,
    yearly: 199.90,
  },
} as const;

export const PLAN_FEATURES = {
  starter: [
    '3 documents inclus',
    'Creation de devis',
    'Creation de factures',
    'Telechargement PDF',
    'Logo entreprise',
    'Partage de devis par lien',
  ],
  pro: [
    '3 documents inclus',
    'Devis illimites',
    'Factures illimited',
    'Acceptation en ligne des devis',
    'Assistant vocal IA',
    'Bibliotheque de prestations',
    'Modeles personnalises',
    'Couleurs personnalisees',
    'Conversion devis en facture',
    'Partage par email',
    'Partage WhatsApp',
    'Apercu PDF',
    'Support prioritaire',
  ],
} as const;

export const STATUS_COLORS = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Brouillon' },
  sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Envoyé' },
  viewed: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Vu' },
  accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepté' },
  refused: { bg: 'bg-red-100', text: 'text-red-800', label: 'Refusé' },
  invoiced: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Facturé' },
  paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Payé' },
  late: { bg: 'bg-red-100', text: 'text-red-800', label: 'En retard' },
} as const;

export const PDF_TEMPLATES = [
  { id: 1, name: 'Classique', description: 'Design traditionnel et professionnel' },
  { id: 2, name: 'Moderne', description: 'Style épuré et contemporain' },
  { id: 3, name: 'Premium', description: 'Look haut de gamme avec accents dorés' },
  { id: 4, name: 'Minimaliste', description: 'Simple et efficace' },
  { id: 5, name: 'Bâtiment', description: 'Adapté aux artisans du bâtiment' },
] as const;

export const DEFAULT_TVA_RATES = [20, 10, 5.5, 2.1] as const;

export const TRADES = [
  'Plombier',
  'Électricien',
  'Climaticien',
  'Chauffagiste',
  'Frigoriste',
  'Serrurier',
  'Maçon',
  'Peintre',
  'Carreleur',
  'Menuisier',
  'Paysagiste',
  'Pisciniste',
  'Vitrier',
  'Couvreur',
  'Entreprise de rénovation',
  'Autre',
] as const;
