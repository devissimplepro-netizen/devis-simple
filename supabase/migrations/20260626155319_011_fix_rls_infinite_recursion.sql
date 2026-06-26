-- Fix infinite recursion: replace self-referencing subquery with a SECURITY DEFINER function

-- Function runs as postgres (bypasses RLS), so no recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM users WHERE id = auth.uid() LIMIT 1),
    false
  );
$$;

-- Drop the recursive policies
DROP POLICY IF EXISTS "admin_select_all_users" ON public.users;
DROP POLICY IF EXISTS "admin_select_all_subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "admin_select_all_companies" ON public.companies;

-- Recreate using is_admin() — no recursion
CREATE POLICY "admin_select_all_users" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "admin_select_all_subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "admin_select_all_companies" ON public.companies
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());
