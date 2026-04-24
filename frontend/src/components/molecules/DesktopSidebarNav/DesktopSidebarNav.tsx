"use client";

import NavItem from "@/components/atoms/NavItem";
import { NAV_ITEMS } from "@/lib/constants";

export default function DesktopSidebarNav() {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}
    </nav>
  );
}
