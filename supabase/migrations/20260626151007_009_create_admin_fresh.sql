-- Create the admin auth user
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'mohaa-elamri@hotmail.com',
  crypt('M19962006m!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Create public user row with is_admin = true
INSERT INTO public.users (id, email, full_name, is_admin, created_at, updated_at)
SELECT id, email, 'Admin', true, now(), now()
FROM auth.users
WHERE email = 'mohaa-elamri@hotmail.com';
