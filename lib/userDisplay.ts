/** Registered full name from signup — not email or email-prefix fallback. */
export function isEmailDerivedName(
  fullName?: string | null,
  email?: string
): boolean {
  const name = fullName?.trim();
  if (!name || !email) return !name;
  if (name.includes("@")) return true;
  if (name.toLowerCase() === email.toLowerCase()) return true;
  const localPart = email.split("@")[0]?.toLowerCase();
  return Boolean(localPart && name.toLowerCase() === localPart);
}

export function getRegisteredDisplayName(
  fullName?: string | null,
  email?: string
): string | null {
  if (isEmailDerivedName(fullName, email)) return null;
  const name = fullName!.trim();
  return formatDisplayName(name);
}

/** Title-case display for greetings, e.g. "ralph matthew" → "Ralph Matthew" */
export function formatDisplayName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
