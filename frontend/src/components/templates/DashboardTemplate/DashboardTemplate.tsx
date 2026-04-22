import type { ReactNode } from "react";

import TopNavbar from "@/components/organisms/TopNavbar/TopNavbar";

interface DashboardTemplateProps {
  children: ReactNode;
}

export default function DashboardTemplate({
  children,
}: DashboardTemplateProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNavbar />
      {children}
    </div>
  );
}
