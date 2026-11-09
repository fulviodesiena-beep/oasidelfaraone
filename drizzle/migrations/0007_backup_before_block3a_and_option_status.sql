INSERT INTO public.data_backups(label, table_name, row_count, rows)
SELECT 'pre-blocco-3A', t.name, jsonb_array_length(t.rows), t.rows FROM (
  SELECT 'bookings' AS name, coalesce((SELECT jsonb_agg(to_jsonb(b)) FROM public.bookings b), '[]'::jsonb) AS rows
  UNION ALL SELECT 'inquiries', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.inquiries x), '[]'::jsonb)
  UNION ALL SELECT 'guests', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.guests x), '[]'::jsonb)
  UNION ALL SELECT 'hosts', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.hosts x), '[]'::jsonb)
  UNION ALL SELECT 'documents', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.documents x), '[]'::jsonb)
  UNION ALL SELECT 'expenses', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.expenses x), '[]'::jsonb)
  UNION ALL SELECT 'settings', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.settings x), '[]'::jsonb)
  UNION ALL SELECT 'availability_blocks', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM public.availability_blocks x), '[]'::jsonb)
) t;
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'option';