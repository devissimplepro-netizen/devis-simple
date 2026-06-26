export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ to, subject, html }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.error('Email error:', data);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export const emailTemplates = {
  candidatureReceived: (name: string) => ({
    subject: 'Candidature reçue - Devis Simple',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#1B3C96">Bonjour ${name},</h2>
      <p>Nous avons bien reçu votre candidature pour Devis Simple.</p>
      <p>Notre équipe l'examine et vous recontacte dans les 24h.</p>
      <p style="margin-top:24px">Cordialement,<br/><strong>L'équipe Devis Simple</strong></p>
    </div>`,
  }),
  candidatureApproved: (name: string, email: string, password: string) => ({
    subject: 'Votre candidature est acceptée - Devis Simple',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#1B3C96">Félicitations ${name},</h2>
      <p>Votre candidature a été acceptée. Votre compte Devis Simple est créé.</p>
      <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0">
        <p style="margin:0"><strong>Email :</strong> ${email}</p>
        <p style="margin:0"><strong>Mot de passe :</strong> ${password}</p>
      </div>
      <p><a href="https://app.devis-simple.fr/login" style="background:#1B3C96;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Se connecter</a></p>
      <p style="margin-top:24px;font-size:12px;color:#666">Votre essai de 14 jours commence maintenant.</p>
    </div>`,
  }),
  candidatureRejected: (name: string) => ({
    subject: 'Votre candidature - Devis Simple',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#1B3C96">Bonjour ${name},</h2>
      <p>Nous avons examiné votre candidature. Malheureusement, nous ne pouvons pas l'accepter pour le moment.</p>
      <p>N'hésitez pas à revenir vers nous dans le futur.</p>
      <p style="margin-top:24px">Cordialement,<br/><strong>L'équipe Devis Simple</strong></p>
    </div>`,
  }),
  quoteAccepted: (name: string, number: string) => ({
    subject: `Devis ${number} accepté - Devis Simple`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#16a34a">Bonjour ${name},</h2>
      <p>Votre devis <strong>${number}</strong> a été accepté par le client.</p>
      <p>Vous pouvez maintenant le transformer en facture depuis votre tableau de bord.</p>
    </div>`,
  }),
  quoteRefused: (name: string, number: string) => ({
    subject: `Devis ${number} refusé - Devis Simple`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#dc2626">Bonjour ${name},</h2>
      <p>Votre devis <strong>${number}</strong> a été refusé par le client.</p>
    </div>`,
  }),
  invoicePaid: (name: string, number: string) => ({
    subject: `Facture ${number} payée - Devis Simple`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#16a34a">Bonjour ${name},</h2>
      <p>Votre facture <strong>${number}</strong> a été marquée comme payée.</p>
    </div>`,
  }),
  subscriptionStarted: (name: string) => ({
    subject: 'Abonnement activé - Devis Simple',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#1B3C96">Bonjour ${name},</h2>
      <p>Votre abonnement Devis Simple est maintenant actif.</p>
      <p>Vous avez accès à toutes les fonctionnalités sans limite.</p>
    </div>`,
  }),
  limitReached: (name: string) => ({
    subject: 'Limite de documents atteinte - Devis Simple',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#1B3C96">Bonjour ${name},</h2>
      <p>Vous avez atteint la limite de 3 documents gratuits.</p>
      <p><a href="https://app.devis-simple.fr/dashboard/subscription" style="background:#1B3C96;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Souscrire maintenant</a></p>
    </div>`,
  }),
};
