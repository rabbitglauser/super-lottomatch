import type { Metadata } from "next";

import GuestManagementPage from "@/components/organisms/GuestManagementPage";

export const metadata: Metadata = {
  title: "Gästeverwaltung | STV Event Manager",
};

export default function GuestsPage() {
  return <GuestManagementPage />;
}
