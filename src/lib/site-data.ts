import coral from "@/assets/coral.jpg.asset.json";
import boat from "@/assets/boat.jpg.asset.json";
import dunes from "@/assets/dunes.jpg.asset.json";
import pyramids from "@/assets/pyramids.jpg.asset.json";
import mountain from "@/assets/mountain.jpg.asset.json";
import sunset from "@/assets/sunset.jpg.asset.json";
import camels from "@/assets/camels.jpg.asset.json";
import lanterns from "@/assets/lanterns-market.jpg.asset.json";
import dahab from "@/assets/dahab-reef.jpg.asset.json";
import restPanorama from "@/assets/rest-panorama.jpg.asset.json";
import restItalian from "@/assets/rest-italian.jpg.asset.json";
import restPizza from "@/assets/rest-pizza.jpg.asset.json";
import coast from "@/assets/coast.jpg.asset.json";
export const OWNER_WHATSAPP = "393347328158";
export const MINA_WHATSAPP = "393481804764";
export const wa = (num: string, text: string) => `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
export type Extra = { id: string; name: string; desc: string; image: string; photo: string };
export const EXTRAS: Extra[] = [
  { id: "transfer", name: "Transfer dall’aeroporto", desc: "Il tuo arrivo, senza pensieri. Transfer privato dall’aeroporto di Sharm al Domina, da concordare con Mina.", image: coast.url, photo: "Costa · foto illustrativa" },
  { id: "rasmo", name: "Snorkeling a Ras Mohammed", desc: "Un incontro con i colori della barriera corallina. Itinerario e servizi da concordare con Mina.", image: coral.url, photo: "Fondali · foto illustrativa" },
  { id: "tiran", name: "In barca verso Tiran", desc: "Il mare aperto, una sosta per nuotare e il tempo che rallenta. Uscita soggetta alle condizioni locali.", image: boat.url, photo: "Barca · foto illustrativa" },
  { id: "safari", name: "Safari nel deserto", desc: "Esplora il deserto in quad, tra silenzio e luce del tramonto. Programma da concordare.", image: camels.url, photo: "Cammelli nel deserto · foto illustrativa" },
  { id: "cairo", name: "Il Cairo e le piramidi", desc: "Una giornata nella storia dell’Egitto. Trasporto, ingressi e programma su richiesta.", image: pyramids.url, photo: "Egitto · foto illustrativa" },
  { id: "sinai", name: "Monte Sinai di notte", desc: "Un cammino sotto le stelle verso l’alba. Partenza e accompagnamento da concordare con Mina.", image: mountain.url, photo: "Montagna · foto illustrativa" },
];
export const RESTAURANTS: { name: string; tag: string; cuisine: string; desc: string; image?: string }[] = [
 { name: "The Beach", tag: "Ristorante · Nel Domina · Sul mare", cuisine: "Piatti di mare", desc: "Il tavolo che scegliamo per un pranzo dopo la spiaggia: piatti freschi e il Mar Rosso davanti agli occhi." },
 { name: "Concrete (ex Smaila’s)", tag: "Serale · Nel Domina", cuisine: "Live music e cocktail", desc: "Per prolungare la serata nel villaggio, tra musica dal vivo, cocktail e un’atmosfera speciale." },
 { name: "I Tre Fratelli", tag: "Napoletano · Esterno al resort", cuisine: "Pizza napoletana", desc: "Il nostro consiglio per chi ama la vera pizza napoletana e il gusto di casa." },
 { name: "La Cucina degli Artisti", tag: "Italiano · Esterno al resort", cuisine: "Napoletana creativa", desc: "Un angolo di Napoli a Sharm, per chi cerca una cucina napoletana con un tocco creativo." },
 { name: "Cava", tag: "Italiano · Nel Domina", cuisine: "Italiana e pesce", desc: "Una trattoria italiana contemporanea: un buon indirizzo per pasta e specialità di pesce." },
 { name: "Impàsto", tag: "Italiano · Delta Sharm", cuisine: "Pasta fresca", desc: "Per ritrovare il piacere della pasta fresca fatta a mano, anche lontano da casa." },
 { name: "Paradise Restaurant", tag: "Internazionale · Lusso", cuisine: "Internazionale", desc: "Uno dei ristoranti più eleganti di Sharm, con vista panoramica sul mare. Cucina internazionale di alto livello, ambiente sofisticato.", image: restPanorama.url },
 { name: "Allora Restaurant", tag: "Italiano · Sharm el-Sheikh", cuisine: "Italiana", desc: "Autentica cucina italiana nel cuore di Sharm el Sheikh. Pasta fatta in casa, ingredienti freschi, atmosfera calda e familiare.", image: restItalian.url },
 { name: "081 Restaurant", tag: "Napoletano · Pizza", cuisine: "Pizza napoletana", desc: "La vera pizza napoletana a Sharm el Sheikh. Forno a legna, impasto tradizionale, ingredienti importati dall’Italia.", image: restPizza.url },
 { name: "Mahony", tag: "Pesce · Sharm el-Sheikh", cuisine: "Pesce e frutti di mare", desc: "Un indirizzo per chi ama il pesce e i frutti di mare, con alternative di carne e pollo." },
 { name: "Il Vizietto", tag: "Italiano · Esterno al resort", cuisine: "Pizza, mare e terra", desc: "Pizza e cucina italiana, con piatti di mare e di terra: una scelta familiare per la serata." },
 { name: "Arafa", tag: "Barbecue · Al Fanar", cuisine: "Griglia", desc: "Un indirizzo per una pausa alla griglia. Chiedi a Mina il menu e gli orari aggiornati." },
];
export const SPOTS = [
 { name: "Caffè Farsha", desc: "Lanterne, cuscini e una serata affacciata sul mare: un luogo da vivere con calma.", image: sunset.url, photo: "Tramonto · foto illustrativa" },
 { name: "Baia di Naama", desc: "Una passeggiata sul lungomare, tra locali e luci della sera.", image: coast.url, photo: "Costa · foto illustrativa" },
 { name: "Vecchio Mercato", desc: "Profumi di spezie, botteghe e la moschea Al Sahaba: il volto più vivace di Sharm.", image: lanterns.url, photo: "Lanterne al mercato · foto illustrativa" },
 { name: "Piazza Soho", desc: "Un incontro con la Sharm serale, tra fontane, locali e passeggiate.", image: sunset.url, photo: "Luce serale · foto illustrativa" },
 { name: "Blue Hole, Dahab", desc: "Un celebre sito sul mare. Escursioni e immersioni da organizzare con guide qualificate.", image: dahab.url, photo: "Fondali di Dahab · foto illustrativa" },
 { name: "Sharm Vecchia", desc: "Il cuore autentico di Sharm: il vecchio porto dei pescatori, i vicoli bianchi, i ristoranti di pesce fresco e l’anima vera di questa città.", image: boat.url, photo: "Barca sul mare · foto illustrativa" },
];
export const ROOM_AMENITIES = ["Aria condizionata", "TV satellitare", "Balcone", "Microonde", "Cassaforte", "Bollitore", "Asciugacapelli", "Accesso a piscine e spiagge"];
