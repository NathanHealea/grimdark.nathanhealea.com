-- 1. Drop triggers (must be dropped before dropping functions/tables)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_change ON auth.users;

-- 2. Drop functions (must be dropped before dropping tables/types they depend on)
DROP FUNCTION IF EXISTS public.handle_new_or_update_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_update() CASCADE;
DROP FUNCTION IF EXISTS public.custom_access_token_hook(jsonb) CASCADE;

-- 3. Drop RLS policies (optional, but good practice before dropping tables)
DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;
DROP POLICY IF EXISTS "Admins/Superadmins can insert users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update their own user data" ON public.users;
DROP POLICY IF EXISTS "Admins/Superadmins can update any user data" ON public.users;
DROP POLICY IF EXISTS "Admins/Superadmins can delete users" ON public.users;

DROP POLICY IF EXISTS "Allow auth admin to read user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow public read access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins/Superadmins can delete user roles" ON public.user_roles;

DROP POLICY IF EXISTS "Allow public read access to armies" ON public.armies;
DROP POLICY IF EXISTS "Admins/Superadmins can insert armies" ON public.armies;
DROP POLICY IF EXISTS "Admins/Superadmins can delete armies" ON public.armies;

-- 4. Drop tables (must be dropped before dropping types)
DROP TABLE IF EXISTS public.armies CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- 5. Drop custom types (must be last)
DROP TYPE IF EXISTS public.role CASCADE;