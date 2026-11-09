-- Bookings: options, Booking.com closure, payment, delega fields
ALTER TABLE public.bookings
  ADD COLUMN option_expires_at timestamptz,
  ADD COLUMN ota_closed_at timestamptz,
  ADD COLUMN payment_verified_at timestamptz,
  ADD COLUMN contact_id uuid,
  ADD COLUMN arrival_time text,
  ADD COLUMN departure_time text,
  ADD COLUMN delegate_email text,
  ADD COLUMN delegate_phone text,
  ADD COLUMN initial_cleaning boolean NOT NULL DEFAULT false,
  ADD COLUMN final_cleaning boolean NOT NULL DEFAULT true;

ALTER TABLE public.settings
  ADD COLUMN holder_name text NOT NULL DEFAULT 'CARMINE ESPOSITO',
  ADD COLUMN holder_passport text NOT NULL DEFAULT 'YD1421286',
  ADD COLUMN unit_number text NOT NULL DEFAULT '65135',
  ADD COLUMN holder_phone text NOT NULL DEFAULT '+39 334 732 8158',
  ADD COLUMN domina_email text NOT NULL DEFAULT 'reservation-ks@dominacoralbay.com';

ALTER TABLE public.documents ADD COLUMN kind text, ADD COLUMN fingerprint text;
ALTER TABLE public.expenses ADD COLUMN fx_rate numeric, ADD COLUMN fx_date date;
ALTER TABLE public.inquiries
  ADD COLUMN special_dates text,
  ADD COLUMN consent_occasions boolean NOT NULL DEFAULT false,
  ADD COLUMN contact_id uuid;
ALTER TABLE public.guests ADD COLUMN contact_id uuid;

CREATE OR REPLACE FUNCTION public.validate_booking() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $function$ begin
  if new.check_out <= new.check_in then raise exception 'La partenza deve essere dopo l''arrivo'; end if;
  if new.adults + new.children > 4 or new.adults < 1 then raise exception 'Massimo 4 ospiti, almeno 1 adulto'; end if;
  if new.source not in ('whatsapp','direct','manual','personal','host') then raise exception 'Origine non valida'; end if;
  if new.is_personal_use then
    new.status := 'personal'; new.source := 'personal';
    new.price_per_night := 0; new.total_price := 0; new.deposit_paid := 0;
  end if;
  if new.source = 'host' and new.host_id is null then raise exception 'Seleziona l''host della collaborazione'; end if;
  if new.source <> 'host' then new.host_id := null; new.host_amount := 0; end if;
  if new.status = 'option' and new.option_expires_at is null then raise exception 'Indica la scadenza dell''opzione'; end if;
  new.total_nights := new.check_out - new.check_in;
  return new;
end $function$;

-- Phone normalisation to E.164 (mirrors src/lib/contacts.ts)
CREATE OR REPLACE FUNCTION public.normalize_phone(_p text) RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public' AS $$
declare d text; plus boolean;
begin
  if _p is null then return null; end if;
  plus := btrim(_p) like '+%';
  d := regexp_replace(_p, '\D', '', 'g');
  if length(d) < 6 then return null; end if;
  if plus then return '+' || d; end if;
  if d like '00%' then return '+' || substr(d, 3); end if;
  if length(d) = 10 and d like '3%' then return '+39' || d; end if;
  return '+' || d;
end $$;

CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  first_name text, last_name text, email text, phone text,
  nationality text, city text, language text,
  source text NOT NULL DEFAULT 'sito' CHECK (source IN ('sito','whatsapp','booking','host','newsletter','import')),
  status text NOT NULL DEFAULT 'lead' CHECK (status IN ('lead','cliente','ex_cliente','iscritto')),
  tags text[] NOT NULL DEFAULT '{}',
  consent_marketing boolean NOT NULL DEFAULT false,
  consent_marketing_at timestamptz, consent_marketing_source text,
  consent_occasions boolean NOT NULL DEFAULT false,
  consent_occasions_at timestamptz,
  unsubscribed_at timestamptz,
  notes text
);
CREATE INDEX contacts_email_idx ON public.contacts (lower(email));
CREATE INDEX contacts_phone_idx ON public.contacts (phone);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage contacts" ON public.contacts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.travelers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  first_name text NOT NULL, last_name text NOT NULL,
  birth_date date,
  document_type text NOT NULL DEFAULT 'passaporto',
  document_number text,
  nationality text,
  position integer NOT NULL DEFAULT 0
);
CREATE INDEX travelers_booking_idx ON public.travelers (booking_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.travelers TO authenticated;
GRANT ALL ON public.travelers TO service_role;
ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage travelers" ON public.travelers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.occasions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  traveler_id uuid REFERENCES public.travelers(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('compleanno','anniversario','altro')),
  day integer NOT NULL CHECK (day BETWEEN 1 AND 31),
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer,
  source text NOT NULL DEFAULT 'dichiarata' CHECK (source IN ('documento','dichiarata')),
  note text
);
CREATE UNIQUE INDEX occasions_traveler_birthday ON public.occasions (traveler_id) WHERE kind = 'compleanno' AND traveler_id IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.occasions TO authenticated;
GRANT ALL ON public.occasions TO service_role;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage occasions" ON public.occasions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Dedup by email or E.164 phone; never downgrades a client, never revokes consent.
CREATE OR REPLACE FUNCTION public.upsert_contact(_name text, _email text, _phone text, _source text, _status text,
  _marketing boolean DEFAULT false, _occasions boolean DEFAULT false) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
