import type { Metadata } from "next";

import PublicRafflePage from "@/components/organisms/PublicRafflePage";

export const metadata: Metadata = {
  title: "Preise | Lottomatch",
  description: "Übersicht aller Preise der diesjährigen Lottomatch-Verlosung.",
};

export default function RafflePage() {
  return <PublicRafflePage />;
}
