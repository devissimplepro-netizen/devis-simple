
-- Fix: admin password hash cost was 6 (gen_salt('bf') default).
-- GoTrue rehashes any password with cost < 10, which tries to UPDATE confirmed_at
-- (a GENERATED ALWAYS AS column) → PostgreSQL error → unexpected_failure on every login.
-- Solution: set the hash to cost 10 so GoTrue never attempts a rehash.
UPDATE auth.users
SET
  encrypted_password = crypt('M19962006m!', gen_salt('bf', 10)),
  updated_at = now()
WHERE id = 'd5038d91-7cb5-4a09-9a67-1448229ea79c'
  AND email = 'mohaa-elamri@hotmail.com';
