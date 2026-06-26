/*
# Fix RLS pour candidatures anonymes et logos bucket

1. Candidatures : INSERT policy pour les utilisateurs non connectés
2. Logos bucket : INSERT/SELECT pour les uploads anonymes (candidatures)
*/

-- Allow anonymous insert on candidatures
DROP POLICY IF EXISTS "anon_insert_candidatures" ON candidatures;
CREATE POLICY "anon_insert_candidatures" ON candidatures FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Allow anonymous SELECT on candidatures (for admin checks)
DROP POLICY IF EXISTS "anon_select_candidatures" ON candidatures;
CREATE POLICY "anon_select_candidatures" ON candidatures FOR SELECT
  TO anon USING (true);

-- Logos bucket: allow anonymous uploads for candidatures
DROP POLICY IF EXISTS "anon_upload_logos" ON storage.objects;
CREATE POLICY "anon_upload_logos" ON storage.objects FOR INSERT
  TO anon WITH CHECK (bucket_id = 'logos');

DROP POLICY IF EXISTS "anon_select_logos" ON storage.objects;
CREATE POLICY "anon_select_logos" ON storage.objects FOR SELECT
  TO anon USING (bucket_id = 'logos');