declare cid uuid; em text := nullif(lower(btrim(coalesce(_email,''))), ''); ph text := public.normalize_phone(_phone);
  fn text := split_part(btrim(coalesce(_name,'')), ' ', 1);
  ln text := nullif(btrim(substr(btrim(coalesce(_name,'')), length(split_part(btrim(coalesce(_name,'')), ' ', 1)) + 1)), '');
begin
  if em is null and ph is null then return null; end if;
  select id into cid from public.contacts
    where (em is not null and lower(email) = em) or (ph is not null and phone = ph)
    order by created_at limit 1;
  if cid is null then
    insert into public.contacts(first_name, last_name, email, phone, source, status,
      consent_marketing, consent_marketing_at, consent_marketing_source, consent_occasions, consent_occasions_at)
    values (nullif(fn,''), ln, em, ph, _source, _status,
      coalesce(_marketing,false), case when _marketing then now() end, case when _marketing then _source end,
      coalesce(_occasions,false), case when _occasions then now() end)
    returning id into cid;
  else
    update public.contacts set
      email = coalesce(email, em), phone = coalesce(phone, ph),
      first_name = coalesce(first_name, nullif(fn,'')), last_name = coalesce(last_name, ln),
      status = case when _status = 'cliente' then 'cliente' else status end,
      consent_marketing = consent_marketing or coalesce(_marketing,false),
      consent_marketing_at = case when _marketing and not consent_marketing then now() else consent_marketing_at end,
      consent_marketing_source = case when _marketing and not consent_marketing then _source else consent_marketing_source end,
      consent_occasions = consent_occasions or coalesce(_occasions,false),
      consent_occasions_at = case when _occasions and not consent_occasions then now() else consent_occasions_at end,
      updated_at = now()
    where id = cid;
  end if;
  return cid;
end $$;
REVOKE EXECUTE ON FUNCTION public.upsert_contact(text,text,text,text,text,boolean,boolean) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.link_inquiry_contact() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
begin
  new.contact_id := public.upsert_contact(new.guest_name, new.guest_email, new.guest_phone, 'sito', 'lead', new.consent_marketing, new.consent_occasions);
  return new;
end $$;
CREATE TRIGGER inquiries_link_contact BEFORE INSERT ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.link_inquiry_contact();

CREATE OR REPLACE FUNCTION public.link_booking_contact() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
begin
  if new.is_personal_use then return new; end if;
  if new.contact_id is null or new.status = 'confirmed' then
    new.contact_id := coalesce(public.upsert_contact(new.guest_name, new.guest_email, new.guest_phone,
      case when new.channel = 'booking' then 'booking' when new.source = 'host' then 'host' else 'whatsapp' end,
      case when new.status in ('confirmed','host_collab') then 'cliente' else 'lead' end), new.contact_id);
  end if;
  return new;
end $$;
CREATE TRIGGER bookings_link_contact BEFORE INSERT OR UPDATE OF guest_email, guest_phone, status ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.link_booking_contact();

CREATE OR REPLACE FUNCTION public.link_guest_contact() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
begin
  if new.contact_id is null then new.contact_id := public.upsert_contact(new.name, new.email, new.phone, 'whatsapp', 'cliente'); end if;
  return new;
end $$;
CREATE TRIGGER guests_link_contact BEFORE INSERT OR UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.link_guest_contact();

