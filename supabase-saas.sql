create table if not exists business_users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz default now(),
  unique (business_id, user_id)
);

alter table business_users enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'business_users'
      and policyname = 'business users can read own link'
  ) then
    create policy "business users can read own link"
    on business_users for select
    to authenticated
    using (user_id = auth.uid());
  end if;
end
$$;

-- Depois de criar o usuario no Supabase Auth, copie o ID dele e rode:
-- insert into business_users (business_id, user_id, role)
-- values (
--   '11111111-1111-1111-1111-111111111111',
--   'COLE_AQUI_O_ID_DO_USUARIO_AUTH',
--   'owner'
-- )
-- on conflict (business_id, user_id) do nothing;

-- Proxima fase: trocar as policies demo abertas por regras com exists em business_users.
-- Exemplo para businesses:
-- using (
--   exists (
--     select 1 from business_users bu
--     where bu.business_id = businesses.id
--       and bu.user_id = auth.uid()
--   )
-- )
