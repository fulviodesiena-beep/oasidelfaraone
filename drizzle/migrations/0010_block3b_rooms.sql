INSERT INTO public.data_backups(label, table_name, row_count, rows)
SELECT 'pre-blocco-3B', t.name, jsonb_array_length(t.rows), t.rows FROM (
  SELECT 'bookings' AS name, coalesce((SELECT jsonb_agg(to_jsonb(b)) FROM public.bookings b), '[]'::jsonb) AS rows
  UNION ALL SELECT 'inquiries', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.inquiries x), '[]'::jsonb)
  UNION ALL SELECT 'contacts', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.contacts x), '[]'::jsonb)
  UNION ALL SELECT 'travelers', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.travelers x), '[]'::jsonb)
  UNION ALL SELECT 'occasions', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.occasions x), '[]'::jsonb)
  UNION ALL SELECT 'availability_blocks', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.availability_blocks x), '[]'::jsonb)
  UNION ALL SELECT 'settings', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.settings x), '[]'::jsonb)
) t;

CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  name text NOT NULL,
  zone text,
  story text, ritual text, symbol text,
  max_guests integer NOT NULL DEFAULT 4,
  size_sqm integer,
  amenities text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  unit_number text,
  holder_name text,
  holder_passport text,
  booking_ical_url text,
  ical_token text NOT NULL DEFAULT (replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-',''))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
GRANT SELECT (id, slug, name, zone, story, ritual, symbol, max_guests, size_sqm, amenities, sort_order, active) ON public.rooms TO anon;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage rooms" ON public.rooms FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public reads active rooms" ON public.rooms FOR SELECT TO anon USING (active);

INSERT INTO public.rooms (id, slug, name, zone, symbol, max_guests, size_sqm, amenities, sort_order, unit_number, holder_name, holder_passport, booking_ical_url, ical_token, story, ritual)
SELECT '0e11a5e0-0000-4000-8000-000000000001', 'elisir-d-oriente', 'Elisir d''Oriente', 'Elisir — Domina Coral Bay', 'Scarabeo', 4, 60,
  ARRAY['Aria condizionata','TV satellitare','Cassaforte','Bollitore','Microonde','Bagno con vasca e doccia','Balcone vista piscina'], 1,
  s.unit_number, s.holder_name, s.holder_passport, s.booking_ical_url, s.ical_token,
  'Si racconta che lungo le vie dei mercanti che attraversavano il Sinai, tra le spezie, l''incenso e le stoffe, viaggiasse un''ampolla che nessuno vendeva mai. Conteneva l''Elisir d''Oriente: non un profumo, ma un''abitudine. Fermarsi. Guardare il mare all''alba. Esprimere un desiderio prima che il sole fosse del tutto sorto. Chi lo faceva, dicevano, tornava sempre. Noi l''ampolla non l''abbiamo trovata. Ma abbiamo trovato il posto in cui l''abitudine ha senso: un balcone sulla piscina, a pochi passi dal Mar Rosso, nella zona del villaggio che porta il suo nome.',
  'Nell''antico Egitto lo scarabeo era il simbolo di Khepri, il sole che sorge, e della rinascita. All''arrivo troverai in camera un piccolo scarabeo, la storia della stanza su papiro e una cartolina per il tuo desiderio. Alla prima alba esci sul balcone, tieni lo scarabeo controluce, giralo tre volte ed esprimi un desiderio. Scrivilo sul papiro e lascialo nello Scrigno dell''Elisir: lo ritroverai se tornerai. Lo scarabeo è tuo. Condividi il momento con #RisveglioDelloScarabeo e @oasidelfaraone.'
FROM public.settings s WHERE s.id = 1;

ALTER TABLE public.bookings ADD COLUMN room_id uuid NOT NULL DEFAULT '0e11a5e0-0000-4000-8000-000000000001' REFERENCES public.rooms(id);
ALTER TABLE public.availability_blocks ADD COLUMN room_id uuid NOT NULL DEFAULT '0e11a5e0-0000-4000-8000-000000000001' REFERENCES public.rooms(id);
ALTER TABLE public.inquiries ADD COLUMN room_id uuid REFERENCES public.rooms(id);
UPDATE public.inquiries SET room_id = '0e11a5e0-0000-4000-8000-000000000001' WHERE room_id IS NULL;

-- Overlap rule is now per room
ALTER TABLE public.bookings DROP CONSTRAINT no_overlapping_bookings;
ALTER TABLE public.bookings ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (room_id WITH =, daterange(check_in, check_out, '[)') WITH &&)
  WHERE (status <> ALL (ARRAY['cancelled'::booking_status, 'pending'::booking_status]));

CREATE OR REPLACE FUNCTION public.release_overlapping_expired_options() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
begin
  update public.bookings set status = 'cancelled', notes = concat_ws(E'\n', notes, 'Opzione scaduta ' || to_char(now(), 'DD/MM/YYYY HH24:MI'))
   where status = 'option' and option_expires_at < now() and id <> new.id and room_id = new.room_id
     and check_in < new.check_out and check_out > new.check_in;
  return new;
end $$;

-- Public occupancy per room (null = all rooms)
CREATE OR REPLACE FUNCTION public.get_room_occupied_ranges(_room uuid) RETURNS TABLE(check_in date, check_out date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
  SELECT r.check_in, r.check_out FROM (
    SELECT b.check_in, b.check_out FROM public.bookings b
      WHERE b.room_id = _room AND b.status <> 'cancelled' AND NOT (b.status = 'option' AND b.option_expires_at < now())
    UNION ALL
    SELECT a.start_date, a.end_date FROM public.availability_blocks a WHERE a.room_id = _room
  ) r WHERE r.check_out >= CURRENT_DATE ORDER BY r.check_in;
$function$;
GRANT EXECUTE ON FUNCTION public.get_room_occupied_ranges(uuid) TO anon, authenticated;

-- Per-room export feed: token identifies the room
CREATE OR REPLACE FUNCTION public.ical_export_ranges(_token text) RETURNS TABLE(uid text, start_date date, end_date date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
  WITH room AS (
    SELECT r.id FROM public.rooms r WHERE length(coalesce(_token,'')) >= 32 AND r.ical_token = _token
    UNION
    SELECT '0e11a5e0-0000-4000-8000-000000000001'::uuid FROM public.settings s
      WHERE length(coalesce(_token,'')) >= 32 AND s.id = 1 AND s.ical_token = _token
  )
  SELECT x.uid, x.start_date, x.end_date FROM (
    SELECT 'b-' || b.id::text AS uid, b.check_in AS start_date, b.check_out AS end_date, b.room_id FROM public.bookings b
      WHERE b.status <> 'cancelled' AND NOT (b.status = 'option' AND b.option_expires_at < now())
    UNION ALL
    SELECT 'k-' || a.id::text, a.start_date, a.end_date, a.room_id FROM public.availability_blocks a WHERE a.source <> 'booking'
  ) x
  WHERE x.room_id IN (SELECT id FROM room) AND x.end_date >= CURRENT_DATE - 30
  ORDER BY x.start_date;
$function$;