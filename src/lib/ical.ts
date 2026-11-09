// Pure iCal helpers (browser- and worker-safe). Dates are "YYYY-MM-DD"; end dates are exclusive.
export type IcalEvent = { uid: string; start: string; end: string };

const toKey = (v: string) => { const m = /^(\d{4})(\d{2})(\d{2})/.exec(v.trim()); return m ? `${m[1]}-${m[2]}-${m[3]}` : null; };
const addDay = (k: string) => { const d = new Date(`${k}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };

/** Parses VEVENTs (all-day or timed) into date ranges. Events without a valid UID/start are skipped. */
export function parseIcal(text: string): IcalEvent[] {
  const lines = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
  const out: IcalEvent[] = [];
  let cur: Partial<IcalEvent> | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") { cur = {}; continue; }
    if (line === "END:VEVENT") {
      if (cur?.uid && cur.start) { const end = cur.end && cur.end > cur.start ? cur.end : addDay(cur.start); out.push({ uid: cur.uid, start: cur.start, end }); }
      cur = null; continue;
    }
    if (!cur) continue;
    const i = line.indexOf(":"); if (i < 0) continue;
    const name = line.slice(0, i).split(";")[0]!.toUpperCase(), value = line.slice(i + 1);
    if (name === "UID") cur.uid = value.trim().slice(0, 500);
    else if (name === "DTSTART") { const k = toKey(value); if (k) cur.start = k; }
    else if (name === "DTEND") { const k = toKey(value); if (k) cur.end = k; }
  }
  return out;
}

const stamp = (k: string) => k.replace(/-/g, "");
/** Builds an export calendar with only generic "Occupato" events: no personal data. */
export function buildIcal(events: IcalEvent[], now = new Date()): string {
  const dt = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const body = events.flatMap(e => ["BEGIN:VEVENT", `UID:${e.uid}@oasidelfaraone.it`, `DTSTAMP:${dt}`, `DTSTART;VALUE=DATE:${stamp(e.start)}`, `DTEND;VALUE=DATE:${stamp(e.end)}`, "SUMMARY:Occupato", "END:VEVENT"]);
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Oasi del Faraone//Calendario//IT", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...body, "END:VCALENDAR", ""].join("\r\n");
}

/** Overlap between an imported range and a direct booking ([start,end) semantics). */
export const rangesOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) => aStart < bEnd && aEnd > bStart;

export const SYNC_MIN_INTERVAL_MS = 60_000;
/** Rate limit for on-open syncs: at most one call per minute. */
export const isSyncStale = (lastAttempt: string | null | undefined, now: Date) =>
  !lastAttempt || now.getTime() - Date.parse(lastAttempt) >= SYNC_MIN_INTERVAL_MS;

/** A confirmed direct booking must be closed manually on Booking.com until "Fatto" is pressed. */
export const needsBookingClosure = (b: { status: string; channel: string; ota_closed_at: string | null; check_out: string; is_personal_use?: boolean }, today: string) =>
  (b.status === "confirmed" || b.status === "option" || b.status === "host_collab" || b.status === "personal") && b.channel !== "booking" && !b.ota_closed_at && b.check_out >= today;
