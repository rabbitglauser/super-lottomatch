import type { Metadata } from "next";

import PublicLegalPageTemplate from "@/components/templates/PublicLegalPageTemplate";
import { impressumContent } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Impressum | SuperLottoMatch",
  description:
    "Impressum der Demo-Anwendung SuperLottoMatch / STV Events.",
};

export default function ImpressumPage() {
  return <PublicLegalPageTemplate content={impressumContent} />;
}
