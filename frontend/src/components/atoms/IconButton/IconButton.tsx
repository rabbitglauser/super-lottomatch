"use client";

import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface IconButtonProps {
  icon: LucideIcon;
  ariaLabel: string;
  onClick?: () => void;
}

export default function IconButton({
  icon: Icon,
  ariaLabel,
  onClick,
}: IconButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={ariaLabel}
      onClick={onClick}
      className="text-gray-600 hover:text-gray-900"
    >
      <Icon className="size-5" />
    </Button>
  );
}
