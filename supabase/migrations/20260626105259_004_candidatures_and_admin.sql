/*
# Ajout du système de candidatures et des rôles admin

1. Modifications
   - Ajoute un champ `is_admin` (booléen) sur la table `users` pour identifier les admins
   - Crée la table `candidatures` pour stocker les demandes d'artisans

2. Nouvelle table `candidatures`
   - `id` (uuid, PK)
   - `full_name` (text, nom complet)
   - `email` (text, email)
   - `phone` (text, téléphone)
   - `trade` (text, métier)
   - `company_name` (text, nom de l'entreprise)
   - `siret` (text, SIRET)
   - `message` (text, message libre)
   - `status` (text, défaut 'pending', valeurs : pending, approved, rejected)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

3. Sécurité
   - RLS activé sur `candidatures`
   - Tout le monde peut insérer (candidater)
   - Seuls les admins peuvent lire/mettre à jour/supprimer
   - Le flag `is_admin` est utilisé côté admin pour les politiques
*/

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS candidatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  trade TEXT NOT NULL,
  company_name TEXT,
  siret TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE candidatures ENABLE ROW LEVEL SECURITY;

-- Tout le monde (anon + authenticated) peut insérer une candidature
DROP POLICY IF EXISTS "anon_insert_candidatures" ON candidatures;
CREATE POLICY "anon_insert_candidatures" ON candidatures FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Seuls les admins peuvent voir les candidatures
DROP POLICY IF EXISTS "admin_select_candidatures" ON candidatures;
CREATE POLICY "admin_select_candidatures" ON candidatures FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE));

-- Seuls les admins peuvent mettre à jour les candidatures
DROP POLICY IF EXISTS "admin_update_candidatures" ON candidatures;
CREATE POLICY "admin_update_candidatures" ON candidatures FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE));

-- Seuls les admins peuvent supprimer les candidatures
DROP POLICY IF EXISTS "admin_delete_candidatures" ON candidatures;
CREATE POLICY "admin_delete_candidatures" ON candidatures FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE));

CREATE INDEX IF NOT EXISTS idx_candidatures_status ON candidatures(status);
CREATE INDEX IF NOT EXISTS idx_candidatures_created_at ON candidatures(created_at DESC);

CREATE TRIGGER update_candidatures_updated_at
  BEFORE UPDATE ON candidatures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
