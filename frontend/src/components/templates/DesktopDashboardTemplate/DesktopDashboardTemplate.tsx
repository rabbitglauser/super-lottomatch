import type { ReactNode } from "react";

import DesktopTopNavbar from "@/components/organisms/DesktopTopNavbar";
import DesktopSidebar from "@/components/organisms/DesktopSidebar";

interface DashboardTemplateProps {
  children: ReactNode;
}

export default function DesktopDashboardTemplate({
  children,
}: DashboardTemplateProps) {
  return (
    <div className="flex h-screen flex-col">
      <DesktopTopNavbar />
      <div className="flex flex-1 overflow-hidden">
        <DesktopSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
