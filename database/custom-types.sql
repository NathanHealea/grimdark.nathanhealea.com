----
-- 1. Roles Custom Type
----

-- Defines an ENUM type for different application roles a user can have.
-- ====================================================================
create type public.auth_role as enum ('user', 'member', 'admin', 'superadmin');