import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DICTIONARIES, detectLanguage, LanguageProvider, languages, publicPath, translate } from "@/lib/i18n";
import { publicHead } from "@/lib/public-head";
import { Booking } from "@/components/site/Booking";
import { quote } from "@/lib/pricing";
import { APARTMENT_PHOTOS, VILLAGE_PHOTOS, ROOMS, EXTRAS, RESTAURANTS, SPOTS, ROOM_AMENITIES } from "@/lib/site-data";

const insert = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert }), rpc: () => Promise.resolve({ data: [], error: null }) } }));
import { saveInquiry } from "@/lib/inquiries";

describe("public languages", () => {
  it("has complete translations for every key and all room/photo content", () => {
    const keys = Object.keys(DICTIONARIES.it).sort();
    for (const language of languages) {
      expect(Object.keys(DICTIONARIES[language]).sort()).toEqual(keys);
      for (const key of keys) expect(DICTIONARIES[language][key]?.trim()).not.toBe("");
      const content = [...APARTMENT_PHOTOS, ...VILLAGE_PHOTOS].map(p => p.alt).concat(ROOMS.flatMap(r => [r.summary,r.story,r.ritual]), EXTRAS.flatMap(e=>[e.name,e.desc,e.photo]), RESTAURANTS.flatMap(r=>[r.tag,r.cuisine,r.desc]),SPOTS.flatMap(s=>[s.name,s.desc,s.photo]),ROOM_AMENITIES);
      for (const key of content) expect(DICTIONARIES[language]).toHaveProperty(key);
    }
    expect(translate("en", ROOMS[0]?.ritual ?? "")).toContain("#RisveglioDelloScarabeo");
    expect(translate("de", ROOMS[0]?.story ?? "")).toContain("Elisir d’Oriente");
  });
  it("detects supported browser languages with Italian fallback", () => {
    expect(detectLanguage(["de-AT","en"])).toBe("de");
    expect(detectLanguage(["en-US"])).toBe("en");
    expect(detectLanguage(["fr-FR"])).toBe("it");
    expect(detectLanguage([])).toBe("it");
  });
  it("sets self-canonicals and reciprocal hreflang plus Italian x-default", () => {
    for (const page of ["home","privacy"] as const) for (const language of languages) {
      const head = publicHead(language,page);
      expect(head.links.find(l=>l.rel==="canonical")?.href).toBe(`https://oasidelfaraone.it${publicPath(language,page)}`);
      expect(head.links.filter(l=>l.rel==="alternate").map(l=>["hrefLang" in l?l.hrefLang:"",l.href])).toEqual([
        ["it",`https://oasidelfaraone.it${publicPath("it",page)}`],
        ["en",`https://oasidelfaraone.it${publicPath("en",page)}`],
        ["de",`https://oasidelfaraone.it${publicPath("de",page)}`],
        ["x-default",`https://oasidelfaraone.it${publicPath("it",page)}`],
      ]);
    }
  });
  it("saves the language selected by the guest without changing price inputs", async () => {
    insert.mockClear();
    await saveInquiry({guest_name:"Language test",guest_email:"",guest_phone:"",check_in:"2027-05-10",check_out:"2027-05-13",adults:2,children:0,extras:[],message:"test",consent_privacy:true,consent_marketing:false,language:"de"});
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({language:"de",adults:2,children:0,check_in:"2027-05-10"}));
  });
  it("localizes the quote and WhatsApp message and passes English to the save", async () => {
    insert.mockClear();
    const popup = { opener: null, location: { href: "" } };
    vi.spyOn(window,"open").mockReturnValue(popup as unknown as Window);
    render(<LanguageProvider language="en"><Booking extras={[]} toggleExtra={()=>{}} /></LanguageProvider>);
    const now = new Date(); const m = new Date(now.getFullYear(), now.getMonth()+1, 1);
    const dayLabel = (d: number) => new Date(m.getFullYear(), m.getMonth(), d).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
    fireEvent.click(screen.getByLabelText("Next month"));
    fireEvent.click(screen.getByRole("button",{name:dayLabel(10)}));
    fireEvent.click(screen.getByRole("button",{name:dayLabel(13)}));
    fireEvent.click(screen.getByRole("button",{name:"Check availability"}));
    const q = quote(new Date(m.getFullYear(), m.getMonth(), 10), new Date(m.getFullYear(), m.getMonth(), 13));
    if (q.total !== null) expect(document.body.textContent).toContain(new Intl.NumberFormat("en-GB",{style:"currency",currency:"EUR"}).format(q.total));
    fireEvent.change(screen.getByLabelText("Full name"),{target:{value:"Test Guest"}});
    fireEvent.change(screen.getByLabelText("Email"),{target:{value:"test@example.invalid"}});
    fireEvent.change(screen.getByLabelText("Phone"),{target:{value:"+393331234567"}});
    fireEvent.click(screen.getByRole("checkbox",{name:/I have read the/}));
    fireEvent.submit(screen.getByRole("button",{name:"Request a booking"}).closest("form") as HTMLFormElement);
    await waitFor(()=>expect(insert).toHaveBeenCalledWith(expect.objectContaining({language:"en",message:expect.stringContaining("Stay inquiry — Oasi del Faraone")})));
    await waitFor(()=>expect(popup.location.href).toContain("https://wa.me/393347328158"));
    expect(decodeURIComponent(popup.location.href)).toContain("Final cleaning €40.00");
    vi.restoreAllMocks();
  });
});