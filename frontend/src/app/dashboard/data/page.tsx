import type { Metadata } from "next";

import DesktopDataAnalyticsPage from "@/components/organisms/DesktopDataAnalyticsPage";

export const metadata: Metadata = {
  title: "Daten & Auswertungen | STV Event Manager",
};

export default function DataPage() {
  return <DesktopDataAnalyticsPage />;
}
