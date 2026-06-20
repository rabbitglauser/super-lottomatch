import type { Metadata } from "next";

import DesktopSupportAssistantPage from "@/components/organisms/DesktopSupportAssistantPage";

export const metadata: Metadata = {
  title: "Support | STV Event Manager",
};

export default function SupportPage() {
  return <DesktopSupportAssistantPage />;
}
