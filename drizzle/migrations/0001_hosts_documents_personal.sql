alter type public.booking_status add value if not exists 'personal';
alter type public.booking_status add value if not exists 'host_collab';

create table public.hosts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text,
  phone text,
  apartment_number text,
  notes text,
  total_owed numeric not null default 0
);
grant select, insert, update, delete on public.hosts to authenticated;
grant all on public.hosts to service_role;
alter table public.hosts enable row level security;
create policy "Admins manage hosts" on public.hosts for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

alter table public.bookings add column is_personal_use boolean not null default false;
alter table public.bookings add column host_id uuid references public.hosts(id) on delete set null;
alter table public.bookings add column host_amount numeric not null default 0;

create or replace function public.validate_booking()
returns trigger language plpgsql set search_path = public
as $$ begin
  if new.check_out <= new.check_in then raise exception 'La partenza deve essere dopo l''arrivo'; end if;
  if new.adults + new.children > 4 or new.adults < 1 then raise exception 'Massimo 4 ospiti, almeno 1 adulto'; end if;
  if new.source not in ('whatsapp','direct','manual','personal','host') then raise exception 'Origine non valida'; end if;
  if new.is_personal_use then
    new.status := 'personal'; new.source := 'personal';
    new.price_per_night := 0; new.total_price := 0; new.deposit_paid := 0;
  end if;
  if new.source = 'host' and new.host_id is null then raise exception 'Seleziona l''host della collaborazione'; end if;
  if new.source <> 'host' then new.host_id := null; new.host_amount := 0; end if;
  new.total_nights := new.check_out - new.check_in;
  return new;
end $$;

create or replace function public.recompute_host_owed()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  update public.hosts h set total_owed = coalesce((
    select sum(b.host_amount) from public.bookings b where b.host_id = h.id and b.status::text <> 'cancelled'), 0)
  where h.id in (coalesce(new.host_id, old.host_id), coalesce(old.host_id, new.host_id));
  return null;
end $$;
create trigger bookings_host_owed after insert or update or delete on public.bookings for each row execute function public.recompute_host_owed();

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  name text not null,
  file_url text not null,
  file_type text,
  uploaded_by text not null default 'owner' check (uploaded_by in ('owner','guest'))
);
grant select, insert, update, delete on public.documents to authenticated;
grant all on public.documents to service_role;
alter table public.documents enable row level security;
create policy "Admins manage documents" on public.documents for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));