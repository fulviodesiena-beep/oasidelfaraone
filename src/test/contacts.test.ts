import { describe, expect, it } from "vitest";
import { MINA_WHATSAPP, OWNER_WHATSAPP, wa } from "@/lib/site-data";

describe("WhatsApp contacts", () => {
  it("routes Mina inquiries to his Egyptian number", () => {
    expect(wa(MINA_WHATSAPP, "Ciao Mina")).toBe("https://wa.me/201501202025?text=Ciao%20Mina");
  });
  it("keeps Fulvio's contact unchanged", () => {
    expect(OWNER_WHATSAPP).toBe("393347328158");
  });
});