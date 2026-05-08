const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type AvatarTone = "rose" | "amber" | "blue" | "peach";

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
}

export type DashboardStat = DeltaStat | ProgressStat | StatusStat;

export interface EventDay {
  id: string;
  month: string;
  day: string;
  title: string;
  time: string;
  guests: number;
  active?: boolean;
}

export interface LiveUpdate {
  label: string;
  message: string;
}

export interface LocationSummary {
  label: string;
  locationLabel: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface DashboardData {
  stats: DashboardStat[];
  eventDays: EventDay[];
  liveUpdate: LiveUpdate;
  location: LocationSummary;
}

export interface GuestRecord {
  id: string;
  name: string;
  email: string;
  code: string;
  city: string;
  lastParticipation: string;
  marketingActive: boolean;
  initials: string;
  avatarTone: AvatarTone;
}

export type GuestStatus = "checked-in" | "expected" | "no-show";

export interface CheckInGuest {
  id: string;
  name: string;
  email: string;
  initials: string;
  ticket: string;
  group: string;
  code: string;
  city: string;
  status: GuestStatus;
  checkedInAt: string | null;
  time: string | null;
  avatarTone: AvatarTone;
}

export interface CheckInSummary {
  total: number;
  checkedIn: number;
  expected: number;
  noShow: number;
}

export interface CheckInData {
  eventDayId: string;
  summary: CheckInSummary;
  guests: CheckInGuest[];
}

export type PrizeCategory =
  | "Hauptpreis"
  | "Sport"
  | "Gutschein"
  | "Sachpreis"
  | "Genuss";

export type PrizeStatus = "Bereit" | "Offen" | "Reserviert";

export interface PrizeRecord {
  id: string;
  name: string;
  description: string;
  category: PrizeCategory;
  sponsor: string;
  value: string;
  status: PrizeStatus;
}

export interface PrizeKpi {
  label: string;
  value: string;
  subtitle: string;
  subtitleTone: "accent" | "muted";
  progress?: number;
}

export interface PrizeOverview {
  currentEvent: string;
  nextDraw: string;
  date: string;
  time: string;
  drawn: number;
  total: number;
}

export interface PrizeData {
  kpis: PrizeKpi[];
  overview: PrizeOverview;
  nextHighlight: PrizeRecord | null;
  prizes: PrizeRecord[];
}

export interface AnalyticsSummary {
  totalGuests: number;
  checkInRate: number;
  activeEvents: number;
  completedDrawings: number;
}

export interface ParticipantTrendPoint {
  month: string;
  participants: number;
}

export interface DeviceDistributionItem {
  key: "desktop" | "mobile" | "tablet";
  label: string;
  value: number;
}

export interface CheckinsByDayItem {
  label: string;
  value: number;
}

export interface TopEvent {
  name: string;
  date: string;
  guests: number;
  checkIns: number;
  conversion: number;
  status: "Abgeschlossen";
}

export interface LiveOverviewItem {
  key: "visitors" | "devices" | "scans";
  label: string;
  value: number;
}

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

export interface AnalyticsData {
  summary: AnalyticsSummary;
  participantTrend: ParticipantTrendPoint[];
  deviceDistribution: DeviceDistributionItem[];
  checkinsByDay: CheckinsByDayItem[];
  topEvents: TopEvent[];
  liveOverview: LiveOverviewItem[];
  marketingConsent: MarketingConsentSummary;
  analyticsPeriods: { label: string; value: string }[];
  reportActions: { key: "csv" | "pdf" | "share"; label: string }[];
}

export function fetchDashboardData() {
  return apiFetch<DashboardData>("/dashboard");
}

export function fetchGuests() {
  return apiFetch<GuestRecord[]>("/guests");
}

export function toggleGuestMarketing(guestId: string) {
  return apiFetch<{ id: string; marketingActive: boolean }>(
    `/guests/${guestId}/marketing`,
    { method: "PATCH" },
  );
}

export function fetchCheckIns() {
  return apiFetch<CheckInData>("/check-ins");
}

export function createCheckIn(guestId: string) {
  return apiFetch<{ id: string; checkedInAt: string }>(`/check-ins/${guestId}`, {
    method: "POST",
  });
}

export function fetchPrizes() {
  return apiFetch<PrizeData>("/prizes");
}

export function fetchAnalytics() {
  return apiFetch<AnalyticsData>("/analytics");
}
