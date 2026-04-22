import { Plus } from "lucide-react";

import SidebarHeader from "@/components/molecules/SidebarHeader";
import SidebarNav from "@/components/molecules/SidebarNav";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-border bg-white">
      <SidebarHeader />

      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
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
