import type { Metadata } from "next";

import DesktopDuplicatesPage from "@/components/organisms/DesktopDuplicatesPage";

export const metadata: Metadata = {
  title: "Duplikate | STV Event Manager",
};

export default function DuplicatesPage() {
  return <DesktopDuplicatesPage />;
}