-- Birthdays generated from travelers' birth dates
CREATE OR REPLACE FUNCTION public.traveler_birthday() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
declare cid uuid;
begin
  if new.birth_date is null then delete from public.occasions where traveler_id = new.id and kind = 'compleanno'; return new; end if;
  cid := coalesce(new.contact_id, (select contact_id from public.bookings where id = new.booking_id));
  insert into public.occasions(contact_id, traveler_id, kind, day, month, year, source, note)
  values (cid, new.id, 'compleanno', extract(day from new.birth_date)::int, extract(month from new.birth_date)::int,
          extract(year from new.birth_date)::int, 'documento', new.first_name || ' ' || new.last_name)
  on conflict (traveler_id) where kind = 'compleanno' and traveler_id is not null
  do update set day = excluded.day, month = excluded.month, year = excluded.year, contact_id = excluded.contact_id, note = excluded.note;
  return new;
end $$;
CREATE TRIGGER travelers_birthday AFTER INSERT OR UPDATE OF birth_date, first_name, last_name, contact_id ON public.travelers FOR EACH ROW EXECUTE FUNCTION public.traveler_birthday();

-- Public occupancy and export ignore expired options
CREATE OR REPLACE FUNCTION public.get_occupied_ranges() RETURNS TABLE(check_in date, check_out date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
  SELECT r.check_in, r.check_out FROM (
    SELECT b.check_in, b.check_out FROM public.bookings b
      WHERE b.status <> 'cancelled' AND NOT (b.status = 'option' AND b.option_expires_at < now())
    UNION ALL
    SELECT a.start_date, a.end_date FROM public.availability_blocks a
  ) r WHERE r.check_out >= CURRENT_DATE ORDER BY r.check_in;
$function$;

CREATE OR REPLACE FUNCTION public.ical_export_ranges(_token text) RETURNS TABLE(uid text, start_date date, end_date date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
  SELECT x.uid, x.start_date, x.end_date FROM (
    SELECT 'b-' || b.id::text AS uid, b.check_in AS start_date, b.check_out AS end_date FROM public.bookings b
      WHERE b.status <> 'cancelled' AND NOT (b.status = 'option' AND b.option_expires_at < now())
    UNION ALL
    SELECT 'k-' || a.id::text, a.start_date, a.end_date FROM public.availability_blocks a WHERE a.source <> 'booking'
  ) x
  WHERE length(coalesce(_token, '')) >= 32
    AND EXISTS (SELECT 1 FROM public.settings s WHERE s.id = 1 AND s.ical_token = _token)
    AND x.end_date >= CURRENT_DATE - 30
  ORDER BY x.start_date;
$function$;

-- Releases expired options (called every minute by pg_cron)
CREATE OR REPLACE FUNCTION public.release_expired_options() RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  WITH u AS (UPDATE public.bookings SET status = 'cancelled', notes = concat_ws(E'\n', notes, 'Opzione scaduta ' || to_char(now(), 'DD/MM/YYYY HH24:MI'))
    WHERE status = 'option' AND option_expires_at < now() RETURNING 1) SELECT count(*)::int FROM u;
$$;
REVOKE EXECUTE ON FUNCTION public.release_expired_options() FROM PUBLIC, anon, authenticated;

-- Visitors' insert policy: also bound the new optional fields
DROP POLICY "Visitors can send inquiries" ON public.inquiries;
CREATE POLICY "Visitors can send inquiries" ON public.inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND length(guest_name) BETWEEN 1 AND 200 AND COALESCE(length(message), 0) <= 4000
    AND COALESCE(length(special_dates), 0) <= 500 AND consent_privacy = true
    AND next_follow_up_at IS NULL AND last_contact_at IS NULL AND lost_reason IS NULL);

-- Backfill contacts for existing rows (adds links only)
UPDATE public.guests SET contact_id = public.upsert_contact(name, email, phone, 'import', 'cliente') WHERE contact_id IS NULL;
UPDATE public.inquiries SET contact_id = public.upsert_contact(guest_name, guest_email, guest_phone, 'sito', 'lead', consent_marketing, false) WHERE contact_id IS NULL;
UPDATE public.bookings SET contact_id = public.upsert_contact(guest_name, guest_email, guest_phone, 'import',
  case when status in ('confirmed','host_collab') then 'cliente' else 'lead' end) WHERE contact_id IS NULL AND NOT is_personal_use;

-- Templates bucket policies (bucket created separately)
CREATE POLICY "Admins manage templates" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'templates' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'templates' AND public.has_role(auth.uid(), 'admin'));