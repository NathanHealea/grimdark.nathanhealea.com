-- ============================================================
-- Migration: Create roles and user_roles tables
-- Feature: User Roles (Authentication & User Accounts)
-- ============================================================

-- 1. Create roles lookup table
create table public.roles (
  id serial primary key,
  name text unique not null
);

-- Seed the three default roles
insert into public.roles (name) values ('user'), ('member'), ('admin');

-- 2. Create user_roles join table (many-to-many)
create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id int not null references public.roles(id),
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

-- 3. RLS on roles table
alter table public.roles enable row level security;

create policy "Roles are viewable by authenticated users"
  on public.roles
  for select
  to authenticated
  using (true);

-- No INSERT/UPDATE/DELETE policies — roles are managed via migrations only.

-- 4. RLS on user_roles table
alter table public.user_roles enable row level security;

-- Anyone authenticated can see role assignments
create policy "User roles are viewable by authenticated users"
  on public.user_roles
  for select
  to authenticated
  using (true);

-- Only admins can insert role assignments (not for themselves)
create policy "Admins can assign roles to other users"
  on public.user_roles
  for insert
  to authenticated
  with check (
    auth.uid() != user_id
    and exists (
      select 1 from public.user_roles ur
        join public.roles r on r.id = ur.role_id
       where ur.user_id = auth.uid()
         and r.name = 'admin'
    )
  );

-- Only admins can update role assignments (not their own)
create policy "Admins can update roles for other users"
  on public.user_roles
  for update
  to authenticated
  using (
    auth.uid() != user_id
    and exists (
      select 1 from public.user_roles ur
        join public.roles r on r.id = ur.role_id
       where ur.user_id = auth.uid()
         and r.name = 'admin'
    )
  )
  with check (
    auth.uid() != user_id
    and exists (
      select 1 from public.user_roles ur
        join public.roles r on r.id = ur.role_id
       where ur.user_id = auth.uid()
         and r.name = 'admin'
    )
  );

-- Only admins can delete role assignments (not their own, and cannot remove 'user' role)
create policy "Admins can remove roles from other users"
  on public.user_roles
  for delete
  to authenticated
  using (
    auth.uid() != user_id
    and exists (
      select 1 from public.user_roles ur
        join public.roles r on r.id = ur.role_id
       where ur.user_id = auth.uid()
         and r.name = 'admin'
    )
    -- Prevent removing the 'user' base role
    and role_id != (select id from public.roles where name = 'user')
  );

-- ============================================================
-- Helper SQL function
-- ============================================================

-- 5. get_user_roles: returns an array of role names for a given user
create or replace function public.get_user_roles(user_uuid uuid)
returns text[] as $$
  select coalesce(
    array_agg(r.name order by r.id),
    array['user']::text[]
  )
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = user_uuid;
$$ language sql stable security definer;

-- ============================================================
-- Auto-assign 'user' role on profile creation
-- ============================================================

-- 6. Trigger function: insert 'user' role when a profile is created
create or replace function public.handle_new_profile_role()
returns trigger as $$
begin
  insert into public.user_roles (user_id, role_id)
  select new.id, r.id
    from public.roles r
   where r.name = 'user';
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_assign_role
  after insert on public.profiles
  for each row
  execute function public.handle_new_profile_role();
