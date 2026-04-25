import {
  Gift,
  Package,
  Star,
  Ticket,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type PrizeStatus = "Bereit" | "Offen" | "Reserviert";

export type PrizeCategory =
  | "Hauptpreis"
  | "Sport"
  | "Gutschein"
  | "Sachpreis"
  | "Genuss";

export interface PrizeRecord {
  id: string;
  name: string;
  description: string;
  category: PrizeCategory;
  sponsor: string;
  value: string;
  status: PrizeStatus;
  icon: LucideIcon;
}

export const PRIZES: PrizeRecord[] = [
  {
    id: "wellness-wochenende",
    name: "Wellness Wochenende",
    description: "2 Nächte für zwei Personen inkl. Frühstück",
    category: "Hauptpreis",
    sponsor: "Hotel Alpenblick",
    value: "CHF 1’200",
    status: "Bereit",
    icon: Trophy,
  },
  {
    id: "e-bike-gutschein",
    name: "E-Bike Gutschein",
    description: "Gutschein für E-Bike Zubehör und Service",
    category: "Sport",
    sponsor: "BikeHub Zug",
    value: "CHF 850",
    status: "Bereit",
    icon: Star,
  },
  {
    id: "restaurant-gutschein",
    name: "Restaurant Gutschein",
    description: "Abendessen für vier Personen",
    category: "Gutschein",
    sponsor: "Restaurant Seeblick",
    value: "CHF 300",
    status: "Offen",
    icon: Ticket,
  },
  {
    id: "kaffeemaschine",
    name: "Kaffeemaschine",
    description: "Premium Kaffeemaschine für Zuhause",
    category: "Sachpreis",
    sponsor: "Elektro Müller",
    value: "CHF 650",
    status: "Bereit",
    icon: Package,
  },
  {
    id: "weinpaket",
    name: "Weinpaket",
    description: "Auswahl regionaler Weine",
    category: "Genuss",
    sponsor: "Weingut Rigi",
    value: "CHF 180",
    status: "Reserviert",
    icon: Gift,
  },
];

export interface PrizeStat {
  label: string;
  value: string;
  caption?: string;
  captionTone?: "accent" | "muted";
  progress?: number;
}

export const PRIZE_STATS: PrizeStat[] = [
  {
    label: "Total Preise",
    value: "24",
    caption: "+4 neu",
    captionTone: "accent",
  },
  {
    label: "Gesamtwert",
    value: "CHF 8’450",
    caption: "geschätzt",
    captionTone: "muted",
  },
  {
    label: "Hauptpreise",
    value: "3",
    caption: "Top-Kategorie",
    captionTone: "muted",
  },
  {
    label: "Ausgelost",
    value: "12",
    progress: 50,
  },
];

export interface PrizeRaffleOverview {
  currentEvent: string;
  nextDraw: string;
  time: string;
  drawn: number;
  total: number;
}

export const PRIZE_RAFFLE_OVERVIEW: PrizeRaffleOverview = {
  currentEvent: "SuperLottomatch 2026",
  nextDraw: "Hauptverlosung",
  time: "25. Okt • 14:00",
  drawn: 12,
  total: 24,
};

export interface PrizeHighlight {
  title: string;
  prize: string;
  sponsor: string;
  value: string;
}

export const PRIZE_NEXT_HIGHLIGHT: PrizeHighlight = {
  title: "Nächster Hauptpreis",
  prize: "Wellness Wochenende",
  sponsor: "Hotel Alpenblick",
  value: "CHF 1’200",
};
