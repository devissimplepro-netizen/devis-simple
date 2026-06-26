
-- Fix admin account: purge stale sessions/tokens and align metadata with GoTrue expectations

DO $$
DECLARE
  admin_id uuid := 'd5038d91-7cb5-4a09-9a67-1448229ea79c';
BEGIN
  -- 1. Remove orphaned refresh tokens (session_id IS NULL = created by old GoTrue, incompatible)
  DELETE FROM auth.refresh_tokens
  WHERE user_id::uuid = admin_id;

  -- 2. Remove all sessions for admin (will be freshly created on next sign-in)
  DELETE FROM auth.sessions
  WHERE user_id = admin_id;

  -- 3. Align raw_user_meta_data with what admin.createUser() sets
  --    (GoTrue checks this during auth flows in newer versions)
  UPDATE auth.users
  SET raw_user_meta_data = '{"email_verified": true}'::jsonb,
      updated_at = now()
  WHERE id = admin_id;

  -- 4. Ensure identity_data also carries email_verified = true (matches artisan identities)
  UPDATE auth.identities
  SET identity_data = identity_data || '{"email_verified": true}'::jsonb,
      updated_at = now()
  WHERE user_id = admin_id
    AND provider = 'email';

END $$;
