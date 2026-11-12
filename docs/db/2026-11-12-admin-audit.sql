-- Admin audit 12/11/2026 — applied to the live database through the Lovable SQL console.
-- Idempotent: safe to run again.

-- 1. Defence in depth: RLS already blocks everything, but anon should not even hold grants
--    on private tables. Public site keeps: INSERT on inquiries, column SELECT on rooms, RPCs.
do $$ declare t text; begin
  foreach t in array array['availability_blocks','bookings','contacts','data_backups','documents','email_log','expenses',
    'guests','hosts','newsletter_issues','occasions','settings','travelers','user_roles'] loop
    execute format('revoke all on table public.%I from anon', t);
  end loop;
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('revoke truncate, trigger, references on table public.%I from anon, authenticated', t);
  end loop;
end $$;
revoke update, delete on table public.inquiries from anon;
-- Roles are granted only by the grant_owner_admin trigger (security definer): no user can write them.
revoke insert, update, delete on table public.user_roles from authenticated;

-- 2. Expenses spread over several months (e.g. yearly condominium fee = 12).
alter table public.expenses add column if not exists amortize_months integer not null default 1;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'expenses_amortize_months_check') then
    alter table public.expenses add constraint expenses_amortize_months_check check (amortize_months between 1 and 36);
  end if;
end $$;
update public.expenses set amortize_months = 12
 where amortize_months = 1 and (lower(category) = 'condominio' and coalesce(note, '') ilike '%annual%');

-- 3. Host balance = what the host still has to pay us (sum of open balances), not a manual field.
create or replace function public.recompute_host_owed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.hosts h set total_owed = coalesce((
    select sum(greatest(b.balance_due, 0)) from public.bookings b where b.host_id = h.id and b.status::text <> 'cancelled'), 0)
  where h.id in (coalesce(new.host_id, old.host_id), coalesce(old.host_id, new.host_id));
  return null;
end $$;
update public.hosts h set total_owed = coalesce((
  select sum(greatest(b.balance_due, 0)) from public.bookings b where b.host_id = h.id and b.status::text <> 'cancelled'), 0);

-- Note: an automatic retention/consent clean-up was drafted and rolled back the same day at the owner's request;
-- traveler data and birthday occasions are unchanged.
