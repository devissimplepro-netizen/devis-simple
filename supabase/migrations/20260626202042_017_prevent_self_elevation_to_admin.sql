
-- Prevent any authenticated user from self-elevating to admin via the client API.
-- is_admin can only be set via service role (Supabase dashboard SQL).

DROP POLICY IF EXISTS "update_own_user" ON public.users;

CREATE POLICY "update_own_user" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Block any attempt to set is_admin = true unless requester is already admin
    AND (is_admin = false OR is_admin())
  );
