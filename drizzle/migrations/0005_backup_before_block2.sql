CREATE TABLE public.data_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  label text NOT NULL,
  table_name text NOT NULL,
  row_count integer NOT NULL,
  rows jsonb NOT NULL
);
GRANT SELECT ON public.data_backups TO authenticated;
GRANT ALL ON public.data_backups TO service_role;
ALTER TABLE public.data_backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read backups" ON public.data_backups FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.data_backups (label, table_name, row_count, rows)
SELECT 'pre-blocco-2', 'bookings', count(*), coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM public.bookings t
UNION ALL SELECT 'pre-blocco-2', 'inquiries', count(*), coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM public.inquiries t
UNION ALL SELECT 'pre-blocco-2', 'guests', count(*), coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM public.guests t
UNION ALL SELECT 'pre-blocco-2', 'hosts', count(*), coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM public.hosts t
UNION ALL SELECT 'pre-blocco-2', 'documents', count(*), coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM public.documents t;