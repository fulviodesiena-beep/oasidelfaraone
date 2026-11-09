// Testi delle automazioni (IT/EN/DE). Browser-safe: niente prezzi, segnaposto {{...}} riempiti dal motore.
export type Lang = "it" | "en" | "de";
export const LANGS: Lang[] = ["it", "en", "de"];
export type MessageKey = "A1" | "A2" | "A3" | "A4" | "A5" | "A5r" | "A6a" | "A6b" | "A7" | "A8a" | "A8b" | "A9" | "NL_CONFIRM";
export type Msg = { subject: string; body: string };

const SIGN = { it: "Fulvio\nOasi del Faraone — {{camera}}, Domina Coral Bay, Sharm el Sheikh", en: "Fulvio\nOasi del Faraone — {{camera}}, Domina Coral Bay, Sharm el Sheikh", de: "Fulvio\nOasi del Faraone — {{camera}}, Domina Coral Bay, Sharm el Sheikh" };
const HR = "━━━━━━━━━━━━━━━━━━━";

export const MARKETING_FOOTER: Record<Lang, string> = {
  it: "Oasi del Faraone · Domina Coral Bay, Coral Bay – 46619 Sharm el-Sheikh, Egitto",
  en: "Oasi del Faraone · Domina Coral Bay, Coral Bay – 46619 Sharm el-Sheikh, Egypt",
  de: "Oasi del Faraone · Domina Coral Bay, Coral Bay – 46619 Sharm el-Sheikh, Ägypten",
};
export const UNSUBSCRIBE_LABEL: Record<Lang, string> = { it: "Disiscriviti con un clic", en: "Unsubscribe with one click", de: "Mit einem Klick abmelden" };
export const VISA_NOTE: Record<Lang, string> = {
  it: "Verifica sempre i requisiti aggiornati su viaggiaresicuri.it prima di partire.",
  en: "Always check the latest entry requirements with your government's travel advice (for Italian citizens: viaggiaresicuri.it) before you leave.",
  de: "Prüfe vor der Abreise immer die aktuellen Einreisebestimmungen (Auswärtiges Amt; für Italiener: viaggiaresicuri.it).",
};

