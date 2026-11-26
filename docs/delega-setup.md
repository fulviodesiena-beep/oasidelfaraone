# Delega Domina: cosa configurare prima del merge

Il codice è pronto, ma tre cose si fanno a mano in Lovable Cloud e in Google. Finché non sono fatte, il sito funziona come prima: «Invia al Domina» mostra l'errore «Invio non configurato» e la lettura automatica dei documenti resta spenta.

## 1. SQL (obbligatorio, PRIMA del merge)
Lovable → progetto → Cloud → SQL: esegui `docs/db/2026-11-26-delega-flow.sql`. Aggiunge `documents.extracted` e `documents.traveler_id`. Nessuna policy cambia.

## 2. Gmail API da prenotazionisharm@gmail.com (per «Invia al Domina»)
1. console.cloud.google.com, con l'account prenotazionisharm@gmail.com → nuovo progetto «Oasi delega».
2. API e servizi → Libreria → abilita **Gmail API**.
3. Schermata consenso OAuth: tipo **Esterno**, aggiungi lo scope `https://www.googleapis.com/auth/gmail.send`. Poi metti lo stato di pubblicazione su **In produzione**: in «Test» il refresh token scade dopo 7 giorni. Google mostrerà l'avviso «app non verificata»: per uso interno va bene, si prosegue con «Avanzate».
4. Credenziali → Crea ID client OAuth → tipo **Applicazione web**, URI di reindirizzamento `https://developers.google.com/oauthplayground`.
5. developers.google.com/oauthplayground → ingranaggio → «Use your own OAuth credentials» (client ID e secret del punto 4) → scope `https://www.googleapis.com/auth/gmail.send` → Authorize con prenotazionisharm → «Exchange authorization code for tokens» → copia il **refresh token**.
6. Lovable → Cloud → Secrets: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`.

Le email partono da prenotazionisharm@gmail.com a `settings.domina_email` (reservation-ks@dominacoralbay.com), CC ca.espo88@gmail.com, oggetto «Delega 65135», con la delega PDF e le foto dei documenti. Ogni invio è registrato in `email_log` (automation `DELEGA`) e compare come «Delega inviata il…».

## 3. Lettura automatica dei documenti (facoltativa)
Nuova chiave su console.anthropic.com → Cloud → Secrets: `ANTHROPIC_API_KEY` (eventuale `ANTHROPIC_MODEL` per cambiare modello). Senza chiave l'ospite carica comunque le foto e l'admin inserisce i dati a mano.

## 4. Automazione A11
In Gestionale → Impostazioni → Automazioni compare «A11 · Promemoria documenti per la delega» (10 giorni prima, se mancano documenti): attivala quando i punti 1–2 sono fatti. A1 e A11 contengono il link alla pagina privata `/documenti/<token>`.
