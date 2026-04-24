import type { Metadata } from "next";

import DesktopGuestManagementPage from "@/components/organisms/DesktopGuestManagementPage";

export const metadata: Metadata = {
  title: "Gästeverwaltung | STV Event Manager",
};

export default function GuestsPage() {
  return <DesktopGuestManagementPage />;
}
