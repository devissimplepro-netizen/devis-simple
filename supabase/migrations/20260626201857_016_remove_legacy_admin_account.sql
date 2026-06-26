
-- Remove the old manually-created admin account (created via direct SQL migrations).
-- The new admin will be created properly via Supabase Authentication dashboard.
-- handle_new_user trigger will automatically create the public.users row.
-- Admin then sets is_admin = true via the Supabase dashboard SQL editor.

DO $$
DECLARE
  admin_id uuid := 'd5038d91-7cb5-4a09-9a67-1448229ea79c';
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = admin_id) THEN
    DELETE FROM auth.refresh_tokens WHERE user_id::text = admin_id::text;
    DELETE FROM auth.sessions       WHERE user_id = admin_id;
    DELETE FROM auth.identities     WHERE user_id = admin_id;
    DELETE FROM auth.users          WHERE id = admin_id;
  END IF;

  DELETE FROM public.users WHERE id = admin_id;
END $$;
