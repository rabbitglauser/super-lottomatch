import type { Metadata } from "next";

import DesktopPrizeManagementPage from "@/components/organisms/DesktopPrizeManagementPage";

export const metadata: Metadata = {
  title: "Preise | STV Event Manager",
};

export default function PrizesPage() {
  return <DesktopPrizeManagementPage />;
}
