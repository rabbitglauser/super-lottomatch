export interface AnalyticsSummary {
  totalGuests: number;
  checkInRate: number;
  activeEvents: number;
  completedDrawings: number;
}

export const analyticsSummary: AnalyticsSummary = {
  totalGuests: 1284,
  checkInRate: 87,
  activeEvents: 6,
  completedDrawings: 14,
};

export interface ParticipantTrendPoint {
  month: string;
  participants: number;
}

export const participantTrend: ParticipantTrendPoint[] = [
  { month: "Jan", participants: 600 },
  { month: "Feb", participants: 720 },
  { month: "Mär", participants: 860 },
  { month: "Apr", participants: 1000 },
  { month: "Mai", participants: 1160 },
  { month: "Jun", participants: 1320 },
];

export interface DeviceDistributionItem {
  key: "desktop" | "mobile" | "tablet";
  label: string;
  value: number;
}

export const deviceDistribution: DeviceDistributionItem[] = [
  { key: "desktop", label: "Desktop", value: 48 },
  { key: "mobile", label: "Mobile", value: 42 },
  { key: "tablet", label: "Tablet", value: 10 },
];

export interface CheckinsByDayItem {
  label: string;
  value: number;
}

export const checkinsByDay: CheckinsByDayItem[] = [
  { label: "Tag 1", value: 420 },
  { label: "Tag 2", value: 680 },
  { label: "Tag 3", value: 950 },
  { label: "Tag 4", value: 610 },
  { label: "Tag 5", value: 430 },
];

export interface TopEvent {
  name: string;
  date: string;
  guests: number;
  checkIns: number;
  conversion: number;
  status: "Abgeschlossen";
}

export const topEvents: TopEvent[] = [
  {
    name: "SuperLottomatch",
    date: "31. Mai 2024",
    guests: 652,
    checkIns: 587,
    conversion: 34.2,
    status: "Abgeschlossen",
  },
  {
    name: "VIP Frühstück",
    date: "24. Mai 2024",
    guests: 286,
    checkIns: 245,
    conversion: 28.1,
    status: "Abgeschlossen",
  },
  {
    name: "Hauptverlosung",
    date: "17. Mai 2024",
    guests: 198,
    checkIns: 167,
    conversion: 31.6,
    status: "Abgeschlossen",
  },
  {
    name: "Frühlings-Event",
    date: "10. Mai 2024",
    guests: 148,
    checkIns: 126,
    conversion: 27.3,
    status: "Abgeschlossen",
  },
  {
    name: "Partner Anlass",
    date: "3. Mai 2024",
    guests: 92,
    checkIns: 74,
    conversion: 22.5,
    status: "Abgeschlossen",
  },
];

export interface LiveOverviewItem {
  key: "visitors" | "devices" | "scans";
  label: string;
  value: number;
}

export const liveOverview: LiveOverviewItem[] = [
  { key: "visitors", label: "Live Besucher", value: 124 },
  { key: "devices", label: "Aktive Geräte", value: 89 },
  { key: "scans", label: "QR Scans", value: 312 },
];

export interface MarketingConsentBreakdownItem {
  key: "granted" | "pending" | "rejected";
  label: string;
  percentage: number;
  count: number;
}

export interface MarketingConsentSummary {
  totalGuests: number;
  grantedPercentage: number;
  grantedCount: number;
  breakdown: MarketingConsentBreakdownItem[];
}

export const marketingConsent: MarketingConsentSummary = {
  totalGuests: 1284,
  grantedPercentage: 72,
  grantedCount: 923,
  breakdown: [
    { key: "granted", label: "Eingewilligt", percentage: 72, count: 923 },
    { key: "pending", label: "Ausstehend", percentage: 18, count: 231 },
    { key: "rejected", label: "Abgelehnt", percentage: 10, count: 130 },
  ],
};

export const analyticsPeriods = [
  { label: "Letzte 30 Tage", value: "last-30-days" },
];

export const reportActions = [
  { key: "csv", label: "CSV herunterladen" },
  { key: "pdf", label: "PDF Report" },
  { key: "share", label: "Dashboard teilen" },
] as const;
