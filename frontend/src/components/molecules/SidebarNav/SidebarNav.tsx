"use client";

import {
  Database,
  Gift,
  LayoutDashboard,
  CalendarDays,
  Settings,
  UserCheck,
  Users,
} from "lucide-react";

import NavItem from "@/components/atoms/NavItem/NavItem";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/events", icon: CalendarDays, label: "Events" },
  { href: "/dashboard/guests", icon: Users, label: "Guests" },
  { href: "/dashboard/check-in", icon: UserCheck, label: "Check-in" },
  { href: "/dashboard/prizes", icon: Gift, label: "Prizes" },
  { href: "/dashboard/data", icon: Database, label: "Data" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function SidebarNav() {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}
    </nav>
  );
}
