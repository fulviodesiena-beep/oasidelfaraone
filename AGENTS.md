<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Public booking architecture
- Public languages share page components and complete local dictionaries; locale routes own their SEO and only new inquiries propagate language to contacts via a dedicated trigger, to keep admin, existing records and pricing untouched.
- Keep centralized browser-safe pricing and content modules separate from visual sections so factual rules remain testable.
- The booking form saves an inquiry row (anon insert-only) before opening WhatsApp, and saving must never block WhatsApp; investment forms only compose WhatsApp. Never imply a message was sent automatically.
- Missing seasonal rates must yield on-request quotes rather than fabricated rates; calculate Easter dates each year.
- Photo cards reveal details through both pointer hover and accessible toggle controls so mobile users can reach the same content.
- Downloaded photos are referenced through asset pointers; owner-supplied real photos replace every placeholder or illustrative image for the subject they show, and only genuinely generic photography carries the illustrative label.

## Admin panel
- /admin is a client-only (ssr: false) layout gated in beforeLoad by an admin row in user_roles; the login page lives at admin_.login.tsx so it is not nested under the gate.
- Admin pages read and write through the browser client under RLS (has_role admin); public sign-up is disabled and the owner account gets the admin role via a trigger on auth.users matched by email.
- Guest records are created or updated by a database trigger when a booking becomes confirmed (match by email or digits-only phone); balance_due is a generated column.
- Booking documents live in the private `documents` storage bucket (admin-only RLS) and are shared only via time-limited signed URLs. The Domina delega (holder = owner from settings, delegates = travelers) is built with pdf-lib from `src/lib/delega.ts` inside the `ensureDelega` server function and regenerated when its fingerprint changes; header/signature/travel attachments live at fixed paths in the private `templates` bucket.
- Personal-use and host-collaboration rules (zero price, host required, hosts.total_owed) are enforced by database triggers, not only the form.
- Revenue split (owner share / FDS) lives in generated booking columns fed by snapshot columns set by a trigger; the app only displays them, and dashboard maths lives in `src/lib/finance.ts` (expenses paid by the owner reduce the owner's net, never FDS).
- Booking.com iCal import runs from a managed 5-minute HTTP schedule on /api/public/jobs/ical-sync, on admin open (rate-limited 1/min) and live before saving date-blocking statuses; all share `syncBookingIcal`.
- Options (status `option`) expire by timestamp: public/export queries ignore expired ones and a trigger cancels overlapping expired options on save (no polling cron).
- `contacts` is the single deduplicated address book (email or E.164 phone, via `upsert_contact`); triggers link inquiries, bookings and guests to it, and traveler birth dates generate `occasions`.
- Multi-room: `rooms` is the room catalogue (public column-level SELECT for anon, admin-only sensitive fields); bookings, availability_blocks and inquiries carry room_id, the no-overlap constraint is per room, each room has its own export token, and per-room unit/holder override settings in the delega. `ROOMS` in site-data mirrors it for the public site.
