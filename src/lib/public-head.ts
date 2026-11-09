import { type ReactNode } from "react";
import { HERO_PHOTOS, ROOM_AMENITIES, ROOMS } from "./site-data";
import { translate, LOCALES, languages, publicPath, type Language } from "./i18n";
const TITLE = "Oasi del Faraone · Appartamenti al Domina Coral Bay, Sharm el-Sheikh";
const DESCRIPTION = "Appartamento privato fino a 4 ospiti al Domina Coral Bay, Sharm el-Sheikh. Balcone vista piscina, spiagge e piscine del resort incluse. Preventivo in 2 minuti.";
const SITE_URL = "https://oasidelfaraone.it";
const OG_IMAGE = `${SITE_URL}${HERO_PHOTOS[0]?.src ?? ""}`;
const FAQS: [string, ReactNode, string][] = [
  ["Cosa è incluso nel soggiorno?", "Spiagge, piscine, padel, beach volley e animazione del resort Domina Coral Bay sono inclusi, senza costi aggiuntivi. Ristoranti e bar sono à la carte; spa e casinò sono a pagamento.", ""],
  ["C’è il Wi‑Fi?", "In camera il Wi‑Fi non è disponibile. Consigliamo una eSIM o una SIM locale: ti diamo noi le indicazioni prima della partenza.", ""],
  ["Quante persone può ospitare l’appartamento?", "Fino a 4 ospiti. Il prezzo è per appartamento, non per persona.", ""],
  ["Le pulizie sono incluse?", "La pulizia finale non è inclusa: si paga in reception al check-in, alla consegna delle chiavi, e l’importo è indicato nel preventivo. Pulizie extra si richiedono in reception, a pagamento.", ""],
  ["Quali sono gli orari di check-in e check-out?", "Check-in dalle 15:00, check-out entro le 11:00.", ""],
  ["Serve il visto per l’Egitto?", "Verifica sempre i requisiti aggiornati sul sito ufficiale viaggiaresicuri.it della Farnesina prima di partire.", ""],
  ["Come si arriva dall’aeroporto di Sharm?", "Il transfer dall’aeroporto è organizzato dal nostro referente sul posto, Mina (+39 348 180 4764).", ""],
  ["Come prenoto?", "Scegli le date sul sito e invia la richiesta: Fulvio ti risponde di persona e conferma la prenotazione via WhatsApp o email.", ""],
];
const JSONLD = [
  { "@context": "https://schema.org", "@type": ["VacationRental", "LodgingBusiness"],
    name: "Oasi del Faraone", description: DESCRIPTION, url: SITE_URL, image: OG_IMAGE,
    address: { "@type": "PostalAddress", streetAddress: "Domina Coral Bay", addressLocality: "Sharm el-Sheikh", addressRegion: "South Sinai", addressCountry: "EG" },
    geo: { "@type": "GeoCoordinates", latitude: 27.95, longitude: 34.38 },
    numberOfRooms: 1, occupancy: { "@type": "QuantitativeValue", maxValue: 4 },
    floorSize: { "@type": "QuantitativeValue", value: 60, unitCode: "MTK" },
    amenityFeature: [["Aria condizionata", true], ["TV satellitare", true], ["Cassaforte", true], ["Bollitore", true], ["Microonde", true], ["Vasca e doccia", true], ["Balcone vista piscina", true], ["Wi-Fi in camera", false]].map(([name, value]) => ({ "@type": "LocationFeatureSpecification", name, value })),
    checkinTime: "15:00", checkoutTime: "11:00", telephone: "+393347328158", email: "prenotazionisharm@gmail.com" },
  { "@context": "https://schema.org", "@type": ["Accommodation", "HotelRoom"], "@id": `${SITE_URL}/#elisir-d-oriente`,
    name: ROOMS[0]?.name, description: ROOMS[0]?.summary, url: `${SITE_URL}/#elisir-d-oriente`, image: OG_IMAGE,
    containedInPlace: { "@type": "Resort", name: "Domina Coral Bay", address: { "@type": "PostalAddress", addressLocality: "Sharm el-Sheikh", addressRegion: "South Sinai", addressCountry: "EG" } },
    brand: { "@type": "Brand", name: "Oasi del Faraone" },
    occupancy: { "@type": "QuantitativeValue", maxValue: ROOMS[0]?.maxGuests },
    floorSize: { "@type": "QuantitativeValue", value: ROOMS[0]?.sizeSqm, unitCode: "MTK" },
    amenityFeature: [...ROOM_AMENITIES.map(name => [name, true] as const), ["Wi-Fi in camera", false] as const].map(([name, value]) => ({ "@type": "LocationFeatureSpecification", name, value })) },
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map(([q, a, t]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: t || a } })) },
  { "@context": "https://schema.org", "@type": "Organization", name: "Oasi del Faraone", url: SITE_URL, email: "prenotazionisharm@gmail.com", telephone: "+393347328158", sameAs: ["https://www.instagram.com/oasidelfaraone/"] },
];

function localize(value: unknown, language: Language): unknown {
 if (typeof value === "string") { if (value === SITE_URL || value === SITE_URL+"/") return SITE_URL+publicPath(language); if (value.startsWith(SITE_URL+"/#")) return SITE_URL+publicPath(language)+value.slice(SITE_URL.length+1); return translate(language,value); }
 if (Array.isArray(value)) return value.map(v=>localize(v,language));
 if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,localize(v,language)])); return value;
}
export function localizedFaqs(language: Language): [string, string][] { return FAQS.map(([q,a,t]) => [translate(language,q),translate(language,t || String(a))]); }
export function alternateLinks(language: Language, page: "home" | "privacy" = "home") { return [{rel:"canonical",href:SITE_URL+publicPath(language,page)},...languages.map(code=>({rel:"alternate",hrefLang:code,href:SITE_URL+publicPath(code,page)})),{rel:"alternate",hrefLang:"x-default",href:SITE_URL+publicPath("it",page)}]; }
export function publicHead(language: Language, page: "home" | "privacy" = "home") {
 const privacy=page==="privacy"; const title=translate(language,privacy?"Informativa privacy e cookie | Oasi del Faraone":TITLE); const description=translate(language,privacy?"Come Oasi del Faraone tratta i dati delle richieste di soggiorno e i cookie di misurazione.":DESCRIPTION);
 return {meta:[{title},{name:"description",content:description},{property:"og:title",content:title},{property:"og:description",content:description},{property:"og:type",content:privacy?"article":"website"},{property:"og:locale",content:LOCALES[language].og},{property:"og:site_name",content:"Oasi del Faraone"},{property:"og:url",content:SITE_URL+publicPath(language,page)},{name:"twitter:card",content:privacy?"summary":"summary_large_image"},{name:"twitter:title",content:title},{name:"twitter:description",content:description},...(!privacy?[{property:"og:image",content:OG_IMAGE},{name:"twitter:image",content:OG_IMAGE}]:[])],links:alternateLinks(language,page),scripts:privacy?[]:JSONLD.map(j=>({type:"application/ld+json",children:JSON.stringify({...localize(j,language) as object,inLanguage:LOCALES[language].format})}))};
}
