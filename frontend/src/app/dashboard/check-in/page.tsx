import type { Metadata } from "next";

import CheckInDashboardPage from "@/components/organisms/CheckInDashboardPage";

export const metadata: Metadata = {
  title: "Check-in | STV Event Manager",
};

export default function CheckInPage() {
  return <CheckInDashboardPage />;
}
