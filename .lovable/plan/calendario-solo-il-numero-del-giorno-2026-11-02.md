# Calendario: solo il numero del giorno

## Codice attuale della cella (src/components/site/Booking.tsx, riga 35)

```text
return <Button key={key} variant="ghost" disabled={key < dateKey(today)}
  aria-label={d.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
  aria-pressed={selected} onClick={() => pick(d)}
  className={`calendar-day ...`}>{d.getDate()}</Button>;
```

Dentro il pulsante c'è solo `{d.getDate()}`: niente span, niente prezzo, niente testo dopo il numero. Nessun altro file del sito disegna un calendario. Il sito di prova mostra solo i numeri, confermato dallo screenshot e da un controllo automatico su 12 mesi.

## Perché vedi ancora €95

Molto probabilmente stai guardando una copia vecchia del sito, non questa versione. Per esempio:
- un sito pubblicato in precedenza, che non si aggiorna finché non pubblichi di nuovo;
- una scheda o un'app del telefono che conserva la pagina vecchia;
- un'altra copia o bozza del progetto.

## Cosa farò

1. Aggiungerò in fondo al sito una piccola scritta discreta con la data della versione (es. "v. 2 nov 2026"). Così capisci subito se stai guardando l'ultima versione.
2. Ricontrollerò il calendario su computer e telefono, scorrendo diversi mesi, per confermare che ogni giorno mostri solo il numero.
3. Ti indicherò di pubblicare il sito (pulsante Pubblica), così anche l'indirizzo pubblico mostrerà il calendario senza prezzi.
4. Il riquadro "Il tuo soggiorno" e la sezione tariffe restano come sono, salvo tua diversa indicazione.

## Dettagli tecnici

- La cella è già `{d.getDate()}` senza figli aggiuntivi. Il CSS `.calendar-day` non contiene `content:` né pseudo-elementi.
- Il test `src/test/calendar-no-prices.test.tsx` verifica che ogni cella contenga solo 1–2 cifre per 12 mesi.
- La scritta di versione sarà testo semplice nel footer, senza logica.
