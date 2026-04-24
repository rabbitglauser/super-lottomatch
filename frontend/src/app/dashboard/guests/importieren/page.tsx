import type { Metadata } from "next";

import DesktopGuestImportPage from "@/components/organisms/DesktopGuestImportPage";

export const metadata: Metadata = {
  title: "Gäste importieren | STV Event Manager",
};

export default function GuestImportRoutePage() {
  return <DesktopGuestImportPage />;
}
