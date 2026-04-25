import type { Metadata } from "next";

import DesktopSettingsPage from "@/components/organisms/DesktopSettingsPage";

export const metadata: Metadata = {
  title: "Einstellungen | STV Event Manager",
};

export default function SettingsPage() {
  return <DesktopSettingsPage />;
}
