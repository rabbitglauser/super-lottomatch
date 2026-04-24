import type { Metadata } from "next";

import EventCreatePage from "@/components/organisms/EventCreatePage";

export const metadata: Metadata = {
  title: "Event erstellen | STV Event Manager",
};

export default function EventsPage() {
  return <EventCreatePage />;
}
