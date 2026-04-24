import type { Metadata } from "next";

import PublicLegalPageTemplate from "@/components/templates/PublicLegalPageTemplate";
import { privacyContent } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Datenschutz | SuperLottoMatch",
  description:
    "Datenschutzhinweise der Demo-Anwendung SuperLottoMatch / STV Events.",
};

export default function DatenschutzPage() {
  return <PublicLegalPageTemplate content={privacyContent} />;
}
