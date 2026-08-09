import { LegalDocumentScreen } from "../screens/LegalDocumentScreen";
import { PRIVACY_POLICY } from "../constants/legal";

export default function PrivacyPolicyRoute() {
  return (
    <LegalDocumentScreen title="Privacy Policy" sections={PRIVACY_POLICY} />
  );
}
