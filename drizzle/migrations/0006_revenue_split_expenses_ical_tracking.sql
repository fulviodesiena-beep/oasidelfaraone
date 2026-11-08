-- Settings (singleton row)
CREATE TABLE public.settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  fds_share_pct numeric NOT NULL DEFAULT 20 CHECK (fds_share_pct >= 0 AND fds_share_pct <= 100),
  ical_token text NOT NULL DEFAULT (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  booking_ical_url text,
  last_sync_attempt_at timestamptz,
  last_sync_success_at timestamptz,
  last_sync_error text,
  meta_pixel_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage settings" ON public.settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Bookings: channel, commission, FDS snapshot and computed split
ALTER TABLE public.bookings
  ADD COLUMN channel text NOT NULL DEFAULT 'diretto' CHECK (channel IN ('diretto', 'booking', 'airbnb', 'altro')),
  ADD COLUMN channel_commission numeric NOT NULL DEFAULT 0 CHECK (channel_commission >= 0),
  ADD COLUMN fds_share_pct numeric CHECK (fds_share_pct >= 0 AND fds_share_pct <= 100);
ALTER TABLE public.bookings
  ADD COLUMN net_accommodation numeric GENERATED ALWAYS AS (CASE WHEN is_personal_use THEN 0 ELSE GREATEST(total_price - channel_commission, 0) END) STORED,
  ADD COLUMN fds_amount numeric GENERATED ALWAYS AS (CASE WHEN is_personal_use THEN 0 ELSE round(GREATEST(total_price - channel_commission, 0) * COALESCE(fds_share_pct, 0) / 100, 2) END) STORED,
  ADD COLUMN room_amount numeric GENERATED ALWAYS AS (CASE WHEN is_personal_use THEN 0 ELSE GREATEST(total_price - channel_commission, 0) - round(GREATEST(total_price - channel_commission, 0) * COALESCE(fds_share_pct, 0) / 100, 2) END) STORED;

CREATE OR REPLACE FUNCTION public.snapshot_fds_share()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'confirmed' AND NEW.fds_share_pct IS NULL THEN
    SELECT s.fds_share_pct INTO NEW.fds_share_pct FROM public.settings s WHERE s.id = 1;
    NEW.fds_share_pct := COALESCE(NEW.fds_share_pct, 20);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER bookings_fds_snapshot BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_fds_share();
UPDATE public.bookings SET fds_share_pct = 20 WHERE status = 'confirmed' AND fds_share_pct IS NULL;

-- Expenses
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL CHECK (category IN ('condominio', 'luce', 'acqua', 'manutenzione', 'biancheria', 'commissioni_pagamento', 'altro')),
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD')),
  amount_eur numeric CHECK (amount_eur >= 0),
  note text,
  period_month text CHECK (period_month ~ '^\d{4}-\d{2}$')
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage expenses" ON public.expenses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.expenses (date, category, amount, currency, amount_eur, note, period_month)
VALUES ('2026-01-01', 'condominio', 1700, 'USD', NULL, 'Condominio annuale 2026', '2026-01');

-- Availability blocks (manual + Booking.com import). end_date is exclusive, like check_out.
CREATE TABLE public.availability_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'blocked' CHECK (status IN ('blocked', 'maintenance', 'booking')),
  reason text,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'booking')),
  external_uid text,
  CHECK (end_date > start_date),
  UNIQUE (source, external_uid)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability_blocks TO authenticated;
GRANT ALL ON public.availability_blocks TO service_role;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage blocks" ON public.availability_blocks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public occupied ranges now include blocks (no personal data)
CREATE OR REPLACE FUNCTION public.get_occupied_ranges()
RETURNS TABLE(check_in date, check_out date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.check_in, r.check_out FROM (
    SELECT b.check_in, b.check_out FROM public.bookings b WHERE b.status <> 'cancelled'
    UNION ALL
    SELECT a.start_date, a.end_date FROM public.availability_blocks a
  ) r WHERE r.check_out >= CURRENT_DATE ORDER BY r.check_in;
$$;
REVOKE ALL ON FUNCTION public.get_occupied_ranges() FROM public;
GRANT EXECUTE ON FUNCTION public.get_occupied_ranges() TO anon, authenticated;

-- iCal export: ranges only when the secret token matches. Booking.com imports are not echoed back.
CREATE OR REPLACE FUNCTION public.ical_export_ranges(_token text)
RETURNS TABLE(uid text, start_date date, end_date date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT x.uid, x.start_date, x.end_date FROM (
    SELECT 'b-' || b.id::text AS uid, b.check_in AS start_date, b.check_out AS end_date FROM public.bookings b
      WHERE b.status <> 'cancelled'
    UNION ALL
    SELECT 'k-' || a.id::text, a.start_date, a.end_date FROM public.availability_blocks a WHERE a.source <> 'booking'
  ) x
  WHERE length(coalesce(_token, '')) >= 32
    AND EXISTS (SELECT 1 FROM public.settings s WHERE s.id = 1 AND s.ical_token = _token)
    AND x.end_date >= CURRENT_DATE - 30
  ORDER BY x.start_date;
$$;
REVOKE ALL ON FUNCTION public.ical_export_ranges(text) FROM public;
GRANT EXECUTE ON FUNCTION public.ical_export_ranges(text) TO anon, authenticated;

-- Public, non-secret settings (Meta Pixel ID only)
CREATE OR REPLACE FUNCTION public.get_public_settings()
RETURNS TABLE(meta_pixel_id text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT nullif(trim(s.meta_pixel_id), '') FROM public.settings s WHERE s.id = 1;
$$;
REVOKE ALL ON FUNCTION public.get_public_settings() FROM public;
GRANT EXECUTE ON FUNCTION public.get_public_settings() TO anon, authenticated;

-- Inquiries: tracking, follow-up and consent
ALTER TABLE public.inquiries
  ADD COLUMN utm_source text CHECK (length(utm_source) <= 200),
  ADD COLUMN utm_medium text CHECK (length(utm_medium) <= 200),
  ADD COLUMN utm_campaign text CHECK (length(utm_campaign) <= 200),
  ADD COLUMN referrer text CHECK (length(referrer) <= 1000),
  ADD COLUMN landing_page text CHECK (length(landing_page) <= 1000),
  ADD COLUMN next_follow_up_at timestamptz,
  ADD COLUMN last_contact_at timestamptz,
  ADD COLUMN lost_reason text,
  ADD COLUMN consent_privacy boolean NOT NULL DEFAULT false,
  ADD COLUMN consent_marketing boolean NOT NULL DEFAULT false;
DROP POLICY "Visitors can send inquiries" ON public.inquiries;
CREATE POLICY "Visitors can send inquiries" ON public.inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND length(guest_name) BETWEEN 1 AND 200 AND COALESCE(length(message), 0) <= 4000
    AND consent_privacy = true AND next_follow_up_at IS NULL AND last_contact_at IS NULL AND lost_reason IS NULL);