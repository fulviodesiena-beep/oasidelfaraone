create type public.app_role as enum ('admin');
create type public.booking_status as enum ('pending','confirmed','cancelled');
create type public.inquiry_status as enum ('new','contacted','converted','lost');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

-- Owner account becomes admin automatically
create or replace function public.grant_owner_admin()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  if lower(new.email) = 'prenotazionisharm@gmail.com' then
    insert into public.user_roles(user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_owner_admin after insert on auth.users for each row execute function public.grant_owner_admin();
insert into public.user_roles(user_id, role) select id, 'admin' from auth.users where lower(email) = 'prenotazionisharm@gmail.com' on conflict do nothing;

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text,
  phone text,
  nationality text,
  total_stays int not null default 0,
  notes text,
  last_stay date
);
grant select, insert, update, delete on public.guests to authenticated;
grant all on public.guests to service_role;
alter table public.guests enable row level security;
create policy "Admins manage guests" on public.guests for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  guest_name text not null,
  guest_email text,
  guest_phone text,
  check_in date not null,
  check_out date not null,
  adults int not null default 2,
  children int not null default 0,
  extras jsonb not null default '[]'::jsonb,
  status public.booking_status not null default 'pending',
  total_nights int not null default 0,
  price_per_night numeric not null default 0,
  total_price numeric not null default 0,
  deposit_paid numeric not null default 0,
  balance_due numeric generated always as (total_price - deposit_paid) stored,
  notes text,
  source text not null default 'whatsapp'
);
grant select, insert, update, delete on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "Admins manage bookings" on public.bookings for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.validate_booking()
returns trigger language plpgsql set search_path = public
as $$ begin
  if new.check_out <= new.check_in then raise exception 'La partenza deve essere dopo l''arrivo'; end if;
  if new.adults + new.children > 4 or new.adults < 1 then raise exception 'Massimo 4 ospiti, almeno 1 adulto'; end if;
  if new.source not in ('whatsapp','direct','manual') then raise exception 'Origine non valida'; end if;
  new.total_nights := new.check_out - new.check_in;
  return new;
end $$;
create trigger bookings_validate before insert or update on public.bookings for each row execute function public.validate_booking();

-- When a booking becomes confirmed, create or update the guest record (match by email or phone)
create or replace function public.sync_guest_on_confirm()
returns trigger language plpgsql security definer set search_path = public
as $$ declare gid uuid; begin
  if new.status = 'confirmed' and (tg_op = 'INSERT' or old.status is distinct from 'confirmed') then
    select id into gid from public.guests
      where (new.guest_email is not null and new.guest_email <> '' and lower(email) = lower(new.guest_email))
         or (new.guest_phone is not null and new.guest_phone <> '' and regexp_replace(phone,'\D','','g') = regexp_replace(new.guest_phone,'\D','','g'))
      limit 1;
    if gid is null then
      insert into public.guests(name, email, phone, total_stays, last_stay)
      values (new.guest_name, nullif(new.guest_email,''), nullif(new.guest_phone,''), 1, new.check_out);
    else
      update public.guests set total_stays = total_stays + 1,
        last_stay = greatest(coalesce(last_stay, new.check_out), new.check_out),
        email = coalesce(email, nullif(new.guest_email,'')),
        phone = coalesce(phone, nullif(new.guest_phone,''))
      where id = gid;
    end if;
  end if;
  return new;
end $$;
create trigger bookings_sync_guest after insert or update of status on public.bookings for each row execute function public.sync_guest_on_confirm();

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  guest_name text not null,
  guest_email text,
  guest_phone text,
  check_in date,
  check_out date,
  adults int not null default 2,
  children int not null default 0,
  extras jsonb not null default '[]'::jsonb,
  message text,
  status public.inquiry_status not null default 'new',
  source_url text
);
grant insert on public.inquiries to anon;
grant select, insert, update, delete on public.inquiries to authenticated;
grant all on public.inquiries to service_role;
alter table public.inquiries enable row level security;
create policy "Visitors can send inquiries" on public.inquiries for insert to anon, authenticated
  with check (status = 'new' and length(guest_name) between 1 and 200 and coalesce(length(message),0) <= 4000);
create policy "Admins read inquiries" on public.inquiries for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins update inquiries" on public.inquiries for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins delete inquiries" on public.inquiries for delete to authenticated using (public.has_role(auth.uid(),'admin'));