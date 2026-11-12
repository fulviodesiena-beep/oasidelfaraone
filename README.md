# Oasidelfaraone

Build a premium vacation rental booking platform for "Oasi del Faraone — Elisir d'Oriente", an apartment at Domina Coral Bay resort, Sharm el-Sheikh, Egypt. This needs TWO parts:

## PART 1: PUBLIC BOOKING WEBSITE (the main page)

### Visual & Emotional Design
- Dark, luxury feel — think high-end resort, not Airbnb
- Full-screen hero with auto-scrolling photo gallery (use beautiful placeholder images of Egyptian resort / Red Sea / luxury apartment)
- Smooth scroll animations throughout
- Color palette: deep navy (#0A1628), warm gold (#C9A84C), cream white (#F8F3EA), terracotta (#C77B4A)
- Typography: elegant serif for headlines, clean sans-serif for body
- Every section should make you WANT to book

### Page Sections:
1. **HERO** — Full-screen video/photo slider, overlay text: "Elisir d'Oriente · Domina Coral Bay · Sharm el-Sheikh", prominent CTA "Book Your Stay"

2. **BOOKING ENGINE** (the money section) — sticky or prominently placed
   - Date picker (check-in / check-out)
   - Number of guests (adults + children, max 5 total)
   - Dynamic pricing display (price per night × nights = total)
   - "Create Quote" → shows breakdown
   - "Confirm & Pay" button (Stripe integration placeholder)
   - Availability calendar

3. **THE APARTMENT** — Photo gallery grid (I'll upload real photos), key specs:
   - 60m² apartment, sleeps up to 5, pool view, terrace
   - Amenities: AC, WiFi, satellite TV, terrace, microwave, safe, kettle, coffee maker, hair dryer, daily housekeeping
   - Access: Spa Élisir (free daily), all pools & beaches

4. **LIVE THE RESORT** — Domina Coral Bay experience section
   - Beautiful cards for: Private beach, Pools, Spa Élisir, Entertainment, Restaurants
   - "We recommend experiencing local restaurants, not just all-inclusive" — cultural message
   - Resort map placeholder

5. **MINA — YOUR GUIDE** — Featured section for Mina, the trusted local guide
   - Photo placeholder, WhatsApp contact button
   - Services: excursions, transfers, local tips, safety guide for exploring Sharm
   - "Let Mina show you the real Sharm el-Sheikh"

6. **EXTRAS (upsell section — Ryanair style)** — Cards the user can add to booking:
   - 🚗 Airport transfer (~€15)
   - 🤿 Snorkeling at Ras Mohammed
   - ⛵ Tiran Island boat trip  
   - 🏜️ Desert safari (quad + camel + Bedouin dinner)
   - 🏛️ Cairo day trip (Pyramids + Sphinx)
   - 🌄 Mount Sinai night hike
   - 🎯 Each has price, description, WhatsApp contact to Mina
   - Add-to-booking functionality

7. **EXPLORE SHARM** — Beautiful cards for top spots:
   - Farsha Café, Naama Bay, Old Market, Soho Square, Blue Hole Dahab, Ras Mohammed

8. **WHERE TO EAT** — Restaurant recommendations:
   - Cava (resort, fine dining), Impásto (Italian, Delta Sharm), Mahony (fish, Naama Bay), Il Vizietto (Italian wood-fire), Arafa (Egyptian, authentic)

9. **PRACTICAL INFO** — Clean accordion/cards:
   - Check-in 15:00 / Check-out 11:00
   - Currency: EGP (Euro accepted)
   - Climate info
   - How to reach the resort

10. **REAL ESTATE LEAD CAPTURE** — subtle section at the bottom:
    - "Interested in buying or investing at Domina Coral Bay?"
    - Lead form with: Name, Email, Phone, Interest (Studio / 2-bed / Duplex / Shop / Business activity / Other investment)
    - Budget range selector
    - "We'll guide you" CTA

11. **FOOTER** — Logo Oasi del Faraone, contacts, social links

### Booking Flow:
- Select dates → see availability + price
- Add guests + extras
- Enter personal details + document upload (Italian ID card or passport, required for Domina delegation)
- Payment (Stripe placeholder)
- Confirmation email with booking summary
- WhatsApp notification to owner (+393347328158)

---

## PART 2: ADMIN CRM (behind /admin route, password protected)

### Dashboard
- Today's arrivals and departures
- Occupancy calendar (month view, color coded: blue=booked, purple=owner use, green=available)
- Revenue stats: monthly/annual
- Occupancy % (monthly and annual)
- Owner personal use % (days used by owner vs total days)

### Bookings Management
- Full booking list with filters
- Booking detail: guest info, dates, payment status, extras booked, documents uploaded
- Manual booking creation
- Booking modification (admin only — guests must request via WhatsApp)
- Booking cancellation

### Pricing Management
- Seasonal pricing calendar
- Set price per night for any date range
- Define seasons (low / mid / high / peak)
- Suggested price ranges:
  - Low season (Nov-Mar, excl. Xmas): €80-100/night
  - Mid season (Apr-Jun, Sep-Oct): €110-130/night
  - High season (Jul-Aug): €150-180/night
  - Peak (Christmas, Easter, New Year): €200-250/night

### Document Management
- View uploaded guest documents
- Generate Domina delegation PDF (auto-populated from guest data)
- Send delegation to: reservation-ks@dominacoralbay.com
- CC: ca.espo88@gmail.com

### Communications
- WhatsApp message templates (same 4 as existing system):
  1. Booking confirmation
  2. Pre-arrival info (5 days before)
  3. Check-in day instructions
  4. Post-stay thank you + review request
- Send via WhatsApp button

### Settings
- Property details
- Owner info (Fulvio De Siena, +393347328158)
- Delegate info (Carmine Esposito, passport YD1421286)
- Email config
- WhatsApp config

---

## TECH REQUIREMENTS:
- React + TypeScript + Tailwind CSS
- Supabase for database and auth
- Stripe for payments (setup placeholders)
- Shadcn/ui components
- Fully responsive (mobile-first — guests will book from phones)
- Fast loading, smooth animations (Framer Motion or CSS)
- SEO optimized

## BRAND:
- Name: Oasi del Faraone
- Sub-brand: Elisir d'Oriente
- Symbol: Egyptian cartouche with Djed pillar and sun (terracotta circle icon)
- Colors: Terracotta #C77B4A, Gold #D4A24C, Sand #FBF3E6, Dark Brown #7A4A2E
- Tagline: "Il tuo angolo d'Oriente sul Mar Rosso"

Start with the public-facing booking website first. Make it absolutely beautiful — cinematic, emotional, premium. This needs to make people feel Sharm el-Sheikh before they even book.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://oasidelfaraone.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c8a17086-c13d-4aaa-a828-f2849bd88ff9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
