// Gmail API sender for the delega (server-only). OAuth with a refresh token saved in Cloud → Secrets:
// GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN (scope https://www.googleapis.com/auth/gmail.send),
// issued for prenotazionisharm@gmail.com. No app password, nothing in the browser.
const env = (k: string) => process.env[k]?.trim() ?? "";

export const GMAIL_SECRETS = ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET", "GMAIL_REFRESH_TOKEN"] as const;
export const hasGmail = () => GMAIL_SECRETS.every(k => env(k));

async function accessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env("GMAIL_CLIENT_ID"), client_secret: env("GMAIL_CLIENT_SECRET"), refresh_token: env("GMAIL_REFRESH_TOKEN"), grant_type: "refresh_token" }),
  });
  const json = (await res.json().catch(() => ({}))) as { access_token?: string; error?: string; error_description?: string };
  if (!res.ok || !json.access_token) throw new Error(`Gmail: autorizzazione non riuscita (${json.error_description || json.error || res.status}). Rigenera il refresh token.`);
  return json.access_token;
}

/** Sends a complete RFC 5322 message (see buildMime) through the media upload endpoint (messages up to 35 MB). */
export async function sendGmail(mime: string): Promise<string> {
  if (!hasGmail()) throw new Error(`Gmail non configurato: mancano ${GMAIL_SECRETS.filter(k => !env(k)).join(", ")} in Cloud → Secrets.`);
  const token = await accessToken();
  const res = await fetch("https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=media", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "message/rfc822" },
    body: mime,
  });
  const json = (await res.json().catch(() => ({}))) as { id?: string; error?: { message?: string } };
  if (!res.ok || !json.id) throw new Error(`Gmail: invio non riuscito (${json.error?.message || res.status}).`);
  return json.id;
}
