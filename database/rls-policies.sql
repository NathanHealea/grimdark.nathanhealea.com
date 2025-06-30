

----
-- RLS Policies for public.users table
----

-- Enable RLS on the users table (already in your schema, but included for completeness)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can select on the users table.
CREATE POLICY "Allow public read access to users"
ON public.users FOR SELECT
USING (true);

-- 2. Any authenticated user with the role 'admin' or 'superadmin' can insert on the users table.
-- The WITH CHECK clause ensures that the user performing the insert has the required role.
CREATE POLICY "Admins/Superadmins can insert users"
ON public.users FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id
    FROM public.user_auth_roles
    WHERE role IN ('admin', 'superadmin')
  )
);

-- 3. Any authenticated user whose auth.uid matches the user_id in the users table can update their data.
-- The USING clause restricts which rows can be updated (only their own).
-- The WITH CHECK clause ensures that the user_id column isn't changed to something else (though it's a primary key, good practice).
CREATE POLICY "Authenticated users can update their own user data"
ON public.users FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Any authenticated user with the role 'admin' or 'superadmin' can update any record on the users table.
-- The USING clause restricts which rows can be updated (any row, but only by admins/superadmins).
CREATE POLICY "Admins/Superadmins can update any user data"
ON public.users FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id
    FROM public.user_auth_roles
    WHERE role IN ('admin', 'superadmin')
  )
);

-- 5. Any authenticated user with the role 'admin' or 'superadmin' can delete any record on the users table.
-- The USING clause restricts which rows can be deleted (any row, but only by admins/superadmins).
CREATE POLICY "Admins/Superadmins can delete users"
ON public.users FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id
    FROM public.user_auth_roles
    WHERE role IN ('admin', 'superadmin')
  )
);

----
-- RLS Policies for public.user_auth_roles table
----

-- Enable RLS on the user_auth_roles table (already in your schema, but included for completeness)
ALTER TABLE public.user_auth_roles ENABLE ROW LEVEL SECURITY;

-- 1. Allows `supabase_auth_admin` to read all user roles.
create policy "Allow auth admin to read user roles"
on public.user_auth_roles
as permissive
for select
to supabase_auth_admin
using (true);

-- 2. Anyone can select on the user_auth_roles table.
CREATE POLICY "Allow public read access to user_auth_roles"
ON public.user_auth_roles FOR SELECT
USING (true);

-- 3. Only Superadmins can insert a record on the user_auth_roles table.
-- The WITH CHECK clause ensures that the user performing the insert has the 'superadmin' role.
-- NOTE: Not implemented, needs validation and testing.
CREATE POLICY "Superadmins can insert user roles"
ON public.user_auth_roles FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id
    FROM public.user_auth_roles
    WHERE role = 'superadmin'
  )
);

-- 3. Any authenticated user with the role 'admin' or 'superadmin' can delete any record on the user_auth_roles table.
-- The USING clause restricts which rows can be deleted (any row, but only by admins/superadmins).
CREATE POLICY "Admins/Superadmins can delete user roles"
ON public.user_auth_roles FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id
    FROM public.user_auth_roles
    WHERE role IN ('admin', 'superadmin')
  )
);


----
-- RLS Policies for public.armies table
----

-- Enable RLS on the armies table (already in your schema, but included for completeness)
ALTER TABLE public.armies ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can select on the armies table.
CREATE POLICY "Allow public read access to armies"
ON public.armies FOR SELECT
USING (true);

-- 2. Any authenticated user with the role 'admin' or 'superadmin' can insert on the armies table.
-- The WITH CHECK clause ensures that the user performing the insert has the required role.
CREATE POLICY "Admins/Superadmins can insert armies"
ON public.armies FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id
    FROM public.user_auth_roles
    WHERE role IN ('admin', 'superadmin')
  )
);

-- 3. Any authenticated user with the role 'admin' or 'superadmin' can delete any record on the armies table.
-- The USING clause restricts which rows can be deleted (any row, but only by admins/superadmins).
CREATE POLICY "Admins/Superadmins can delete armies"
ON public.armies FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id
    FROM public.user_auth_roles
    WHERE role IN ('admin', 'superadmin')
  )
);


----
-- RLS Policies for public.user_armies table
----

-- Enable RLS on the user_armies table (already in your schema, but included for completeness)
ALTER TABLE public.user_armies ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can select on the user_armies table.
CREATE POLICY "Allow public read access to users armies"
ON public.user_armies FOR SELECT
USING (true);

-- 2. Any authenticated user with the role 'admin' or 'superadmin' can insert on the user_armies table.
-- The WITH CHECK clause ensures that the user performing the insert has the required role.
CREATE POLICY "Admins/Superadmins can insert user armies"
ON public.user_armies FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id
    FROM public.user_auth_roles
    WHERE role IN ('admin', 'superadmin')
  )
);

-- 3. Any authenticated user with the role 'admin' or 'superadmin' can delete any record on the user_armies table.
-- The USING clause restricts which rows can be deleted (any row, but only by admins/superadmins).
CREATE POLICY "Admins/Superadmins can delete user armies"
ON public.user_armies FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id
    FROM public.user_auth_roles
    WHERE role IN ('admin', 'superadmin')
  )
);

-- 4. Any authenticated user can insert a record on the user_armies table.
-- The WITH CHECK clause allows any authenticated user to insert a record.
-- This policy does not restrict the user_id, allowing any authenticated user to create a new army association.

CREATE POLICY "Users can delete their own armies"
ON public.user_armies FOR DELETE
USING (
  user_id = (SELECT id FROM users WHERE uid = auth.uid())
);

