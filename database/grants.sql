
----
-- Grants on teh `public` schema
----

-- Grant usage on the public schema to `supabase_auth_admin` role.
grant usage on schema public to supabase_auth_admin;


----
-- Grants on the `public.custom_access_token_hook` function

-- Grant execution rights on the `custom_access_token_hook` function to `supabase_auth_admin`.
grant execute on function public.custom_access_token_hook to supabase_auth_admin;

-- Revoke execution rights from `authenticated`, `anon`, and `public` roles
-- to ensure only the auth system can call this sensitive function.
revoke execute on function public.custom_access_token_hook
from authenticated, anon, public;


----
-- 1. Grants on the `public.users` table
----

-- NONE for `public.users` table

----
-- 2. Grants on the `public.users_roles` table
----

-- Grant all privileges on the `public.user_auth_roles` table to `supabase_auth_admin`.
grant all on table public.user_auth_roles to supabase_auth_admin;

-- Revoke all privileges from `authenticated`, `anon`, and `public` roles on `public.user_auth_roles`.
revoke all on table public.user_auth_roles
from anon, public;

----
--- 3. Grants on the `public.armies` table
---- 

-- Grant all privileges on the `public.armies' table to authenticated, anon, and public roles.
grant all on table public.armies to authenticated, anon, public;

