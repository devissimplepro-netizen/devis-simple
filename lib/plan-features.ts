export type Plan = 'starter' | 'pro';

export const PLAN_RANK: Record<Plan, number> = {
  starter: 0,
  pro: 1,
};

export function hasFeature(plan: Plan | null | undefined, requiredPlan: Plan): boolean {
  if (!plan) return false;
  return PLAN_RANK[plan] >= PLAN_RANK[requiredPlan];
}

export const UPGRADE_MESSAGES: Record<string, { title: string; description: string }> = {
  voice: {
    title: 'Fonctionnalite reservee au forfait Pro',
    description:
      'La creation de devis assistee par la voix est disponible dans le forfait Pro. Passez a la version superieure pour creer des devis encore plus rapidement.',
  },
  convert_invoice: {
    title: 'Fonctionnalite reservee au forfait Pro',
    description:
      'La conversion en un clic du devis en facture est disponible dans le forfait Pro. Passez a la version superieure pour automatiser votre facturation.',
  },
  online_signing: {
    title: 'Fonctionnalite reservee au forfait Pro',
    description:
      'La validation en ligne est disponible dans le forfait Pro. Passez a la version superieure pour debloquer des outils avances et gagner encore plus de temps.',
  },
  custom_colors: {
    title: 'Fonctionnalite reservee au forfait Pro',
    description:
      'La personnalisation des couleurs est disponible dans le forfait Pro. Passez a la version superieure pour personnaliser vos documents.',
  },
  custom_templates: {
    title: 'Fonctionnalite reservee au forfait Pro',
    description:
      'Les modeles personnalises sont disponibles dans le forfait Pro. Passez a la version superieure pour personnaliser vos documents.',
  },
  prestations_library: {
    title: 'Fonctionnalite reservee au forfait Pro',
    description:
      'La bibliotheque de prestations est disponible dans le forfait Pro. Passez a la version superieure pour gagner du temps sur la creation de devis.',
  },
  email_sharing: {
    title: 'Fonctionnalite reservee au forfait Pro',
    description:
      'Le partage par email est disponible dans le forfait Pro. Passez a la version superieure pour envoyer vos devis directement par email.',
  },
  whatsapp_sharing: {
    title: 'Fonctionnalite reservee au forfait Pro',
    description:
      'Le partage WhatsApp est disponible dans le forfait Pro. Passez a la version superieure pour partager vos devis instantanement.',
  },
  default: {
    title: 'Fonctionnalite reservee au forfait Pro',
    description:
      'Cette fonctionnalite est disponible dans le forfait Pro. Passez a la version superieure maintenant pour debloquer des outils avances et gagner encore plus de temps.',
  },
};
