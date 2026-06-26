-- Allow admin to read all users and subscriptions
CREATE POLICY "admin_select_all_users" ON public.users
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "admin_select_all_subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "admin_select_all_companies" ON public.companies
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );
