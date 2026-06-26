
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Insert auth user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'mohaa-elamri@hotmail.com',
    crypt('M19962006m!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated',
    'authenticated'
  );

  -- Create identity record
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at,
    last_sign_in_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', 'mohaa-elamri@hotmail.com'),
    'email',
    new_user_id::text,
    now(),
    now(),
    now()
  );

  -- Create entry in public.users with admin flag
  INSERT INTO public.users (id, email, full_name, is_admin, created_at, updated_at)
  VALUES (new_user_id, 'mohaa-elamri@hotmail.com', 'Admin', true, now(), now());

END $$;
