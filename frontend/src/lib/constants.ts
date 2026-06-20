import type { LucideIcon } from "lucide-react";
import {
  Copy,
  Database,
  Gift,
  LayoutDashboard,
  CalendarDays,
  MessageCircle,
  Scale,
  Settings,
  UserCheck,
  Users,
} from "lucide-react";

export { API_BASE_URL } from "@/lib/api-config";

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/events", icon: CalendarDays, label: "Events" },
  { href: "/dashboard/guests", icon: Users, label: "Guests" },
  { href: "/dashboard/check-in", icon: UserCheck, label: "Check-in" },
  { href: "/dashboard/prizes", icon: Gift, label: "Prizes" },
  { href: "/dashboard/duplicates", icon: Copy, label: "Duplikate" },
  { href: "/dashboard/fairness", icon: Scale, label: "Fairness" },
  { href: "/dashboard/support", icon: MessageCircle, label: "Support" },
  { href: "/dashboard/data", icon: Database, label: "Data" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];
