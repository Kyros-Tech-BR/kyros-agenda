-- Etapa 1: seguranca por cliente Kyros.
-- Execute este arquivo depois que o usuario do salao ja estiver vinculado
-- em business_users.

drop policy if exists "demo read businesses" on businesses;
drop policy if exists "demo update businesses" on businesses;
drop policy if exists "demo read services" on services;
drop policy if exists "demo update services" on services;
drop policy if exists "demo read clients" on clients;
drop policy if exists "demo insert clients" on clients;
drop policy if exists "demo update clients" on clients;
drop policy if exists "demo read appointments" on appointments;
drop policy if exists "demo insert appointments" on appointments;
drop policy if exists "demo update appointments" on appointments;
drop policy if exists "owners can read own business" on businesses;
drop policy if exists "owners can update own business" on businesses;
drop policy if exists "owners can read own services" on services;
drop policy if exists "owners can update own services" on services;
drop policy if exists "owners can read own clients" on clients;
drop policy if exists "owners can insert own clients" on clients;
drop policy if exists "owners can update own clients" on clients;
drop policy if exists "owners can read own appointments" on appointments;
drop policy if exists "owners can insert own appointments" on appointments;
drop policy if exists "owners can update own appointments" on appointments;

alter table businesses enable row level security;
alter table services enable row level security;
alter table clients enable row level security;
alter table appointments enable row level security;
alter table business_users enable row level security;

drop policy if exists "business users can read own link" on business_users;
create policy "business users can read own link"
on business_users for select
to authenticated
using (user_id = auth.uid());

create policy "owners can read own business"
on businesses for select
to authenticated
using (
  exists (
    select 1 from business_users bu
    where bu.business_id = businesses.id
      and bu.user_id = auth.uid()
  )
);

create policy "owners can update own business"
on businesses for update
to authenticated
using (
  exists (
    select 1 from business_users bu
    where bu.business_id = businesses.id
      and bu.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from business_users bu
    where bu.business_id = businesses.id
      and bu.user_id = auth.uid()
  )
);

create policy "owners can read own services"
on services for select
to authenticated
using (
  exists (
    select 1 from business_users bu
    where bu.business_id = services.business_id
      and bu.user_id = auth.uid()
  )
);

create policy "owners can update own services"
on services for update
to authenticated
using (
  exists (
    select 1 from business_users bu
    where bu.business_id = services.business_id
      and bu.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from business_users bu
    where bu.business_id = services.business_id
      and bu.user_id = auth.uid()
  )
);

create policy "owners can read own clients"
on clients for select
to authenticated
using (
  exists (
    select 1 from business_users bu
    where bu.business_id = clients.business_id
      and bu.user_id = auth.uid()
  )
);

create policy "owners can insert own clients"
on clients for insert
to authenticated
with check (
  exists (
    select 1 from business_users bu
    where bu.business_id = clients.business_id
      and bu.user_id = auth.uid()
  )
);

create policy "owners can update own clients"
on clients for update
to authenticated
using (
  exists (
    select 1 from business_users bu
    where bu.business_id = clients.business_id
      and bu.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from business_users bu
    where bu.business_id = clients.business_id
      and bu.user_id = auth.uid()
  )
);

create policy "owners can read own appointments"
on appointments for select
to authenticated
using (
  exists (
    select 1 from business_users bu
    where bu.business_id = appointments.business_id
      and bu.user_id = auth.uid()
  )
);

create policy "owners can insert own appointments"
on appointments for insert
to authenticated
with check (
  exists (
    select 1 from business_users bu
    where bu.business_id = appointments.business_id
      and bu.user_id = auth.uid()
  )
);

create policy "owners can update own appointments"
on appointments for update
to authenticated
using (
  exists (
    select 1 from business_users bu
    where bu.business_id = appointments.business_id
      and bu.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from business_users bu
    where bu.business_id = appointments.business_id
      and bu.user_id = auth.uid()
  )
);
