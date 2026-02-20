  insert into public.user_roles (user_id, role_id)
  select u.id, r.id
  from auth.users u
  cross join public.roles r
  where u.email = 'llamanat3r@gmail.com'
    and r.name in ('member')
  on conflict do nothing;