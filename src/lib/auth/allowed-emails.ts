const allowedEmails = (process.env.NEXT_PUBLIC_ALLOWED_LOGIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isEmailAllowed(email: string | null | undefined) {
  if (!email) return false;
  return allowedEmails.includes(email.toLowerCase());
}

export function hasAllowedEmailConfig() {
  return allowedEmails.length > 0;
}
