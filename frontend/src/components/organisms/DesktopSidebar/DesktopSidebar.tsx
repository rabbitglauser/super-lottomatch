import { Plus } from "lucide-react";

import DesktopSidebarHeader from "@/components/molecules/DesktopSidebarHeader";
import DesktopSidebarNav from "@/components/molecules/DesktopSidebarNav";
import { Button } from "@/components/ui/button";

export default function DesktopSidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-border bg-white">
      <DesktopSidebarHeader />

      <div className="flex-1 overflow-y-auto py-4">
        <DesktopSidebarNav />
      </div>

      <div className="p-4">
        <Button className="w-full bg-brand text-white hover:bg-brand/90">
          <Plus className="size-4" />
          New Event
        </Button>
      </div>
    </aside>
  );
}
