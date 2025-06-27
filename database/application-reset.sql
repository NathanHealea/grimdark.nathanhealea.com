--
-- This script will drop all user-defined objects in the 'public' schema,
-- taking into account their dependencies.
--
-- It's crucial to understand the order:
-- 1. Policies (depend on tables)
-- 2. Triggers (depend on functions and tables)
-- 3. Functions (can depend on types and tables)
-- 4. Tables (can depend on types and other tables via foreign keys)
-- 5. Custom Types (enums, depend on nothing in this schema, but other objects depend on them)
--

---
--- 1. Drop Row Level Security (RLS) Policies
---
-- Policies are tied to tables, so drop them first to avoid errors when dropping tables.
DROP POLICY IF EXISTS "Allow auth admin to read user roles" ON public.user_roles;


---
--- 2. Drop Triggers
---
-- Triggers execute functions, so drop them before the functions they call.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;


---
--- 3. Drop Functions
---
-- Functions might be referenced by triggers or other database objects.
-- Drop them before the tables or types they might implicitly depend on,
-- but after any triggers that call them.
DROP FUNCTION IF EXISTS public.handle_new_user ();
DROP FUNCTION IF EXISTS public.custom_access_token_hook (JSONB);


---
--- 4. Drop Tables
---
-- Tables have foreign key constraints and other dependencies.
-- We use CASCADE to ensure that any dependent objects (like constraints)
-- that aren't explicitly dropped are handled.
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;


---
--- 5. Drop Custom Types (Enums)
---
-- Custom types, like ENUMs, are often used in table column definitions.
-- They must be dropped last, after all tables that reference them are gone.
DROP TYPE IF EXISTS public.role;
DROP TYPE IF EXISTS public.status; -- Assuming 'public.status' exists from previous context, though not defined in this specific schema.