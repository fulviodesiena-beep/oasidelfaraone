-- Flusso delega Domina (consegne cap. 2, punti A–E) — da applicare in Lovable Cloud → SQL PRIMA del merge della PR.
-- 1) Documenti caricati dall'ospite (documents.kind = 'guest_id', uploaded_by = 'guest'):
--    `extracted` contiene i dati letti dall'IA (nome, cognome, numero, tipo, nascita, nazionalità), solo come proposta;
--    `traveler_id` collega la foto al viaggiatore confermato dall'admin.
alter table public.documents add column if not exists extracted jsonb;
alter table public.documents add column if not exists traveler_id uuid references public.travelers(id) on delete set null;
create index if not exists documents_booking_kind_idx on public.documents (booking_id, kind);

-- 2) Niente nuove policy: la pagina ospite /documenti/<token> lavora solo lato server con la service role,
--    dopo aver verificato il token HMAC a scadenza. RLS e permessi restano invariati (admin via has_role).

-- 3) Segreti da aggiungere in Cloud → Secrets (nessuno nel codice):
--    GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN  (OAuth Google, scope gmail.send, account prenotazionisharm@gmail.com)
--    ANTHROPIC_API_KEY  (lettura automatica dei documenti; facoltativo, senza chiave i dati si inseriscono a mano)
