CREATE OR REPLACE FUNCTION public.release_overlapping_expired_options() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
begin
  update public.bookings set status = 'cancelled', notes = concat_ws(E'\n', notes, 'Opzione scaduta ' || to_char(now(), 'DD/MM/YYYY HH24:MI'))
   where status = 'option' and option_expires_at < now() and id <> new.id
     and check_in < new.check_out and check_out > new.check_in;
  return new;
end $$;
CREATE TRIGGER bookings_release_expired_options BEFORE INSERT OR UPDATE OF check_in, check_out, status ON public.bookings
  FOR EACH ROW WHEN (pg_trigger_depth() = 0) EXECUTE FUNCTION public.release_overlapping_expired_options();
GRANT EXECUTE ON FUNCTION public.release_expired_options() TO service_role;