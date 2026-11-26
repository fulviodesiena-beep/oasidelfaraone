// Listino stagionale dell'Oasi del Faraone: unico punto da modificare per cambiare tariffe e regole.
export const PRICING_CONFIG = {
  /** Euro a notte per l'intero appartamento (fino a 4 ospiti). */
  rates: { low: 80, mid: 100, high: 120, peak: 150 },
  /** Pulizia finale, pagata in reception al check-in: NON inclusa nel totale. */
  cleaningFee: 40,
  /** Soggiorno minimo consigliato (solo avviso, non blocca la richiesta). */
  minNights: 3,
  minNightsPeak: 5,
  maxGuests: 4,
  /** Transfer aeroporto ↔ Domina, prezzo per l'intera prenotazione (non per persona): aggiunto al totale. */
  transfer: { oneWay: 20, roundTrip: 40 },
} as const;
