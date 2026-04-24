import type { Metadata } from "next";

import DesktopEventCreatePage from "@/components/organisms/DesktopEventCreatePage";

export const metadata: Metadata = {
  title: "Event erstellen | STV Event Manager",
};

export default function EventsPage() {
  return <DesktopEventCreatePage />;
}
