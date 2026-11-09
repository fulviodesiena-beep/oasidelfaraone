ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS language text;
COMMENT ON COLUMN public.inquiries.language IS 'Guest-selected public site language; existing inquiries remain unchanged.';
CREATE OR REPLACE FUNCTION public.persist_inquiry_language() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.language IS NOT NULL AND NEW.language !~ '^[a-z]{2}(-[A-Z]{2})?$' THEN
    RAISE EXCEPTION 'Invalid language';
  END IF;
  IF NEW.contact_id IS NOT NULL AND NEW.language IS NOT NULL THEN
    UPDATE public.contacts SET language = NEW.language WHERE id = NEW.contact_id;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.persist_inquiry_language() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER inquiries_persist_language AFTER INSERT ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.persist_inquiry_language();