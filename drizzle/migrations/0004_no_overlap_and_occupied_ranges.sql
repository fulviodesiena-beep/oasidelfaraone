CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;
ALTER TABLE public.bookings
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (daterange(check_in, check_out, '[)') WITH &&)
  WHERE (status NOT IN ('cancelled', 'pending'));
CREATE OR REPLACE FUNCTION public.get_occupied_ranges()
RETURNS TABLE(check_in date, check_out date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT b.check_in, b.check_out FROM public.bookings b
  WHERE b.status <> 'cancelled' AND b.check_out >= CURRENT_DATE
  ORDER BY b.check_in;
$$;
REVOKE ALL ON FUNCTION public.get_occupied_ranges() FROM public;
GRANT EXECUTE ON FUNCTION public.get_occupied_ranges() TO anon, authenticated;