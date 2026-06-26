/*
# Ajout de logo_url sur candidatures et is_subscribed sur users

1. Nouvelles colonnes
   - `candidatures.logo_url` : URL du logo uploadé par le candidat
   - `users.is_subscribed` : booléen indiquant si l'utilisateur est abonné
   - `users.phone` : numéro de téléphone de l'utilisateur
   - `users.trade` : métier de l'artisan

2. Modifications
   - `users` : ajout de `is_admin`, `is_subscribed`, `phone`, `trade`
   - `companies` : ajout de `siret` (si absent)

3. Sécurité
   - Les nouvelles colonnes sont couvertes par les RLS existantes
*/

ALTER TABLE candidatures ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trade TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS siret TEXT;
