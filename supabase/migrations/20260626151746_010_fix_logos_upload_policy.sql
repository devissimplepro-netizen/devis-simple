-- Fix: allow any authenticated user to upload to logos bucket (no path restriction)
-- The previous policy required path to start with auth.uid() which blocks admin uploads

DROP POLICY IF EXISTS "Users can upload their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own logos" ON storage.objects;

CREATE POLICY "authenticated_upload_logos" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'logos');

CREATE POLICY "authenticated_update_logos" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'logos');

CREATE POLICY "authenticated_delete_logos" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'logos');
