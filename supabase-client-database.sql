-- Etapa 2: banco de clientes com vinculo confiavel nos agendamentos.

alter table appointments
add column if not exists client_id uuid references clients(id) on delete set null;

create index if not exists appointments_client_id_idx
on appointments(client_id);

create index if not exists clients_business_phone_idx
on clients(business_id, phone);

update appointments a
set client_id = c.id
from clients c
where a.client_id is null
  and c.business_id = a.business_id
  and c.name = a.client_name;
