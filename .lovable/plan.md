# Analisi tecnica (nessuna modifica al codice)

## 1. Flusso di prenotazione (`src/components/site/Booking.tsx`)
- L'utente sceglie arrivo/partenza (calendario o campi data, niente date passate), adulti e bambini (max 4 totali, almeno 1 adulto), extra/esperienze (aggiunti dalle card, rimovibili nel riepilogo).
- Vede un preventivo indicativo (`quote()` in `src/lib/pricing.ts`): notti x tariffa stagionale, "Su richiesta" se la tariffa manca; gli extra non entrano nel totale.
- Poi compila nome, email, telefono.
- All'invio fa una **vera INSERT** nella tabella `inquiries` (`saveInquiryWithin` in `src/lib/inquiries.ts`, permesso anonimo di sola scrittura con `status = 'new'`), aspetta al massimo 2 secondi, poi apre WhatsApp verso Fulvio. Se il salvataggio fallisce, WhatsApp si apre comunque.
- **Non** crea una riga in `bookings`: la prenotazione nasce solo quando l'admin converte la richiesta. Nessun pagamento e nessuna email automatica.

## 2. Controllo disponibilità
- **Non esiste.** Il calendario pubblico non legge nessuna tabella: ogni data futura è selezionabile. Il testo dice "Disponibilità da confermare con Fulvio".
- Non c'è nessuna query di sovrapposizione, né nel sito né nel form admin (`BookingFormDialog.tsx`, che calcola solo il prezzo).
- Un controllo corretto sarebbe: `check_in < :nuovo_check_out AND check_out > :nuovo_check_in AND status <> 'cancelled'`. Oggi non è implementato da nessuna parte.

## 3. Protezione dal doppio booking
- **Nessuna.** Il trigger `validate_booking` controlla solo: partenza dopo l'arrivo, max 4 ospiti / almeno 1 adulto, origine valida, regole per uso personale e host. Nessun UNIQUE, nessun vincolo di esclusione su intervalli, nessun lock.
- Due richieste dal sito sulle stesse date vengono salvate entrambe in `inquiries` (è voluto: sono solo richieste).
- Anche in `bookings` l'admin può salvare due prenotazioni sovrapposte senza ricevere errori.
- La soluzione robusta sarebbe un vincolo di esclusione nel database (`btree_gist` + `EXCLUDE USING gist (daterange(check_in, check_out) WITH &&) WHERE status not in ('cancelled')`), più un avviso nel form admin.

## 4. Sezioni del pannello admin
Tutte leggono e scrivono dati reali nel database, protetti dalle regole di accesso admin. Nessuna usa dati finti.
- **Prenotazioni:** reale (elenco, filtri, creazione, dettaglio con stato, note, caparra, fase).
- **Clienti:** reale; il record del cliente viene creato o aggiornato da un trigger quando una prenotazione diventa confermata.
- **Richieste, Host, Documenti (archivio privato con link temporanei), Dashboard:** reali.
- **Pipeline:** non è una pagina a parte. È un campo `pipeline_stage` (da lead a cliente fedele) che si modifica nel dettaglio della prenotazione. Non c'è una vista kanban.
- **Preventivi:** non esiste una sezione. Esiste solo il calcolo del prezzo nel form prenotazione e la fase "Preventivo inviato". Non si salvano né si inviano preventivi.
- **Comunicazioni:** è una scheda dentro la prenotazione. Mostra i 4 messaggi con le date di invio calcolate, l'anteprima compilata con i dati reali e il pulsante "Invia su WhatsApp" (invio manuale). **L'invio automatico delle email non è attivo**, perché Resend non è collegato.

## 5. Autenticazione admin
- `/admin` funziona solo nel browser (`ssr: false`). Prima di caricare la pagina verifica l'utente con `supabase.auth.getUser()`.
- Utente non autenticato: viene rimandato a `/admin/login`.
- Utente autenticato senza ruolo admin in `user_roles`: viene disconnesso e rimandato al login.
- La registrazione pubblica è disattivata. Il ruolo admin viene assegnato in automatico solo a prenotazionisharm@gmail.com.
- Anche chiamando direttamente il database, le regole di accesso (`has_role admin`) bloccano la lettura di prenotazioni, clienti, host, documenti e richieste.
- Unico limite: il pannello autenticato non è ancora stato provato dal vivo, perché l'account del proprietario va ancora creato.

## Possibili interventi successivi (solo se approvati)
1. Vincolo nel database contro le prenotazioni sovrapposte, più un avviso chiaro nel form admin.
2. Giorni occupati non selezionabili nel calendario pubblico, tramite una funzione pubblica che restituisce solo gli intervalli occupati, senza dati personali.
3. Pagina Pipeline (kanban) e sezione Preventivi, se servono.
