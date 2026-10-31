export const OWNER_WHATSAPP = "393347328158";
export const MINA_WHATSAPP = "201501202025";

export const wa = (num: string, text: string) => `https://wa.me/${num}?text=${encodeURIComponent(text)}`;

export type Extra = { id: string; icon: string; name: string; price: number; desc: string };
export const EXTRAS: Extra[] = [
  { id: "transfer", icon: "🚗", name: "Airport transfer", price: 15, desc: "Private car from Sharm airport to the resort door, meet & greet included." },
  { id: "rasmo", icon: "🤿", name: "Snorkeling at Ras Mohammed", price: 45, desc: "Full-day boat to the national park reefs, lunch and gear included." },
  { id: "tiran", icon: "⛵", name: "Tiran Island boat trip", price: 40, desc: "Turquoise lagoons, coral walls and a slow afternoon on deck." },
  { id: "safari", icon: "🏜️", name: "Desert safari", price: 35, desc: "Quad ride, camel at sunset and a Bedouin dinner under the stars." },
  { id: "cairo", icon: "🏛️", name: "Cairo day trip", price: 120, desc: "Flight to Giza: the Pyramids, the Sphinx and the Egyptian Museum." },
  { id: "sinai", icon: "🌄", name: "Mount Sinai night hike", price: 55, desc: "Climb by starlight and watch sunrise over St. Catherine's." },
];

export const RESTAURANTS = [
  { name: "Cava", tag: "Resort · Fine dining", desc: "Candlelit tasting menus without leaving Domina." },
  { name: "Impásto", tag: "Italian · Delta Sharm", desc: "Handmade pasta, the real taste of home." },
  { name: "Mahony", tag: "Fish · Naama Bay", desc: "Choose your catch, grilled the Red Sea way." },
  { name: "Il Vizietto", tag: "Italian · Wood-fire", desc: "Crisp pizza from a roaring wood oven." },
  { name: "Arafa", tag: "Egyptian · Authentic", desc: "Koshari, molokhia and grilled kofta like locals eat." },
];

export const SPOTS = [
  { name: "Farsha Café", desc: "Cliffside lanterns, cushions and sunset over the sea." },
  { name: "Naama Bay", desc: "The beating heart of Sharm — promenade, bars and lights." },
  { name: "Old Market", desc: "Spices, the Al Sahaba mosque and the scent of shisha." },
  { name: "Soho Square", desc: "Dancing fountains, ice rink and evening strolls." },
  { name: "Blue Hole, Dahab", desc: "The legendary dive site, a day trip up the coast." },
  { name: "Ras Mohammed", desc: "The national park where the desert meets the reef." },
];
