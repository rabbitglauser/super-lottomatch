"use client";

import { Bell, ChevronDown, CircleUser } from "lucide-react";

import IconButton from "@/components/atoms/IconButton";
import { Button } from "@/components/ui/button";

export default function DesktopNavActions() {
  return (
    <div className="flex items-center gap-2">
      <Button className="bg-brand text-white hover:bg-brand/90">
        Import/Export
        <ChevronDown className="ml-1 size-4" />
      </Button>

      <IconButton icon={Bell} ariaLabel="Benachrichtigungen" />
      <IconButton icon={CircleUser} ariaLabel="Profil" />
    </div>
  );
}
