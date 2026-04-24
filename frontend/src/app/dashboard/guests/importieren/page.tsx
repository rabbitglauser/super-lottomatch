import type { Metadata } from "next";

import GuestImportPage from "@/components/organisms/GuestImportPage";

export const metadata: Metadata = {
  title: "Gäste importieren | STV Event Manager",
};

export default function GuestImportRoutePage() {
  return <GuestImportPage />;
}
