const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials':         'Email ou mot de passe incorrect',
  'invalid_credentials':               'Email ou mot de passe incorrect',
  'Email not confirmed':               'Veuillez confirmer votre adresse email avant de vous connecter',
  'email_not_confirmed':               'Veuillez confirmer votre adresse email avant de vous connecter',
  'User not found':                    'Aucun compte associé à cet email',
  'user_not_found':                    'Aucun compte associé à cet email',
  'User already registered':           'Un compte avec cet email existe déjà',
  'user_already_exists':               'Un compte avec cet email existe déjà',
  'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
  'weak_password':                     'Le mot de passe est trop faible (minimum 6 caractères)',
  'over_email_send_rate_limit':        'Trop d\'emails envoyés, veuillez patienter quelques minutes',
  'over_request_rate_limit':           'Trop de tentatives, veuillez patienter quelques minutes',
  'Too many requests':                 'Trop de tentatives, veuillez patienter quelques minutes',
  'signup_disabled':                   'Les inscriptions sont actuellement désactivées',
  'Signup is disabled':                'Les inscriptions sont actuellement désactivées',
  'Network request failed':            'Erreur réseau, vérifiez votre connexion internet',
  'Failed to fetch':                   'Erreur réseau, vérifiez votre connexion internet',
  'invalid_email':                     'Adresse email invalide',
  'Invalid email':                     'Adresse email invalide',
  'Accès non autorisé':                'Accès non autorisé',
};

export function translateAuthError(message?: string): string {
  if (!message) return 'Une erreur est survenue, veuillez réessayer';

  for (const [key, translation] of Object.entries(ERROR_MAP)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return translation;
    }
  }

  return 'Une erreur est survenue, veuillez réessayer';
}
