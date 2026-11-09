INSERT INTO public.data_backups(label, table_name, row_count, rows)
SELECT 'pre-blocco-3B-email', t.name, jsonb_array_length(t.rows), t.rows FROM (
  SELECT 'bookings' AS name, coalesce((SELECT jsonb_agg(to_jsonb(b)) FROM public.bookings b), '[]'::jsonb) AS rows
  UNION ALL SELECT 'inquiries', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.inquiries x), '[]'::jsonb)
  UNION ALL SELECT 'contacts', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.contacts x), '[]'::jsonb)
  UNION ALL SELECT 'occasions', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.occasions x), '[]'::jsonb)
  UNION ALL SELECT 'settings', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.settings x), '[]'::jsonb)
) t;

ALTER TABLE public.settings
  ADD COLUMN automations jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN review_url text,
  ADD COLUMN facebook_url text,
  ADD COLUMN instagram_url text DEFAULT 'https://www.instagram.com/oasidelfaraone',
  ADD COLUMN template_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN newsletter_guide_url text,
  ADD COLUMN brevo_list_id integer;

ALTER TABLE public.contacts
  ADD COLUMN newsletter_status text NOT NULL DEFAULT 'none' CHECK (newsletter_status IN ('none','pending','confirmed')),
  ADD COLUMN newsletter_requested_at timestamptz,
  ADD COLUMN newsletter_confirmed_at timestamptz,
  ADD COLUMN newsletter_ip text,
  ADD COLUMN brevo_synced_at timestamptz;

-- Records when a booking became confirmed, so on-confirmation automations never fire for historical rows.
ALTER TABLE public.bookings ADD COLUMN confirmed_at timestamptz;
CREATE OR REPLACE FUNCTION public.set_booking_confirmed_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'confirmed') THEN
    NEW.confirmed_at := now();
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER bookings_confirmed_at BEFORE INSERT OR UPDATE OF status ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_booking_confirmed_at();

CREATE TABLE public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  contact_id uuid,
  booking_id uuid,
  inquiry_id uuid,
  automation text NOT NULL CHECK (automation IN ('A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','TEST','NL_CONFIRM')),
  step text NOT NULL DEFAULT '',
  channel text NOT NULL CHECK (channel IN ('email','whatsapp','brevo')),
  recipient text,
  subject text,
  body text,
  language text NOT NULL DEFAULT 'it',
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','error','skipped')),
  reason text,
  sent_at timestamptz,
  clicked_at timestamptz,
  provider_message_id text,
  dedup_key text UNIQUE
);
CREATE INDEX email_log_status_idx ON public.email_log(channel, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_log TO authenticated;
GRANT ALL ON public.email_log TO service_role;
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage email log" ON public.email_log FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.newsletter_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  number integer NOT NULL UNIQUE,
  subject text NOT NULL DEFAULT '',
  preheader text NOT NULL DEFAULT '',
  blocks jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','scheduled','sent')),
  approved_at timestamptz,
  scheduled_at timestamptz,
  brevo_campaign_id bigint,
  stats jsonb
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_issues TO authenticated;
GRANT ALL ON public.newsletter_issues TO service_role;
ALTER TABLE public.newsletter_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage newsletter" ON public.newsletter_issues FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));