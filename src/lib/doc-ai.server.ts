// Reads a passport / identity card photo and returns the traveler fields (server-only).
// Uses the Anthropic API with ANTHROPIC_API_KEY (Cloud → Secrets); model overridable with ANTHROPIC_MODEL.
// The result only PREFILLS the traveler: the admin confirms it with one click.
import { normaliseExtracted, type ExtractedDocument } from "./delega-flow";

export const hasDocumentAi = () => !!process.env["ANTHROPIC_API_KEY"]?.trim();
const MODEL = () => process.env["ANTHROPIC_MODEL"]?.trim() || "claude-sonnet-5-5";

const PROMPT = `Questa è la foto di un passaporto o di una carta d'identità.
Rispondi SOLO con un oggetto JSON, senza testo prima o dopo, con questi campi:
{"first_name": "...", "last_name": "...", "document_number": "...", "document_type": "passaporto" | "carta_identita", "birth_date": "AAAA-MM-GG" | null, "nationality": "..." | null, "confidence": "alta" | "media" | "bassa"}
Usa la zona MRZ quando c'è. Non inventare: se un campo non è leggibile usa null (o stringa vuota per i nomi) e confidence "bassa".`;

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function extractDocument(bytes: Uint8Array, contentType: string): Promise<ExtractedDocument | null> {
  const key = process.env["ANTHROPIC_API_KEY"]?.trim();
  if (!key) return null;
  let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const data = btoa(s);
  const source = contentType === "application/pdf"
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data } }
    : IMAGE_TYPES.has(contentType) ? { type: "image", source: { type: "base64", media_type: contentType, data } } : null;
  if (!source) return null; // HEIC and other formats: the admin types the data by hand.
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL(), max_tokens: 400, messages: [{ role: "user", content: [source, { type: "text", text: PROMPT }] }] }),
  });
  if (!res.ok) throw new Error(`Lettura documento non riuscita (${res.status})`);
  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = json.content?.find(c => c.type === "text")?.text ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return normaliseExtracted(JSON.parse(match[0])); } catch { return null; }
}
