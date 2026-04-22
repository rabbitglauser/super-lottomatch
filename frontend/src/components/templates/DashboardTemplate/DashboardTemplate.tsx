import type { ReactNode } from "react";

import TopNavbar from "@/components/organisms/TopNavbar/TopNavbar";
import Sidebar from "@/components/organisms/Sidebar/Sidebar";

interface DashboardTemplateProps {
  children: ReactNode;
}

export default function DashboardTemplate({
  children,
}: DashboardTemplateProps) {
  return (
    <div className="flex h-screen flex-col">
      <TopNavbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
