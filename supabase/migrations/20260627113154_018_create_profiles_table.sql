
-- Create profiles table (replaces users for auth/role purposes)
CREATE TABLE IF NOT EXISTS public.profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'artisan' CHECK (role IN ('admin', 'artisan')),
  full_name TEXT,
  phone     TEXT,
  trade     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Each user reads only their own profile
CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Each user can insert their own profile (used by trigger + onboarding)
CREATE POLICY "insert_own_profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Each user can update their own profile (role column protected by trigger below)
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Prevent regular users from changing their own role
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Allow only service_role / postgres to change role
  IF NEW.role IS DISTINCT FROM OLD.role
     AND current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'authenticated'
  THEN
    RAISE EXCEPTION 'Modification du rôle non autorisée';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER no_role_self_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

-- Auto update_at
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();

-- Backfill existing users into profiles
INSERT INTO public.profiles (id, role, full_name, phone, trade)
SELECT
  u.id,
  CASE WHEN u.is_admin = true THEN 'admin' ELSE 'artisan' END,
  u.full_name,
  u.phone,
  u.trade
FROM public.users u
ON CONFLICT (id) DO UPDATE SET
  role      = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  phone     = EXCLUDED.phone,
  trade     = EXCLUDED.trade;

-- Update handle_new_user trigger to also create a profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, role, full_name, phone, trade)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'artisan'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'trade'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
