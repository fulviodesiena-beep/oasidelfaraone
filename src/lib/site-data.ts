import ownSafari from "@/assets/exp-safari-owner.jpg.asset.json";
import ownRasmo from "@/assets/exp-rasmo-owner.webp.asset.json";
import ownTransfer from "@/assets/exp-transfer-owner.jpg.asset.json";
import ownTiran from "@/assets/exp-tiran-owner.jpg.asset.json";
import ownFarsha from "@/assets/spot-farsha-owner.jpg.asset.json";
import spotSohoFountain from "@/assets/spot-soho-fountain.jpg.asset.json";
import ownMarket from "@/assets/spot-market-owner.jpg.asset.json";
import ownOldSharm from "@/assets/spot-oldsharm-owner.webp.asset.json";
import boat from "@/assets/boat.jpg.asset.json";
// Place photos chosen so each card shows that exact place (November 2026).
import lanterns from "@/assets/lanterns-market.jpg.asset.json";
import dahab from "@/assets/dahab-reef.jpg.asset.json";
// Experience photos chosen so each card shows exactly what that experience is (November 2026).
import expPyramidsCamel from "@/assets/exp-pyramids-camel.jpg.asset.json";
import expSinaiNight from "@/assets/exp-sinai-night.jpg.asset.json";
import restPanorama from "@/assets/rest-panorama.jpg.asset.json";
import restItalian from "@/assets/rest-italian.jpg.asset.json";
import restPizza from "@/assets/rest-pizza.jpg.asset.json";
import aptBedroomDaybed from "@/assets/apt-bedroom-daybed.jpg.asset.json";
import aptRoomTowelArt from "@/assets/apt-room-towel-art.jpg.asset.json";
import aptBedFlowers from "@/assets/apt-bed-flowers.jpg.asset.json";
import aptSofaBed from "@/assets/apt-sofa-bed.jpg.asset.json";
import aptBedroomSofa from "@/assets/apt-bedroom-sofa.jpg.asset.json";
import aptBathroomBathtub from "@/assets/apt-bathroom-bathtub.jpg.asset.json";
import aptBathroomVanity from "@/assets/apt-bathroom-vanity.jpg.asset.json";
import aptBalconyChairs from "@/assets/apt-balcony-chairs.jpg.asset.json";
import aptPoolRocks from "@/assets/apt-pool-rocks.jpg.asset.json";
import aptPoolWaterfall from "@/assets/apt-pool-waterfall.jpg.asset.json";
import villagePool from "@/assets/village-pool.webp.asset.json";
import villageBeachLoungers from "@/assets/village-beach-loungers.webp.asset.json";
import villageBeachDaybed from "@/assets/village-beach-daybed.webp.asset.json";
import villageSpaGarden from "@/assets/village-spa-garden.webp.asset.json";
import villageSpaMassage from "@/assets/village-spa-massage.webp.asset.json";
import villageGym from "@/assets/village-gym.webp.asset.json";
import villageDiveBoat from "@/assets/village-dive-boat.webp.asset.json";
import villageTurtleReef from "@/assets/village-turtle-reef.webp.asset.json";
import villageRestaurantChef from "@/assets/village-restaurant-chef.webp.asset.json";
import villageRestaurantTerrace from "@/assets/village-restaurant-terrace.webp.asset.json";
import villageCoastAerial from "@/assets/village-coast-aerial.webp.asset.json";
import villageLagoonDay from "@/assets/village-lagoon-day.webp.asset.json";
import villageLagoonNight from "@/assets/village-lagoon-night.webp.asset.json";
import villageBeachSunset from "@/assets/village-beach-sunset.webp.asset.json";
import villagePadelCourts from "@/assets/village-padel-courts.webp.asset.json";
import villageGymWeights from "@/assets/village-gym-weights.webp.asset.json";
import villageBeachClubNight from "@/assets/village-beach-club-night.webp.asset.json";
import villageEveningShow from "@/assets/village-evening-show.webp.asset.json";
// Real hero photos supplied by the owner (November 2026), in the order he sent them.
import heroPoolSunset from "@/assets/hero-2.jpg.asset.json";
import heroCoastAerial from "@/assets/hero-1.jpg.asset.json";
import heroOrientalSuite from "@/assets/hero-3.jpg.asset.json";
export const OWNER_WHATSAPP = "393347328158";
export const MINA_WHATSAPP = "393481804764";
export const OWNER_EMAIL = "prenotazioni@oasidelfaraone.it";
export const INSTAGRAM_URL = "https://www.instagram.com/oasidelfaraone";
export const wa = (num: string, text: string) => `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
export type Extra = { id: string; name: string; desc: string; image: string; photo: string; focus?: string };
export const EXTRAS: Extra[] = [
  { id: "transfer", name: "Transfer dall’aeroporto", desc: "Il tuo arrivo, senza pensieri. Transfer privato dall’aeroporto di Sharm al Domina, da concordare con Mina.", image: ownTransfer.url, photo: "Transfer dall’aeroporto", focus: "0% 50%" },
  { id: "rasmo", name: "Snorkeling a Ras Mohammed", desc: "Un incontro con i colori della barriera corallina. Itinerario e servizi da concordare con Mina.", image: ownRasmo.url, photo: "Snorkeling a Ras Mohammed" },
  { id: "tiran", name: "In barca verso Tiran", desc: "Il mare aperto, una sosta per nuotare e il tempo che rallenta. Uscita soggetta alle condizioni locali.", image: ownTiran.url, photo: "Gita in barca verso Tiran" },
  { id: "safari", name: "Safari nel deserto", desc: "Esplora il deserto in quad, tra silenzio e luce del tramonto. Programma da concordare.", image: ownSafari.url, photo: "Safari nel deserto" },
  { id: "cairo", name: "Il Cairo e le piramidi", desc: "Una giornata nella storia dell’Egitto. Trasporto, ingressi e programma su richiesta.", image: expPyramidsCamel.url, photo: "Piramide con cammello · foto illustrativa" },
  { id: "sinai", name: "Monte Sinai di notte", desc: "Un cammino sotto le stelle verso l’alba. Partenza e accompagnamento da concordare con Mina.", image: expSinaiNight.url, photo: "Cielo stellato sulla montagna · foto illustrativa" },
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
 { name: "Caffè Farsha", desc: "Lanterne, cuscini e una serata affacciata sul mare: un luogo da vivere con calma.", image: ownFarsha.url, photo: "Caffè Farsha" },
 { name: "Vecchio Mercato", desc: "Profumi di spezie, botteghe e la moschea Al Sahaba: il volto più vivace di Sharm.", image: ownMarket.url, photo: "Vecchio Mercato" },
 { name: "Soho Square", desc: "Un incontro con la Sharm serale, tra fontane illuminate, negozi e passeggiate.", image: spotSohoFountain.url, photo: "Soho Square, la fontana illuminata di sera" },
 { name: "Blue Hole, Dahab", desc: "Un celebre sito sul mare. Escursioni e immersioni da organizzare con guide qualificate.", image: dahab.url, photo: "Fondali di Dahab · foto illustrativa" },
 { name: "Old Sharm", desc: "Il cuore autentico di Old Sharm: il vecchio porto dei pescatori, i vicoli bianchi, i ristoranti di pesce fresco e l’anima vera di questa città.", image: ownOldSharm.url, photo: "Old Sharm" },
];
export const ROOM_AMENITIES = ["Aria condizionata", "TV satellitare", "Balcone vista piscina", "Microonde", "Cassaforte", "Bollitore", "Asciugacapelli", "Spiagge e piscine del resort incluse"];
export const HERO_PHOTOS: { src: string; alt: string }[] = [
  { src: heroPoolSunset.url, alt: "Piscina a sfioro al tramonto, con il Mar Rosso davanti" },
  { src: heroCoastAerial.url, alt: "Veduta aerea del villaggio, della spiaggia e della barriera corallina" },
  { src: heroOrientalSuite.url, alt: "Soggiorno in stile orientale affacciato sulla piscina, alla sera" },
];
export const APARTMENT_PHOTOS: { src: string; alt: string }[] = [
  { src: aptBedroomDaybed.url, alt: "Camera con letto matrimoniale e lettino dell’appartamento Elisir d’Oriente al Domina Coral Bay" },
  { src: aptRoomTowelArt.url, alt: "Letto e divano letto con asciugamani e petali" },
  { src: aptBedFlowers.url, alt: "Dettaglio del letto con petali" },
  { src: aptSofaBed.url, alt: "Divano letto accanto al balcone vista piscina dell’appartamento a Sharm el-Sheikh" },
  { src: aptBedroomSofa.url, alt: "Angolo riposo con divanetto" },
  { src: aptBathroomBathtub.url, alt: "Bagno dell’appartamento con vasca e doccia in vetro" },
  { src: aptBathroomVanity.url, alt: "Bagno con lavandino e porta scorrevole" },
  { src: aptBalconyChairs.url, alt: "Balcone con vista sulla piscina dell’appartamento Elisir d’Oriente al Domina Coral Bay" },
  { src: aptPoolRocks.url, alt: "Piscina del villaggio Domina Coral Bay con rocce e ombrelloni" },
  { src: aptPoolWaterfall.url, alt: "L’acqua della piscina con cascata di rocce" },
];
// Real village photos supplied by the owner (August 2026) for the Domina Coral Bay carousel.
// Order follows the day: arrival and sea, water and beach, sport, wellness, reef, table, evenings.
export const VILLAGE_PHOTOS: { src: string; alt: string }[] = [
  { src: villageCoastAerial.url, alt: "Vista aerea sulla spiaggia, i pontili e la barriera corallina" },
  { src: villagePool.url, alt: "Piscina con parete di roccia e lettini prendisole" },
  { src: villageLagoonDay.url, alt: "Laguna con rocce e getto d’acqua, gazebo bianchi sullo sfondo" },
  { src: villageLagoonNight.url, alt: "Laguna di notte, con rocce e cascate illuminate" },
  { src: villageBeachLoungers.url, alt: "Lettini all’ombra di un ombrellone in paglia, con il mare davanti" },
  { src: villageBeachDaybed.url, alt: "Lettone in riva al mare sulla spiaggia del villaggio" },
  { src: villageBeachSunset.url, alt: "La spiaggia e i campi da beach volley al tramonto" },
  { src: villagePadelCourts.url, alt: "Campi da padel nel villaggio" },
  { src: villageGym.url, alt: "Sala fitness affacciata sulla spiaggia" },
  { src: villageGymWeights.url, alt: "Sala pesi con attrezzi e materassini" },
  { src: villageSpaGarden.url, alt: "Giardino benessere con cascata di roccia e palme" },
  { src: villageSpaMassage.url, alt: "Massaggio con fagottini d’erbe nella spa del villaggio" },
  { src: villageDiveBoat.url, alt: "Gommone da immersione con i sub in azione" },
  { src: villageTurtleReef.url, alt: "Tartaruga marina tra i coralli del Mar Rosso" },
  { src: villageRestaurantChef.url, alt: "Lo chef che impiatta un piatto caldo in sala" },
  { src: villageRestaurantTerrace.url, alt: "Tavolo apparecchiato con vista sulla laguna del resort" },
  { src: villageBeachClubNight.url, alt: "Beach club sul mare illuminato di sera" },
  { src: villageEveningShow.url, alt: "Spettacolo serale con gli artisti davanti agli ospiti a cena" },
];

/** Rooms of the Oasi del Faraone brand (mirrors the `rooms` table; Elisir d'Oriente is the first). */
export const ELISIR_ROOM_ID = "0e11a5e0-0000-4000-8000-000000000001";
export const ROOMS = [{
  id: ELISIR_ROOM_ID, slug: "elisir-d-oriente", name: "Elisir d’Oriente", zone: "Zona Elisir · Domina Coral Bay",
  maxGuests: 4, sizeSqm: 60, cover: APARTMENT_PHOTOS[0]!.src,
  summary: "60 m² con balcone vista piscina, fino a 4 ospiti, a pochi passi dal Mar Rosso: un unico prezzo per tutto l’appartamento.",
  story: "Si racconta che lungo le vie dei mercanti che attraversavano il Sinai, tra le spezie, l’incenso e le stoffe, viaggiasse un’ampolla che nessuno vendeva mai. Conteneva l’Elisir d’Oriente: non un profumo, ma un’abitudine. Fermarsi. Guardare il mare all’alba. Esprimere un desiderio prima che il sole fosse del tutto sorto. Chi lo faceva, dicevano, tornava sempre. Noi l’ampolla non l’abbiamo trovata. Ma abbiamo trovato il posto in cui l’abitudine ha senso: un balcone sulla piscina, a pochi passi dal Mar Rosso, nella zona del villaggio che porta il suo nome.",
  ritual: "Nell’antico Egitto lo scarabeo era il simbolo di Khepri, il sole che sorge, e della rinascita. All’arrivo troverai in camera un piccolo scarabeo, la storia della stanza su papiro e una cartolina per il tuo desiderio. Alla prima alba esci sul balcone, tieni lo scarabeo controluce, giralo tre volte ed esprimi un desiderio. Scrivilo sul papiro e lascialo nello Scrigno dell’Elisir: lo ritroverai se tornerai. Lo scarabeo è tuo. Condividi il momento con #RisveglioDelloScarabeo e @oasidelfaraone.",
}] as const;
