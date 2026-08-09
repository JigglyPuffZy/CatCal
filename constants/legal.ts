export type LegalSection = {
  title: string;
  body: string;
};

export const TERMS_OF_SERVICE: LegalSection[] = [
  {
    title: "1. Acceptance of Terms",
    body: "By creating an account or using CatCal, you agree to these Terms of Service. If you do not agree, please do not use the app.",
  },
  {
    title: "2. About CatCal",
    body: "CatCal is a mobile application that helps cat owners estimate daily calorie needs and recommended food portions based on general veterinary nutritional guidelines. You are responsible for preparing and feeding your cat manually. CatCal does not dispense food automatically and does not use RFID, IoT devices, or AI image recognition.",
  },
  {
    title: "3. Not Veterinary Advice",
    body: "CatCal provides informational estimates only. It is not a substitute for professional veterinary advice, diagnosis, or treatment. Always consult a licensed veterinarian for your cat's health, diet changes, weight concerns, or medical conditions.",
  },
  {
    title: "4. Your Account",
    body: "You must provide accurate registration information and keep your login credentials secure. You are responsible for all activity under your account. Notify us immediately if you suspect unauthorized access.",
  },
  {
    title: "5. Cat Profiles & QR Codes",
    body: "Each cat profile may include a unique QR code for identification and quick access within the app. QR codes are for convenience only and do not replace proper identification, veterinary records, or microchipping where required by law.",
  },
  {
    title: "6. Acceptable Use",
    body: "You agree not to misuse CatCal, attempt to access other users' data, reverse engineer the app, upload harmful content, or use the service for unlawful purposes.",
  },
  {
    title: "7. Data & Availability",
    body: "We aim to keep CatCal available and accurate, but we do not guarantee uninterrupted service or that calculations will always meet every cat's individual needs. Features may change as the app is updated.",
  },
  {
    title: "8. Limitation of Liability",
    body: "To the fullest extent permitted by law, CatCal and its developers are not liable for feeding decisions, health outcomes, data loss, or indirect damages arising from use of the app.",
  },
  {
    title: "9. Changes to Terms",
    body: "We may update these Terms from time to time. Continued use of CatCal after changes means you accept the updated Terms.",
  },
  {
    title: "10. Contact",
    body: "For questions about these Terms, contact us at support@catcal.app.",
  },
];

export const PRIVACY_POLICY: LegalSection[] = [
  {
    title: "1. Introduction",
    body: "This Privacy Policy explains how CatCal collects, uses, and protects your information when you use our mobile application.",
  },
  {
    title: "2. Information We Collect",
    body: "We may collect account information (name, email, password), cat profile data (name, age, weight, sex, activity level, health condition, photos), feeding logs, weight history, schedule preferences, and notification settings. QR code identifiers are generated for each cat profile you create.",
  },
  {
    title: "3. How We Use Information",
    body: "We use your data to provide calorie and portion estimates, save cat profiles, display feeding history, send optional reminders, and improve app functionality. We do not sell your personal information.",
  },
  {
    title: "4. Camera & QR Scanning",
    body: "If you use QR scanning, camera access is used only to read QR codes within the app. CatCal does not use AI image recognition to analyze cat photos for medical or feeding decisions.",
  },
  {
    title: "5. Data Storage & Security",
    body: "Your data is stored securely using industry-standard practices. While we take reasonable measures to protect information, no system is completely secure.",
  },
  {
    title: "6. Sharing of Information",
    body: "We do not share your personal data with third parties except when required by law, to protect rights and safety, or to operate essential services such as authentication and cloud hosting.",
  },
  {
    title: "7. Your Choices",
    body: "You may update or delete cat profiles, adjust notification settings, and request account deletion. You can disable reminders at any time in the app settings.",
  },
  {
    title: "8. Children's Privacy",
    body: "CatCal is not intended for users under 13 years of age. We do not knowingly collect personal information from children.",
  },
  {
    title: "9. Policy Updates",
    body: "We may revise this Privacy Policy periodically. We will update the effective date when changes are made. Continued use of the app means you accept the updated policy.",
  },
  {
    title: "10. Contact Us",
    body: "For privacy questions or data requests, contact us at privacy@catcal.app.",
  },
];

export const LEGAL_EFFECTIVE_DATE = "July 31, 2026";
