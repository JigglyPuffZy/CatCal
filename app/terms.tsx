import { LegalDocumentScreen } from "../screens/LegalDocumentScreen";
import { TERMS_OF_SERVICE } from "../constants/legal";

export default function TermsRoute() {
  return (
    <LegalDocumentScreen title="Terms of Service" sections={TERMS_OF_SERVICE} />
  );
}
