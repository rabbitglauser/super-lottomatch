import {
  Dices,
  FileUp,
  Gift,
  type LucideIcon,
  Plus,
  QrCode,
  Ticket,
  UserPlus,
} from "lucide-react";

export interface DeltaStat {
  variant: "delta";
  label: string;
  value: string;
  delta: string;
}

export interface ProgressStat {
  variant: "progress";
  label: string;
  value: string;
  progress: number;
}

export interface StatusStat {
  variant: "status";
  label: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
}

export type DashboardStat = DeltaStat | ProgressStat | StatusStat;

export const STATS: DashboardStat[] = [
  {
    variant: "delta",
    label: "Total Gäste",
    value: "30",
    delta: "+12%",
  },
  {
    variant: "progress",
    label: "Heutige Check-ins",
    value: "19",
    progress: 65,
  },
  {
    variant: "status",
    label: "Aktueller Status",
    value: "SuperLottomatch",
    subtitle: "Bern Convention Hall",
    icon: Ticket,
  },
];

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  tone: "light" | "red";
}

export const QUICK_ACTIONS: QuickAction[] = [
  { label: "Gast hinzufügen", icon: UserPlus, tone: "light" },
  { label: "Gäste importieren", icon: FileUp, tone: "light" },
  { label: "Check-in öffnen", icon: QrCode, tone: "light" },
  { label: "Preis erstellen", icon: Gift, tone: "light" },
  { label: "Verlosung starten", icon: Dices, tone: "red" },
  { label: "Neues Event", icon: Plus, tone: "red" },
];

export interface EventDay {
  month: string;
  day: string;
  title: string;
  time: string;
  guests: number;
  active?: boolean;
}

export const EVENT_DAYS: EventDay[] = [
  {
    month: "OKT",
    day: "24",
    title: "Eröffnung & Aperó",
    time: "09:00 - 18:00",
    guests: 240,
    active: true,
  },
  {
    month: "OKT",
    day: "25",
    title: "Hauptverlosung",
    time: "14:00 - 22:00",
    guests: 850,
  },
  {
    month: "OKT",
    day: "26",
    title: "VIP Frühstück",
    time: "08:00 - 12:00",
    guests: 150,
  },
];

export const LIVE_UPDATE = {
  label: "Live Update",
  message: "Die Abendgala beginnt in 45 Minuten",
};

export const LOCATION = {
  label: "Veranstaltungsort",
  locationLabel: "Bern, Schweiz",
  summary: "Globale Vorschau mit Fokus auf den Veranstaltungsort.",
  address: ["Helvetiaplatz 4", "3005 Bern", "Schweiz"],
  coordinates: {
    lat: 46.948,
    lng: 7.4474,
  },
};
