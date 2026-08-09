export const REGISTRATION_STEPS = [
  "Cat info",
  "QR code",
  "Calorie plan",
  "Dashboard",
] as const;

export type RegistrationStep = (typeof REGISTRATION_STEPS)[number];
