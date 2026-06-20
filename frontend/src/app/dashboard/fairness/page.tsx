import type { Metadata } from "next";

import DesktopFairnessPage from "@/components/organisms/DesktopFairnessPage";

export const metadata: Metadata = {
  title: "Fairness | STV Event Manager",
};

export default function FairnessPage() {
  return <DesktopFairnessPage />;
}
