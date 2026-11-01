import coral from "@/assets/coral.jpg.asset.json";
import boat from "@/assets/boat.jpg.asset.json";
import dunes from "@/assets/dunes.jpg.asset.json";
import pyramids from "@/assets/pyramids.jpg.asset.json";
import mountain from "@/assets/mountain.jpg.asset.json";
import sunset from "@/assets/sunset.jpg.asset.json";
import market from "@/assets/market.jpg.asset.json";
import coast from "@/assets/coast.jpg.asset.json";
export const OWNER_WHATSAPP = "393347328158";
export const MINA_WHATSAPP = "201501202025";
export const wa = (num: string, text: string) => `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
export type Extra = { id: string; name: string; price: number | null; desc: string; image: string; photo: string };
export const EXTRAS: Extra[] = [
  { id: "transfer", name: "Transfer dall’aeroporto", price: 15, desc: "Il tuo arrivo, senza pensieri. Transfer privato dall’aeroporto al Domina, da concordare con Mina.", image: coast.url, photo: "Costa · foto illustrativa" },
  { id: "rasmo", name: "Snorkeling a Ras Mohammed", price: null, desc: "Un incontro con i colori della barriera corallina. Itinerario e servizi da concordare con Mina.", image: coral.url, photo: "Fondali · foto illustrativa" },
  { id: "tiran", name: "In barca verso Tiran", price: null, desc: "Il mare aperto, una sosta per nuotare e il tempo che rallenta. Uscita soggetta alle condizioni locali.", image: boat.url, photo: "Barca · foto illustrativa" },
  { id: "safari", name: "Safari nel deserto", price: null, desc: "Esplora il deserto in quad, tra silenzio e luce del tramonto. Programma da concordare.", image: dunes.url, photo: "Deserto · foto illustrativa" },
  { id: "cairo", name: "Il Cairo e le piramidi", price: null, desc: "Una giornata nella storia dell’Egitto. Trasporto, ingressi e programma su richiesta.", image: pyramids.url, photo: "Egitto · foto illustrativa" },
  { id: "sinai", name: "Monte Sinai di notte", price: null, desc: "Un cammino sotto le stelle verso l’alba. Partenza e accompagnamento da concordare con Mina.", image: mountain.url, photo: "Montagna · foto illustrativa" },
];
export const RESTAURANTS = [
 { name: "The Beach", tag: "Ristorante · Nel Domina · Sul mare", cuisine: "Piatti di mare", desc: "Il tavolo che scegliamo per un pranzo dopo la spiaggia: piatti freschi e il Mar Rosso davanti agli occhi." },
 { name: "Concrete (ex Smaila’s)", tag: "Serale · Nel Domina", cuisine: "Live music e cocktail", desc: "Per prolungare la serata nel villaggio, tra musica dal vivo, cocktail e un’atmosfera speciale." },
 { name: "I Tre Fratelli", tag: "Napoletano · Esterno al resort", cuisine: "Pizza napoletana", desc: "Il nostro consiglio per chi ama la vera pizza napoletana e il gusto di casa." },
 { name: "La Cucina degli Artisti", tag: "Italiano · Esterno al resort", cuisine: "Napoletana creativa", desc: "Un angolo di Napoli a Sharm, per chi cerca una cucina napoletana con un tocco creativo." },
 { name: "Cava", tag: "Italiano · Nel Domina", cuisine: "Italiana e pesce", desc: "Una trattoria italiana contemporanea: un buon indirizzo per pasta e specialità di pesce." },
 { name: "Impàsto", tag: "Italiano · Delta Sharm", cuisine: "Pasta fresca", desc: "Per ritrovare il piacere della pasta fresca fatta a mano, anche lontano da casa." },
 { name: "Mahony", tag: "Pesce · Sharm el-Sheikh", cuisine: "Pesce e frutti di mare", desc: "Un indirizzo per chi ama il pesce e i frutti di mare, con alternative di carne e pollo." },
 { name: "Il Vizietto", tag: "Italiano · Esterno al resort", cuisine: "Pizza, mare e terra", desc: "Pizza e cucina italiana, con piatti di mare e di terra: una scelta familiare per la serata." },
 { name: "Arafa", tag: "Barbecue · Al Fanar", cuisine: "Griglia", desc: "Un indirizzo per una pausa alla griglia. Chiedi a Mina il menu e gli orari aggiornati." },
];
export const SPOTS = [
 { name: "Caffè Farsha", desc: "Lanterne, cuscini e una serata affacciata sul mare: un luogo da vivere con calma.", image: sunset.url, photo: "Tramonto · foto illustrativa" },
 { name: "Baia di Naama", desc: "Una passeggiata sul lungomare, tra locali e luci della sera.", image: coast.url, photo: "Costa · foto illustrativa" },
 { name: "Vecchio Mercato", desc: "Profumi di spezie, botteghe e la moschea Al Sahaba: il volto più vivace di Sharm.", image: market.url, photo: "Spezie · foto illustrativa" },
 { name: "Piazza Soho", desc: "Un incontro con la Sharm serale, tra fontane, locali e passeggiate.", image: sunset.url, photo: "Luce serale · foto illustrativa" },
 { name: "Blue Hole, Dahab", desc: "Un celebre sito sul mare. Escursioni e immersioni da organizzare con guide qualificate.", image: coral.url, photo: "Fondali · foto illustrativa" },
 { name: "Ras Mohammed", desc: "Dove il deserto incontra il mare e la barriera corallina.", image: dunes.url, photo: "Deserto · foto illustrativa" },
];
export const ROOM_AMENITIES = ["Aria condizionata", "TV satellitare", "Balcone", "Microonde", "Cassaforte", "Bollitore", "Asciugacapelli", "Accesso a piscine e spiagge"];
