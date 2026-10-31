# Redesign Oasi del Faraone

## Risultato
- Nuovo sito interamente in italiano, navy e oro, con Cormorant Garamond e Inter.
- Apertura cinematografica con fotografie ufficiali del resort se disponibili; nessuna foto inventata. Spazi chiaramente etichettati per appartamento e ritratto di Mina.
- Scorrimento con comparsa graduale delle sezioni, lieve movimento su desktop, shimmer dorato e menu che scompare scendendo e riappare risalendo. Su telefono niente parallax; animazioni rispettose delle preferenze di movimento ridotto.
- Riscrittura di appartamento, servizi del villaggio, Mina, ristoranti, informazioni e investimento. MOOVY subito dopo i servizi con QR segnaposto non scansionabile.
- Escursioni con icone, prezzi su richiesta e transfer a €15 per persona.
- Prenotazione per 1–4 ospiti, preventivo trasparente e richiesta via WhatsApp; nessun pagamento o conferma fittizi.

## Assunzioni sulle tariffe
- Mostrare gli intervalli richiesti; per il preventivo usare il punto medio: Bassa €75, Media €95, Alta €130, Picco €170.
- Gennaio dopo il 6, febbraio e dicembre prima del 20 non hanno una tariffa indicata: mostrarli su richiesta, senza inventare un prezzo.
- Per Pasqua applicare Picco a domenica di Pasqua e lunedì di Pasquetta, con data calcolata ogni anno; eventuale periodo più lungo richiede le tue date.
- Il totale dell'appartamento non cambia con gli ospiti. Transfer aggiunto separatamente a €15 × ospiti; altre escursioni non entrano nel totale e restano su richiesta.
- Il richiamo storico del nome Mina sarà formulato prudentemente: Mina/Menes e l'unificazione dell'Egitto, senza attribuire al faraone un legame storico specifico con Sharm non verificato.

## Dettagli tecnici
- Conservare TanStack e i controlli del sito, aggiornando i colori centralizzati e separando dati, tariffe, prenotazione e sezioni visuali.
- Rimuovere l'occupazione dimostrativa del calendario: disponibilità sempre da confermare con Fulvio.
- Testare tariffe, Pasqua, massimo ospiti e transfer; verificare il percorso WhatsApp e le dimensioni desktop e iPhone 375px.
- Nessun nuovo servizio Cloud: le richieste continuano ad aprire WhatsApp, senza salvare documenti o contatti.