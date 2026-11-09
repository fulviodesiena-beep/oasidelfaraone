# Sito pubblico multilingua

## Cosa cambia
- Tre versioni complete: italiano `/`, inglese `/en`, tedesco `/de`, comprese storia e rito, foto con testi alternativi, disponibilità, preventivo, WhatsApp, privacy e cookie.
- Selettore nell’header con bandiera corrente e menu Italiano / English / Deutsch, accessibile anche da telefono. Scelta memorizzata; alla prima apertura della home rilevamento del browser, italiano come ripiego. Un collegamento diretto a `/en` o `/de` mantiene quella lingua.
- Titoli, descrizioni, dati strutturati e indirizzi canonici per lingua; collegamenti hreflang reciproci e x-default; sitemap e sezioni EN/DE di llms.txt.
- Lingua salvata nella nuova richiesta e nel contatto associato. Nessuna riscrittura dei dati esistenti.

## Confini
Gestionale, listino, calcolo prezzi, prenotazioni e automazioni restano invariati. Gli importi continuano a comparire solo nel preventivo dopo date e ospiti.

La pagina di disiscrizione non esiste ancora: non verrà inventato un nuovo sistema di disiscrizione o invio email. Prepariamo le relative traduzioni per il futuro completamento delle automazioni.

## Dettagli tecnici
- Dizionari locali completi e condivisi, con metadati lingua, formato date/valuta e direzione del testo: predisposizione per russo e arabo RTL.
- Pagine pubbliche condivise tra indirizzi linguistici; rendering iniziale coerente con l’URL, preferenze browser applicate soltanto dopo il caricamento.
- Aggiunta minima del campo `language` alle richieste e aggiornamento della lingua del contatto associato tramite un nuovo trigger dedicato, senza modificare i trigger di ripartizione o prenotazione. Backup logico privato prima della migrazione.

## Verifica
Test per completezza delle traduzioni, scelta della lingua, hreflang/canonical e salvataggio della lingua. Esecuzione dei test esistenti e verifica del preventivo e del cambio lingua su desktop e telefono. Risultati reali e limiti riportati a fine lavoro; nessuna pubblicazione automatica.