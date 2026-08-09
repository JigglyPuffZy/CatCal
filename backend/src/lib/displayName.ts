/** True when stored name is just the email prefix (Supabase trigger artifact). */
export function isEmailDerivedName(
  fullName: string | null | undefined,
  email: string
): boolean {
  const name = fullName?.trim();
  if (!name) return true;
  if (name.includes("@")) return true;
  if (name.toLowerCase() === email.toLowerCase()) return true;
  const localPart = email.split("@")[0]?.toLowerCase();
  return Boolean(localPart && name.toLowerCase() === localPart);
}

export function resolveRegisteredName(
  fullName: string | null | undefined,
  email: string
): string {
  if (isEmailDerivedName(fullName, email)) return "";
  return fullName!.trim();
}
