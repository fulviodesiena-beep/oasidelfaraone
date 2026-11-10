export const MIN_ADMIN_PASSWORD_LENGTH = 10;

/** Neutral message shown after any reset request, so it never reveals which emails exist. */
export const RESET_REQUEST_MESSAGE = "Se l’email è registrata riceverai un link per reimpostare la password.";

/** Returns an Italian error message, or null when the new password is acceptable. */
export function validateNewPassword(password: string, confirm: string): string | null {
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) return `La password deve avere almeno ${MIN_ADMIN_PASSWORD_LENGTH} caratteri.`;
  if (password !== confirm) return "Le due password non coincidono.";
  return null;
}

export function resetRedirectUrl(origin: string) {
  return `${origin}/admin/reset-password`;
}