export const MESSAGES: Record<MessageKey, Record<Lang, Msg>> = {
  A1: {
    it: { subject: "✅ Prenotazione confermata — {{camera}} · Domina Coral Bay", body: `Ciao {{nome_ospite}}! 🎉

La tua prenotazione è confermata. Siamo davvero felici di averti con noi e siamo certi che sarà un soggiorno che ricorderai a lungo! 🌊☀️

📅 Check-in: {{checkin}}
📅 Check-out: {{checkout}}
🌙 Durata: {{notti}} notti
🎁 Servizi prenotati: {{servizi}}

Ti invieremo un secondo messaggio 5 giorni prima della partenza con tutte le istruzioni pratiche per il viaggio, l'aeroporto e l'arrivo in villaggio — così sarai pronto per tutto senza pensieri.

⚠️ Una cosa importante da fare subito:
Controlla i tuoi documenti di viaggio. Se il tuo passaporto o la tua carta d'identità per l'espatrio presentano strappi, danni o segni evidenti di usura, ti consiglio vivamente di rinnovarli il prima possibile. In certi casi i controlli aeroportuali possono essere molto rigidi e un documento malridotto potrebbe impedirti di imbarcarti — e sarebbe davvero un peccato rovinare una vacanza così bella per una cosa che si può risolvere facilmente adesso! 😊

💡 Hai bisogno di un transfer aeroporto → villaggio, vuoi organizzare delle escursioni o ti serve un punto di riferimento locale a Sharm che conosce ogni angolo del posto?
Ti presento Mina, il nostro referente egiziano di fiducia. È la persona a cui ci rivolgiamo noi stessi quando vogliamo vivere le esperienze più belle: dal Mar Rosso al deserto, dai mercati alle escursioni in jeep. Basta un messaggio e lui si organizza per te.

Per qualsiasi cosa sono qui. A presto! 🌴

${SIGN.it}` },
    en: { subject: "✅ Booking confirmed — {{camera}} · Domina Coral Bay", body: `Hi {{nome_ospite}}! 🎉

Your booking is confirmed. We're genuinely happy to welcome you and we're sure this will be a stay you'll remember for a long time! 🌊☀️

📅 Check-in: {{checkin}}
📅 Check-out: {{checkout}}
🌙 Length of stay: {{notti}} nights
🎁 Services booked: {{servizi}}

Five days before you leave we'll send you a second message with all the practical tips for the journey, the airport and your arrival at the resort — so you can travel without a worry.

⚠️ One important thing to do right away:
Check your travel documents. If your passport or ID card shows tears, damage or obvious wear, we strongly recommend renewing it as soon as possible. Airport checks can sometimes be very strict and a damaged document could stop you from boarding — it would be a real shame to spoil such a lovely holiday over something that's easy to fix now! 😊

💡 Need an airport → resort transfer, want to organise some excursions, or would you like a local contact in Sharm who knows every corner?
Meet Mina, our trusted Egyptian contact. He's the person we turn to ourselves for the best experiences: from the Red Sea to the desert, from the markets to jeep safaris. Just send him a message and he'll take care of everything.

I'm here for anything you need. See you soon! 🌴

${SIGN.en}` },
    de: { subject: "✅ Buchung bestätigt — {{camera}} · Domina Coral Bay", body: `Hallo {{nome_ospite}}! 🎉

Deine Buchung ist bestätigt. Wir freuen uns sehr auf dich und sind sicher, dass dieser Aufenthalt dir lange in Erinnerung bleiben wird! 🌊☀️

📅 Check-in: {{checkin}}
📅 Check-out: {{checkout}}
🌙 Dauer: {{notti}} Nächte
🎁 Gebuchte Leistungen: {{servizi}}

Fünf Tage vor deiner Abreise schicken wir dir eine zweite Nachricht mit allen praktischen Hinweisen zu Reise, Flughafen und Ankunft im Resort — damit du ganz entspannt starten kannst.

⚠️ Eine wichtige Sache gleich jetzt:
Prüfe deine Reisedokumente. Wenn Reisepass oder Personalausweis Risse, Schäden oder deutliche Abnutzung zeigen, erneuere sie bitte so bald wie möglich. Die Kontrollen am Flughafen können sehr streng sein, und ein beschädigtes Dokument kann dich am Boarding hindern — es wäre schade, einen so schönen Urlaub wegen etwas zu verlieren, das sich jetzt leicht lösen lässt! 😊

💡 Brauchst du einen Transfer vom Flughafen ins Resort, möchtest du Ausflüge planen oder einen Ansprechpartner vor Ort, der Sharm in- und auswendig kennt?
Das ist Mina, unser ägyptischer Vertrauensmann. Ihn fragen wir selbst, wenn wir die schönsten Erlebnisse suchen: vom Roten Meer bis zur Wüste, von den Märkten bis zur Jeep-Tour. Eine Nachricht genügt und er kümmert sich um alles.

Ich bin jederzeit für dich da. Bis bald! 🌴

${SIGN.de}` },
  },
  A2: {
    it: { subject: "📋 Info importanti per il tuo arrivo a Sharm — leggi prima di partire!", body: `Ciao {{nome_ospite}}! 🏖️

Ci siamo quasi! Mancano 5 giorni e vogliamo che il tuo arrivo a Sharm sia fluido, senza intoppi e con zero stress. Quindi ecco tutto quello che devi sapere 👇

${HR}
📄 DOCUMENTI ALL'AEROPORTO
${HR}

🟡 Scheda GIALLA — Carta d'identità (senza passaporto)
Se viaggi con la sola carta d'identità (valida per l'espatrio), all'arrivo a Sharm dovrai compilare una scheda di immigrazione di colore GIALLO — è di fatto il tuo visto d'ingresso.
→ Porta con te 1 fototessera per ogni persona in possesso solo di carta d'identità.
→ Trovi qui sotto i link ai documenti (fronte in arabo + fronte in italiano) così sai già cosa aspettarti.

Se invece hai il passaporto, non ti serve niente di tutto questo — sei a posto così.

🟣 Modulo ROSA — Tutti i viaggiatori
C'è anche un modulo di arrivo di colore ROSA che va compilato da tutti i passeggeri.
Di solito lo distribuiscono le compagnie aeree a bordo, poco prima dell'atterraggio. Se non dovesse arrivare durante il volo, nessun problema: lo trovi e lo richiedi ai poliziotti prima del controllo passaporti.

✏️ Porta una penna con te — ti servirà per compilare questi moduli.

${HR}
⚠️ ATTENZIONE ALL'ARRIVO
${HR}

Appena scendi e sali le scale (mobili o fisse), troverai una fila di persone con cartelline, nomi, loghi di tour operator. Creano un po' di caos e di solito ti indicano di seguirli verso destra (la tua sinistra) per compilare i documenti al posto tuo — ovviamente a pagamento.

💡 Il mio consiglio: ignorali con un sorriso, prosegui dritto e raggiungi i box della polizia locale — riconosci i poliziotti dalla divisa ufficiale. Consegni lì i moduli compilati e ti lasciano il visto. Semplice.

🕐 Soggiorni superiori a 15 giorni?
Se resti a Sharm più di 15 giorni, ricordati di acquistare il visto. Lo trovi prima dei box della polizia, in uno sportello apposito — te lo fa sempre un agente in divisa, che per ovvi motivi non accetta mance 😄

${HR}
📷 Documenti
${HR}
👇 Trovi i link ai moduli qui sotto (validi 30 giorni) — guardali prima di partire così non ti trovi impreparato.

A tra poco! 🌊

${SIGN.it}` },
    en: { subject: "📋 Important info for your arrival in Sharm — read before you go!", body: `Hi {{nome_ospite}}! 🏖️

Almost there! Just 5 days to go and we want your arrival in Sharm to be smooth and stress-free. Here's everything you need to know 👇

${HR}
📄 DOCUMENTS AT THE AIRPORT
${HR}

🟡 YELLOW card — ID card only (no passport)
If you're travelling with an ID card only (valid for travel abroad), on arrival in Sharm you'll fill in a YELLOW immigration card — it's effectively your entry visa.
→ Bring 1 passport photo for each person travelling with an ID card only.
→ Below you'll find links to the forms (Arabic and Italian front) so you know what to expect.

If you have a passport, you don't need any of this — you're all set.

🟣 PINK form — all travellers
There's also a PINK arrival form that every passenger must fill in.
Airlines usually hand it out on board shortly before landing. If you don't get one, no problem: ask the police officers before passport control.

✏️ Bring a pen — you'll need it for these forms.

${HR}
⚠️ HEADS-UP ON ARRIVAL
${HR}

As soon as you get off and go up the stairs or escalator, you'll see people with folders, names and tour-operator logos. They create a bit of chaos and usually ask you to follow them to fill in your documents for you — for a fee, of course.

💡 My advice: smile, ignore them, walk straight on to the local police booths — you'll recognise the officers by their official uniform. Hand in your completed forms there and they'll give you the visa. Simple.

🕐 Staying longer than 15 days?
If you stay in Sharm for more than 15 days, remember to buy the visa. You'll find a dedicated counter before the police booths — it's always issued by a uniformed officer, who of course doesn't accept tips 😄

${HR}
📷 Documents
${HR}
👇 The links to the forms are below (valid for 30 days) — have a look before you leave so you're fully prepared.

See you soon! 🌊

${SIGN.en}` },
    de: { subject: "📋 Wichtige Infos für deine Ankunft in Sharm — vor der Abreise lesen!", body: `Hallo {{nome_ospite}}! 🏖️

Fast geschafft! Nur noch 5 Tage, und wir möchten, dass deine Ankunft in Sharm reibungslos und ohne Stress verläuft. Hier ist alles, was du wissen musst 👇

${HR}
📄 DOKUMENTE AM FLUGHAFEN
${HR}

🟡 GELBE Karte — nur Personalausweis (kein Reisepass)
Wenn du nur mit Personalausweis reist, füllst du bei der Ankunft in Sharm eine GELBE Einreisekarte aus — sie ist praktisch dein Visum.
→ Bring pro Person mit nur Personalausweis 1 Passfoto mit.
→ Unten findest du Links zu den Formularen (Vorderseite Arabisch und Italienisch), damit du weißt, was dich erwartet.

Mit Reisepass brauchst du nichts davon — alles bestens.

🟣 ROSA Formular — alle Reisenden
Außerdem gibt es ein ROSA Ankunftsformular, das alle Passagiere ausfüllen.
Meist verteilen es die Fluggesellschaften kurz vor der Landung an Bord. Falls nicht, kein Problem: Frag die Polizisten vor der Passkontrolle danach.

✏️ Nimm einen Kugelschreiber mit — du brauchst ihn für die Formulare.

${HR}
⚠️ ACHTUNG BEI DER ANKUNFT
${HR}

Gleich nach dem Aussteigen und der Treppe oder Rolltreppe stehen Leute mit Mappen, Namen und Logos von Reiseveranstaltern. Sie sorgen für etwas Durcheinander und bieten an, die Formulare für dich auszufüllen — natürlich gegen Bezahlung.

💡 Mein Tipp: freundlich lächeln, ignorieren und geradeaus zu den Schaltern der örtlichen Polizei gehen — du erkennst die Beamten an der offiziellen Uniform. Dort gibst du die ausgefüllten Formulare ab und bekommst das Visum. Ganz einfach.

🕐 Länger als 15 Tage?
Wenn du länger als 15 Tage in Sharm bleibst, denk daran, das Visum zu kaufen. Es gibt einen eigenen Schalter vor den Polizeischaltern — ausgestellt immer von einem uniformierten Beamten, der natürlich kein Trinkgeld annimmt 😄

${HR}
📷 Dokumente
${HR}
👇 Die Links zu den Formularen findest du unten (30 Tage gültig) — schau sie dir vor der Abreise an.

Bis gleich! 🌊

${SIGN.de}` },
  },
  A3: {
    it: { subject: "", body: `Ciao {{nome_ospite}}! ✈️

Oggi si parte — buon viaggio! 🎉

Ricordati delle indicazioni di 5 giorni fa per i documenti e l'aeroporto. Se ne hai bisogno, scorri su e rileggi il messaggio.

${HR}
🏨 ARRIVO AL DOMINA CORAL BAY
${HR}

Una volta arrivato al villaggio:

🧳 Lascia pure le valigie nel piazzale del parcheggio accanto alla grande reception principale — ci pensano i ragazzi a portarle in camera con il taf taf. Non preoccuparti di niente.

Entra nella grande reception: lasciati trasportare dai colori, dal suono di una lingua nuova, dall'intenso profumo dell'ambiente. Sì, l'Egitto ha anche questo. 🌺

➡️ Dirigiti verso sinistra, come se andassi verso i bagni — è lì che trovi la reception degli appartamenti dei proprietari.

Chiedi della stanza {{numero_stanza}}, dai il tuo nome e cognome e prepara i documenti: compilerai un modulo di check-in con i tuoi dati e quelli dell'accompagnatore, poi ti daranno le chiavi.

💶 Se non hai già pagato le pulizie finali, ti verrà richiesto il pagamento in quel momento — dell'importo che ti è già stato comunicato in fase di prenotazione.

${HR}
🏠 LA TUA STANZA — ELISIR {{numero_stanza}}
${HR}

La {{numero_stanza}} si trova nell'Elisir, una delle zone più esclusive e tranquille del Domina Coral Bay. La stanza è tra le più grandi del villaggio, con balcone vista piscina, a pochi passi dalla piscina dell'Elisir. 🏊

Troverai:
✅ TV con telecomando
✅ Aria condizionata (interruttore a muro)
✅ Frigorifero
✅ Piccolo kit di benvenuto

🦟 La zanzariera per ora non c'è — ti consiglio di prendere qualche zampirone al bazar (da mettere fuori sul terrazzo) o un apparecchio elettrico da collegare alla presa in stanza. E tieni le aperture chiuse la sera: così eviti lunghe battaglie notturne 😄

💧 L'acqua:
Il Domina ha un ottimo sistema di depurazione, ma siccome non sei abituato a quell'acqua, usa il rubinetto solo per lavarti — non per i denti e non per berla. L'acqua in bottiglia la trovi in stanza.
L'Egitto è nel deserto, l'acqua è preziosa: chiudi bene i rubinetti, non lasciarla scorrere inutilmente e controlla che lo sciacquone non rimanga bloccato in modalità "scorre sempre" — succede. 😉

${HR}
🌍 IL VILLAGGIO — COSA C'È DENTRO
${HR}

Il Domina Coral Bay è un mondo a sé — uno dei resort più grandi e completi di tutto il Mar Rosso:

🍽️ 47 ristoranti — dalla cucina italiana al sushi, dai grill ai locali tipici egiziani
🧖 Elisir Thalasso & Spa — trattamenti, massaggi, thalassoterapia, beauty center
🎾 D Sports — padel, tennis, beach volley, sport acquatici e molto altro
🤿 Centro Diving — per esplorare il reef direttamente dal villaggio
🎭 Desert Arena — teatro, show serali, eventi e animazione
🏖️ The Beach Luxury Club — la spiaggia privata più esclusiva
🎰 Aladin Casinò — per chi vuole un po' di brivido la sera
🛍️ Shopping & Bazar interni

🛴 Per scooter elettrici, bici e monopattini all'interno del villaggio, chiedi di MOOVY — la mobilità elettrica del Domina. Comodo, ecologico e divertente.

${HR}

SEI IN VACANZA. RILASSATI. 🌊☀️

Per qualsiasi cosa sono qui.

Fulvio
Oasi del Faraone — {{camera}}, Domina Coral Bay` },
    en: { subject: "", body: `Hi {{nome_ospite}}! ✈️

Today's the day — have a great trip! 🎉

Remember the tips from 5 days ago about documents and the airport. If you need them, just scroll up and reread that message.

${HR}
🏨 ARRIVING AT DOMINA CORAL BAY
${HR}

Once you reach the resort:

🧳 Leave your suitcases in the car park next to the big main reception — the staff will bring them to your room by buggy. Nothing to worry about.

Step into the main reception: let yourself be carried away by the colours, the sound of a new language, the rich scents. Yes, Egypt is this too. 🌺

➡️ Head left, as if you were going to the toilets — that's where you'll find the reception for owners' apartments.

Ask for room {{numero_stanza}}, give your full name and have your documents ready: you'll fill in a check-in form with your details and those of your companions, then they'll hand you the keys.

💶 If you haven't already paid for the final cleaning, you'll be asked to pay then — the amount we told you when you booked.

${HR}
🏠 YOUR ROOM — ELISIR {{numero_stanza}}
${HR}

{{numero_stanza}} is in the Elisir area, one of the most exclusive and peaceful parts of Domina Coral Bay. It's one of the largest rooms in the resort, with a pool-view balcony just a few steps from the Elisir pool. 🏊

You'll find:
✅ TV with remote
✅ Air conditioning (wall switch)
✅ Fridge
✅ A small welcome kit

🦟 There's no mosquito net for now — pick up some mosquito coils at the bazaar (for outside on the terrace) or a plug-in device for the room. And keep windows and doors closed in the evening to avoid long night-time battles 😄

💧 Water:
Domina has an excellent purification system, but since you're not used to that water, use the tap only for washing — not for brushing your teeth or drinking. Bottled water is in the room.
Egypt is in the desert and water is precious: turn taps off properly, don't leave it running and check the toilet flush doesn't get stuck on "always running" — it happens. 😉

${HR}
🌍 THE RESORT — WHAT'S INSIDE
${HR}

Domina Coral Bay is a world of its own — one of the largest and most complete resorts on the Red Sea:

🍽️ 47 restaurants — from Italian to sushi, grills to traditional Egyptian
🧖 Elisir Thalasso & Spa — treatments, massages, thalassotherapy, beauty centre
🎾 D Sports — padel, tennis, beach volley, water sports and much more
🤿 Diving centre — explore the reef right from the resort
🎭 Desert Arena — theatre, evening shows, events and entertainment
🏖️ The Beach Luxury Club — the most exclusive private beach
🎰 Aladin Casino — for a little evening thrill
🛍️ Shops & bazaar inside the resort

🛴 For e-scooters, bikes and kick scooters inside the resort, ask for MOOVY — Domina's electric mobility. Easy, green and fun.

${HR}

YOU'RE ON HOLIDAY. RELAX. 🌊☀️

I'm here for anything you need.

Fulvio
Oasi del Faraone — {{camera}}, Domina Coral Bay` },
    de: { subject: "", body: `Hallo {{nome_ospite}}! ✈️

Heute geht's los — gute Reise! 🎉

Denk an die Hinweise von vor 5 Tagen zu Dokumenten und Flughafen. Wenn nötig, scroll einfach nach oben und lies die Nachricht noch einmal.

${HR}
🏨 ANKUNFT IM DOMINA CORAL BAY
${HR}

Wenn du im Resort ankommst:

🧳 Lass die Koffer auf dem Parkplatz neben der großen Hauptrezeption — die Jungs bringen sie mit dem Elektrowagen aufs Zimmer. Du musst dich um nichts kümmern.

Betritt die große Rezeption: Lass dich von den Farben, dem Klang einer neuen Sprache und dem intensiven Duft treiben. Ja, auch das ist Ägypten. 🌺

➡️ Geh nach links, als würdest du zu den Toiletten gehen — dort ist die Rezeption der Eigentümer-Apartments.

Frag nach Zimmer {{numero_stanza}}, nenne Vor- und Nachnamen und halte die Dokumente bereit: Du füllst ein Check-in-Formular mit deinen Daten und denen deiner Begleitung aus, dann bekommst du die Schlüssel.

💶 Falls du die Endreinigung noch nicht bezahlt hast, wird sie dann fällig — in der Höhe, die wir dir bei der Buchung genannt haben.

${HR}
🏠 DEIN ZIMMER — ELISIR {{numero_stanza}}
${HR}

Die {{numero_stanza}} liegt im Bereich Elisir, einem der exklusivsten und ruhigsten Teile des Domina Coral Bay. Sie gehört zu den größten Zimmern des Resorts, mit Balkon und Poolblick, nur wenige Schritte vom Elisir-Pool entfernt. 🏊

Du findest:
✅ TV mit Fernbedienung
✅ Klimaanlage (Wandschalter)
✅ Kühlschrank
✅ Ein kleines Willkommensset

🦟 Ein Moskitonetz gibt es noch nicht — besorg dir im Basar ein paar Räucherspiralen (für draußen auf der Terrasse) oder ein Steckgerät fürs Zimmer. Und halte abends Fenster und Türen geschlossen, dann bleiben dir lange Nachtkämpfe erspart 😄

💧 Wasser:
Das Domina hat eine sehr gute Aufbereitung, aber da du dieses Wasser nicht gewohnt bist, nutze das Leitungswasser nur zum Waschen — nicht zum Zähneputzen oder Trinken. Wasser in Flaschen steht im Zimmer.
Ägypten liegt in der Wüste, Wasser ist kostbar: Dreh die Hähne gut zu, lass es nicht unnötig laufen und prüfe, dass die Spülung nicht auf „läuft immer" hängen bleibt — das kommt vor. 😉

${HR}
🌍 DAS RESORT — WAS ES ALLES GIBT
${HR}

Das Domina Coral Bay ist eine Welt für sich — eines der größten und vielseitigsten Resorts am Roten Meer:

🍽️ 47 Restaurants — von italienisch bis Sushi, vom Grill bis zu typisch ägyptischen Lokalen
🧖 Elisir Thalasso & Spa — Behandlungen, Massagen, Thalasso, Beauty
🎾 D Sports — Padel, Tennis, Beachvolleyball, Wassersport und mehr
🤿 Tauchzentrum — das Riff direkt vom Resort aus entdecken
🎭 Desert Arena — Theater, Abendshows, Events und Animation
🏖️ The Beach Luxury Club — der exklusivste Privatstrand
🎰 Aladin Casino — für etwas Nervenkitzel am Abend
🛍️ Shops & Basar im Resort

🛴 Für E-Scooter, Fahrräder und Tretroller im Resort frag nach MOOVY — die Elektromobilität des Domina. Bequem, umweltfreundlich und lustig.

${HR}

DU BIST IM URLAUB. ENTSPANN DICH. 🌊☀️

Ich bin jederzeit für dich da.

Fulvio
Oasi del Faraone — {{camera}}, Domina Coral Bay` },
  },
  A4: {
    it: { subject: "", body: "Ciao {{nome_ospite}}! 🌴 Com'è andato l'arrivo? Va tutto bene in stanza? Se ti serve qualcosa — un consiglio su dove mangiare stasera, un'escursione o una mano con la reception — scrivimi pure qui. Buona giornata al sole! ☀️\nFulvio" },
    en: { subject: "", body: "Hi {{nome_ospite}}! 🌴 How was your arrival? Is everything OK in the room? If you need anything — a tip for dinner tonight, an excursion or a hand with reception — just message me here. Enjoy the sun! ☀️\nFulvio" },
    de: { subject: "", body: "Hallo {{nome_ospite}}! 🌴 Wie war die Ankunft? Ist im Zimmer alles in Ordnung? Wenn du etwas brauchst — einen Tipp fürs Abendessen, einen Ausflug oder Hilfe an der Rezeption — schreib mir einfach hier. Genieß die Sonne! ☀️\nFulvio" },
  },
  A5: {
    it: { subject: "⭐ Come è andata? Grazie per il tuo soggiorno — {{camera}}", body: `Ciao {{nome_ospite}}! 👋

Speriamo che questi giorni a Sharm siano stati davvero speciali e che le nostre indicazioni ti abbiano reso tutto più semplice e piacevole.

Grazie di cuore per aver scelto {{camera}} — per noi non è solo un appartamento, è un posto che vogliamo condividere con persone che sanno apprezzarlo. E tu lo sei stato sicuramente. 🙏

🎁 Come ringraziamento per il soggiorno, ecco un coupon del 10% di sconto sulla tua prossima prenotazione con noi:
👉 Codice: ELISIR10
Basta comunicarcelo al momento della prossima prenotazione. Il codice è tuo, a prescindere da tutto il resto.

${HR}
⭐ SE TI VA, UNA RECENSIONE
${HR}

Separatamente, se hai un minuto: una recensione sincera — anche solo qualche riga, positiva o critica — ci aiuta a migliorare e a far trovare questo posto alle persone giuste. È del tutto facoltativa.

Grazie davvero. A presto — magari già il prossimo anno! 🌊☀️

${SIGN.it}` },
    en: { subject: "⭐ How was it? Thank you for your stay — {{camera}}", body: `Hi {{nome_ospite}}! 👋

We hope your days in Sharm were truly special and that our tips made everything easier and more enjoyable.

Thank you so much for choosing {{camera}} — for us it's not just an apartment, it's a place we love sharing with people who appreciate it. And you certainly did. 🙏

🎁 As a thank-you for your stay, here's a 10% discount code for your next booking with us:
👉 Code: ELISIR10
Just mention it when you book next time. The code is yours, regardless of anything else.

${HR}
⭐ A REVIEW, IF YOU LIKE
${HR}

Separately, if you have a minute: an honest review — even just a few lines, positive or critical — helps us improve and helps the right people find this place. It's entirely optional.

Thank you. See you soon — maybe next year! 🌊☀️

${SIGN.en}` },
    de: { subject: "⭐ Wie war's? Danke für deinen Aufenthalt — {{camera}}", body: `Hallo {{nome_ospite}}! 👋

Wir hoffen, deine Tage in Sharm waren etwas ganz Besonderes und unsere Tipps haben dir alles leichter gemacht.

Herzlichen Dank, dass du dich für {{camera}} entschieden hast — für uns ist es nicht nur ein Apartment, sondern ein Ort, den wir gern mit Menschen teilen, die ihn zu schätzen wissen. Und das hast du ganz sicher. 🙏

🎁 Als Dankeschön für deinen Aufenthalt bekommst du 10 % Rabatt auf deine nächste Buchung bei uns:
👉 Code: ELISIR10
Nenne ihn einfach bei der nächsten Buchung. Der Code gehört dir, unabhängig von allem anderen.

${HR}
⭐ EINE BEWERTUNG, WENN DU MAGST
${HR}

Unabhängig davon, falls du eine Minute hast: Eine ehrliche Bewertung — auch nur ein paar Zeilen, positiv oder kritisch — hilft uns, besser zu werden, und den richtigen Gästen, diesen Ort zu finden. Sie ist völlig freiwillig.

Vielen Dank. Bis bald — vielleicht schon nächstes Jahr! 🌊☀️

${SIGN.de}` },
  },
  A5r: {
    it: { subject: "Un minuto per raccontare il tuo soggiorno?", body: "Ciao {{nome_ospite}}, qualche giorno fa ti abbiamo scritto per ringraziarti del soggiorno a {{camera}}. Se ti va di lasciare una recensione sincera, ecco di nuovo il link: è facoltativa e non cambia nulla del tuo codice ELISIR10. Grazie!\n\nFulvio — Oasi del Faraone" },
    en: { subject: "A minute to tell us about your stay?", body: "Hi {{nome_ospite}}, a few days ago we wrote to thank you for your stay at {{camera}}. If you'd like to leave an honest review, here's the link again: it's optional and doesn't affect your ELISIR10 code in any way. Thank you!\n\nFulvio — Oasi del Faraone" },
    de: { subject: "Eine Minute für deinen Aufenthalt?", body: "Hallo {{nome_ospite}}, vor ein paar Tagen haben wir uns für deinen Aufenthalt in {{camera}} bedankt. Wenn du eine ehrliche Bewertung schreiben möchtest, hier noch einmal der Link: freiwillig und ohne Einfluss auf deinen Code ELISIR10. Danke!\n\nFulvio — Oasi del Faraone" },
  },
  A6a: {
    it: { subject: "Preparati al viaggio con noi 🌊", body: "Ciao {{nome_ospite}}! Mentre aspetti la partenza, su Instagram e Facebook raccontiamo il Domina Coral Bay, Sharm e i piccoli segreti dell'Oasi: è un buon modo per prepararsi al viaggio e arrivare già con qualche idea.\n\nA presto,\nFulvio — Oasi del Faraone" },
    en: { subject: "Get ready for your trip with us 🌊", body: "Hi {{nome_ospite}}! While you wait to leave, on Instagram and Facebook we share Domina Coral Bay, Sharm and the little secrets of the Oasis: a nice way to prepare and arrive with a few ideas already.\n\nSee you soon,\nFulvio — Oasi del Faraone" },
    de: { subject: "Bereite dich mit uns auf die Reise vor 🌊", body: "Hallo {{nome_ospite}}! Bis zur Abreise zeigen wir auf Instagram und Facebook das Domina Coral Bay, Sharm und die kleinen Geheimnisse der Oase: eine schöne Art, sich vorzubereiten und schon mit Ideen anzukommen.\n\nBis bald,\nFulvio — Oasi del Faraone" },
  },
  A6b: {
    it: { subject: "Il tuo scarabeo è tornato a casa con te? 🪲", body: "Ciao {{nome_ospite}}! Se hai fatto il rito del risveglio dello scarabeo o hai una foto del tuo balcone all'alba, ci farebbe piacere vederla: taggaci con #RisveglioDelloScarabeo e @oasidelfaraone.\n\nGrazie ancora,\nFulvio — Oasi del Faraone" },
    en: { subject: "Did your scarab come home with you? 🪲", body: "Hi {{nome_ospite}}! If you did the scarab awakening ritual or have a photo of your balcony at dawn, we'd love to see it: tag us with #RisveglioDelloScarabeo and @oasidelfaraone.\n\nThanks again,\nFulvio — Oasi del Faraone" },
    de: { subject: "Ist dein Skarabäus mit dir nach Hause gekommen? 🪲", body: "Hallo {{nome_ospite}}! Wenn du das Ritual des erwachenden Skarabäus gemacht hast oder ein Foto deines Balkons bei Sonnenaufgang hast, zeig es uns gern: markiere uns mit #RisveglioDelloScarabeo und @oasidelfaraone.\n\nNochmals danke,\nFulvio — Oasi del Faraone" },
  },
  A7: {
    it: { subject: "Una data speciale si avvicina 🎉", body: "Ciao {{nome_ospite}}! Tra qualche mese c'è una data importante per te o per chi viaggia con te ({{occasione}}). Se ti piacerebbe festeggiarla a Sharm, sul balcone all'alba o con una cena sul mare, scrivici: prepariamo insieme qualcosa di speciale e ti diciamo quali date sono libere.\n\nFulvio — Oasi del Faraone" },
    en: { subject: "A special date is coming up 🎉", body: "Hi {{nome_ospite}}! In a few months there's an important date for you or someone you travel with ({{occasione}}). If you'd like to celebrate it in Sharm, on the balcony at sunrise or with dinner by the sea, write to us: we'll plan something special together and tell you which dates are free.\n\nFulvio — Oasi del Faraone" },
    de: { subject: "Ein besonderes Datum rückt näher 🎉", body: "Hallo {{nome_ospite}}! In ein paar Monaten steht ein wichtiges Datum für dich oder deine Reisebegleitung an ({{occasione}}). Wenn du es in Sharm feiern möchtest, auf dem Balkon bei Sonnenaufgang oder mit einem Abendessen am Meer, schreib uns: Wir planen gemeinsam etwas Besonderes und sagen dir, welche Termine frei sind.\n\nFulvio — Oasi del Faraone" },
  },
  A8a: {
    it: { subject: "La tua richiesta per Sharm el-Sheikh", body: "Ciao {{nome_ospite}}, grazie per averci scritto per un soggiorno a Sharm. Volevo sapere se hai ricevuto la nostra risposta e se hai domande su date, transfer o sul Domina Coral Bay: rispondi pure a questa email o scrivimi su WhatsApp.\n\nFulvio — Oasi del Faraone" },
    en: { subject: "Your request for Sharm el-Sheikh", body: "Hi {{nome_ospite}}, thank you for getting in touch about a stay in Sharm. I wanted to check you received our reply and whether you have any questions about dates, transfers or Domina Coral Bay: just reply to this email or message me on WhatsApp.\n\nFulvio — Oasi del Faraone" },
    de: { subject: "Deine Anfrage für Sharm el-Sheikh", body: "Hallo {{nome_ospite}}, danke für deine Anfrage für einen Aufenthalt in Sharm. Ich wollte nachfragen, ob unsere Antwort angekommen ist und ob du Fragen zu Terminen, Transfer oder dem Domina Coral Bay hast: antworte einfach auf diese E-Mail oder schreib mir auf WhatsApp.\n\nFulvio — Oasi del Faraone" },
  },
  A8b: {
    it: { subject: "Ultimo messaggio sulla tua richiesta", body: "Ciao {{nome_ospite}}, ti scrivo un'ultima volta per la tua richiesta: se le date non vanno più bene o vuoi valutarne altre, puoi verificare le disponibilità sul sito in qualsiasi momento. Non ti scriveremo più su questa richiesta.\n\nFulvio — Oasi del Faraone" },
    en: { subject: "Last note about your request", body: "Hi {{nome_ospite}}, one last note about your request: if those dates no longer work or you'd like to look at others, you can check availability on the website any time. We won't write again about this request.\n\nFulvio — Oasi del Faraone" },
    de: { subject: "Letzte Nachricht zu deiner Anfrage", body: "Hallo {{nome_ospite}}, ein letztes Mal zu deiner Anfrage: Falls die Termine nicht mehr passen oder du andere prüfen möchtest, kannst du die Verfügbarkeit jederzeit auf der Website sehen. Zu dieser Anfrage schreiben wir dir nicht mehr.\n\nFulvio — Oasi del Faraone" },
  },
  A9: {
    it: { subject: "Un anno fa eri a Sharm ☀️", body: "Ciao {{nome_ospite}}! Quasi un anno fa eri al Domina Coral Bay. Se ti va di tornare, il codice ELISIR10 vale ancora per la tua prossima prenotazione: basta comunicarcelo. Le date libere le trovi sul sito.\n\nFulvio — Oasi del Faraone" },
    en: { subject: "A year ago you were in Sharm ☀️", body: "Hi {{nome_ospite}}! Almost a year ago you were at Domina Coral Bay. If you feel like coming back, the code ELISIR10 is still valid for your next booking: just mention it. You'll find the free dates on the website.\n\nFulvio — Oasi del Faraone" },
    de: { subject: "Vor einem Jahr warst du in Sharm ☀️", body: "Hallo {{nome_ospite}}! Vor fast einem Jahr warst du im Domina Coral Bay. Wenn du zurückkommen möchtest, gilt der Code ELISIR10 weiterhin für deine nächste Buchung: einfach angeben. Die freien Termine findest du auf der Website.\n\nFulvio — Oasi del Faraone" },
  },
  NL_CONFIRM: {
    it: { subject: "Conferma l'iscrizione a Lettere dall'Oasi", body: "Ciao! Per ricevere \"Lettere dall'Oasi\" (circa una ogni due settimane) conferma la tua iscrizione con il pulsante qui sotto. Se non sei stato tu, ignora questa email: non ti iscriveremo." },
    en: { subject: "Confirm your subscription to Letters from the Oasis", body: "Hi! To receive \"Letters from the Oasis\" (about one every two weeks) please confirm your subscription with the button below. If this wasn't you, just ignore this email: we won't subscribe you." },
    de: { subject: "Bestätige dein Abo der Briefe aus der Oase", body: "Hallo! Um die „Briefe aus der Oase\" (etwa alle zwei Wochen) zu erhalten, bestätige dein Abo mit dem Button unten. Falls du das nicht warst, ignoriere diese E-Mail einfach: Wir tragen dich nicht ein." },
  },
};

export const LINK_LABELS: Record<string, Record<Lang, string>> = {
  review: { it: "Lascia una recensione", en: "Leave a review", de: "Bewertung schreiben" },
  instagram: { it: "Instagram @oasidelfaraone", en: "Instagram @oasidelfaraone", de: "Instagram @oasidelfaraone" },
  facebook: { it: "Facebook", en: "Facebook", de: "Facebook" },
  site: { it: "Verifica le date libere", en: "Check available dates", de: "Freie Termine prüfen" },
  mina: { it: "Scrivi a Mina su WhatsApp", en: "Message Mina on WhatsApp", de: "Mina auf WhatsApp schreiben" },
  confirm: { it: "Confermo l'iscrizione", en: "Confirm subscription", de: "Abo bestätigen" },
  delega: { it: "Delega Domina (PDF)", en: "Domina authorisation (PDF)", de: "Domina-Vollmacht (PDF)" },
  "scheda-gialla-it.pdf": { it: "Scheda gialla — italiano", en: "Yellow card — Italian", de: "Gelbe Karte — Italienisch" },
  "scheda-gialla-ar.pdf": { it: "Scheda gialla — arabo", en: "Yellow card — Arabic", de: "Gelbe Karte — Arabisch" },
  "modulo-rosa-it.pdf": { it: "Modulo rosa — italiano", en: "Pink form — Italian", de: "Rosa Formular — Italienisch" },
  "modulo-rosa-ar.pdf": { it: "Modulo rosa — arabo", en: "Pink form — Arabic", de: "Rosa Formular — Arabisch" },
};
