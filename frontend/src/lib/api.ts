import { API_BASE_URL } from "@/lib/api-config";

const APP_TIME_ZONE = "Europe/Zurich";

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

async function getSupabase() {
  const { supabase } = await import("@/lib/supabase");
  return supabase;
}

function shouldUseHttpApi() {
  if (!API_BASE_URL) {
    return false;
  }

  if (typeof window === "undefined") {
    return true;
  }

  const isPublicHost = !["localhost", "127.0.0.1"].includes(window.location.hostname);
  const isLocalApi = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(API_BASE_URL);

  return !(isPublicHost && isLocalApi);
}

function assertSupabaseOk(error: unknown) {
  if (error) {
    throw error;
  }
}

function relationOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function initials(firstName: string, lastName: string) {
  return `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`.toUpperCase();
}

function avatarTone(value: string | number): AvatarTone {
  const numericValue = typeof value === "number" ? value : Number(value);
  return ["rose", "amber", "blue", "peach"][numericValue % 4] as AvatarTone;
}

function toDate(value: string | null | undefined) {
  return value ? new Date(value) : null;
}

function formatDate(value: string | null | undefined) {
  const date = toDate(value);

  if (!date) {
    return "Noch keine Teilnahme";
  }

  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

function formatTime(value: string | null | undefined) {
  const date = toDate(value);

  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

function formatChf(value: number | string | null | undefined) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "CHF -";
  }

  return `CHF ${new Intl.NumberFormat("de-CH", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function monthLabel(value: string) {
  const month = new Date(value).getUTCMonth();
  return ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"][month];
}

function latestBy<T>(items: T[], getValue: (item: T) => string | null | undefined) {
  return items.reduce<string | null>((latestValue, item) => {
    const value = getValue(item);

    if (!value) {
      return latestValue;
    }

    if (!latestValue || new Date(value) > new Date(latestValue)) {
      return value;
    }

    return latestValue;
  }, null);
}

function roundPercent(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
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

interface LottoEventRow {
  id: number;
  name: string;
  event_year: number;
  location: string | null;
  start_date: string;
  end_date: string;
}

interface EventDayRow {
  id: number;
  event_id: number;
  day_number: number;
  event_date: string;
  checkin_open_at: string | null;
  checkin_close_at: string | null;
}

interface CheckinRow {
  id: number;
  event_day_id: number;
  guest_id: number;
  method: string;
  checked_in_at: string;
}

interface GuestRow {
  id: number;
  guest_code: string;
  first_name: string;
  last_name: string;
  email: string | null;
  allow_email_marketing: boolean;
  allow_post_marketing: boolean;
  created_at: string;
  addresses?: { city: string } | { city: string }[] | null;
  checkins?: { checked_in_at: string }[] | null;
}

interface PrizeRow {
  id: number;
  event_day_id: number;
  title: string;
  description: string | null;
  value_chf: number | string | null;
}

interface DrawRow {
  id: number;
  prize_id: number;
}

async function getLatestEvent() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("lotto_events")
    .select("id, name, event_year, location, start_date, end_date")
    .order("event_year", { ascending: false })
    .order("start_date", { ascending: false })
    .limit(1)
    .single<LottoEventRow>();

  assertSupabaseOk(error);

  if (!data) {
    throw new Error("No Lottomatch event found");
  }

  return data;
}

async function getEventDays(eventId: number) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("event_days")
    .select("id, event_id, day_number, event_date, checkin_open_at, checkin_close_at")
    .eq("event_id", eventId)
    .order("day_number", { ascending: true })
    .returns<EventDayRow[]>();

  assertSupabaseOk(error);
  return data ?? [];
}

async function getLatestEventDay(eventId: number) {
  const days = await getEventDays(eventId);
  const latestDay = [...days].sort((left, right) => right.day_number - left.day_number)[0];

  if (!latestDay) {
    throw new Error("No event day found");
  }

  return latestDay;
}

async function getGuestRows() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("guests")
    .select(
      "id, guest_code, first_name, last_name, email, allow_email_marketing, allow_post_marketing, created_at, addresses(city), checkins(checked_in_at)",
    )
    .is("deleted_at", null)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .returns<GuestRow[]>();

  assertSupabaseOk(error);
  return data ?? [];
}

async function fetchCheckinsByEventDayIds(eventDayIds: number[]) {
  if (eventDayIds.length === 0) {
    return [];
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("checkins")
    .select("id, event_day_id, guest_id, method, checked_in_at")
    .in("event_day_id", eventDayIds)
    .returns<CheckinRow[]>();

  assertSupabaseOk(error);
  return data ?? [];
}

async function fetchAllCheckins() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("checkins")
    .select("id, event_day_id, guest_id, method, checked_in_at")
    .returns<CheckinRow[]>();

  assertSupabaseOk(error);
  return data ?? [];
}

function mapGuestRecord(row: GuestRow): GuestRecord {
  const address = relationOne(row.addresses);
  const lastParticipation = latestBy(row.checkins ?? [], (checkin) => checkin.checked_in_at);

  return {
    id: String(row.id),
    name: `${row.first_name} ${row.last_name}`,
    email: row.email || "Keine E-Mail hinterlegt",
    code: row.guest_code,
    city: address?.city ?? "-",
    lastParticipation: formatDate(lastParticipation),
    marketingActive: row.allow_email_marketing || row.allow_post_marketing,
    initials: initials(row.first_name, row.last_name),
    avatarTone: avatarTone(row.id),
  };
}

async function fetchDashboardDataFromSupabase(): Promise<DashboardData> {
  const supabase = await getSupabase();
  const event = await getLatestEvent();
  const eventDays = await getEventDays(event.id);
  const activeDay = [...eventDays].sort((left, right) => right.day_number - left.day_number)[0];
  const currentCheckins = await fetchCheckinsByEventDayIds(eventDays.map((day) => day.id));
  const { count: totalGuests, error: totalGuestsError } = await supabase
    .from("guests")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null);

  assertSupabaseOk(totalGuestsError);

  const previousEventResult = await supabase
    .from("lotto_events")
    .select("id")
    .eq("event_year", event.event_year - 1)
    .maybeSingle<{ id: number }>();

  assertSupabaseOk(previousEventResult.error);

  const previousEventDays = previousEventResult.data
    ? await getEventDays(previousEventResult.data.id)
    : [];
  const previousCheckins = await fetchCheckinsByEventDayIds(
    previousEventDays.map((day) => day.id),
  );
  const currentEventGuestCount = new Set(currentCheckins.map((checkin) => checkin.guest_id)).size;
  const previousEventGuestCount = new Set(previousCheckins.map((checkin) => checkin.guest_id)).size;
  const delta = previousEventGuestCount
    ? Math.round(
        ((currentEventGuestCount - previousEventGuestCount) / previousEventGuestCount) *
          100,
      )
    : 0;
  const activeDayCheckins = activeDay
    ? currentCheckins.filter((checkin) => checkin.event_day_id === activeDay.id).length
    : 0;

  return {
    stats: [
      {
        variant: "delta",
        label: "Total Gäste",
        value: String(totalGuests ?? 0),
        delta: `${delta >= 0 ? "+" : ""}${delta}%`,
      },
      {
        variant: "progress",
        label: "Heutige Check-ins",
        value: String(activeDayCheckins),
        progress: roundPercent(activeDayCheckins, totalGuests ?? 0),
      },
      {
        variant: "status",
        label: "Aktueller Status",
        value: event.name,
        subtitle: event.location || "Veranstaltungsort offen",
      },
    ],
    eventDays: eventDays.map((day) => {
      const checkinCount = currentCheckins.filter(
        (checkin) => checkin.event_day_id === day.id,
      ).length;

      return {
        id: String(day.id),
        month: monthLabel(day.event_date),
        day: day.event_date.slice(-2),
        title: `${event.name} - Tag ${day.day_number}`,
        time: `${formatTime(day.checkin_open_at) ?? "--:--"} - ${
          formatTime(day.checkin_close_at) ?? "--:--"
        }`,
        guests: checkinCount,
        active: day.id === activeDay?.id,
      };
    }),
    liveUpdate: {
      label: "Live Update",
      message: activeDay
        ? `${event.name}: ${activeDayCheckins} Gäste für Tag ${activeDay.day_number} eingecheckt.`
        : `${event.name}: Noch kein Event-Tag angelegt.`,
    },
    location: {
      label: "Veranstaltungsort",
      locationLabel: event.location || "Mehrzweckhalle Ennetbürgen",
      coordinates: { lat: 46.9842, lng: 8.4109 },
    },
  };
}

async function fetchGuestsFromSupabase(): Promise<GuestRecord[]> {
  const guests = await getGuestRows();
  return guests.map(mapGuestRecord);
}

async function toggleGuestMarketingInSupabase(guestId: string) {
  const supabase = await getSupabase();
  const { data: currentGuest, error: readError } = await supabase
    .from("guests")
    .select("id, allow_email_marketing, allow_post_marketing")
    .eq("id", guestId)
    .single<{
      id: number;
      allow_email_marketing: boolean;
      allow_post_marketing: boolean;
    }>();

  assertSupabaseOk(readError);

  if (!currentGuest) {
    throw new Error("Guest not found");
  }

  const nextValue = !(
    currentGuest.allow_email_marketing || currentGuest.allow_post_marketing
  );
  const { data, error } = await supabase
    .from("guests")
    .update({
      allow_email_marketing: nextValue,
      allow_post_marketing: nextValue,
    })
    .eq("id", guestId)
    .select("id, allow_email_marketing, allow_post_marketing")
    .single<{
      id: number;
      allow_email_marketing: boolean;
      allow_post_marketing: boolean;
    }>();

  assertSupabaseOk(error);

  if (!data) {
    throw new Error("Guest could not be updated");
  }

  return {
    id: String(data.id),
    marketingActive: data.allow_email_marketing || data.allow_post_marketing,
  };
}

async function fetchCheckInsFromSupabase(): Promise<CheckInData> {
  const event = await getLatestEvent();
  const day = await getLatestEventDay(event.id);
  const [guests, checkins] = await Promise.all([
    getGuestRows(),
    fetchCheckinsByEventDayIds([day.id]),
  ]);
  const checkinByGuestId = new Map(checkins.map((checkin) => [checkin.guest_id, checkin]));
  const mappedGuests: CheckInGuest[] = guests.map((guest) => {
    const address = relationOne(guest.addresses);
    const checkin = checkinByGuestId.get(guest.id);
    const checkedInAt = formatTime(checkin?.checked_in_at);

    return {
      id: String(guest.id),
      name: `${guest.first_name} ${guest.last_name}`,
      email: guest.email || "Keine E-Mail hinterlegt",
      initials: initials(guest.first_name, guest.last_name),
      ticket: guest.guest_code,
      group: address?.city ?? "-",
      code: guest.guest_code,
      city: address?.city ?? "-",
      status: checkin ? "checked-in" : "expected",
      checkedInAt,
      time: checkedInAt,
      avatarTone: avatarTone(guest.id),
    };
  });
  const checkedIn = mappedGuests.filter((guest) => guest.status === "checked-in").length;

  return {
    eventDayId: String(day.id),
    summary: {
      total: mappedGuests.length,
      checkedIn,
      expected: mappedGuests.length - checkedIn,
      noShow: 0,
    },
    guests: mappedGuests,
  };
}

async function createCheckInInSupabase(guestId: string) {
  const supabase = await getSupabase();
  const event = await getLatestEvent();
  const day = await getLatestEventDay(event.id);
  const { data: existingCheckin, error: existingError } = await supabase
    .from("checkins")
    .select("id, checked_in_at")
    .eq("event_day_id", day.id)
    .eq("guest_id", guestId)
    .maybeSingle<{ id: number; checked_in_at: string }>();

  assertSupabaseOk(existingError);

  if (existingCheckin) {
    return {
      id: String(existingCheckin.id),
      checkedInAt: formatTime(existingCheckin.checked_in_at) ?? "",
    };
  }

  const { data, error } = await supabase
    .from("checkins")
    .insert({
      event_day_id: day.id,
      guest_id: Number(guestId),
      method: "manual_form",
      is_new_guest: false,
      created_by_user_id: 1,
    })
    .select("id, checked_in_at")
    .single<{ id: number; checked_in_at: string }>();

  assertSupabaseOk(error);

  if (!data) {
    throw new Error("Check-in could not be created");
  }

  return {
    id: String(data.id),
    checkedInAt: formatTime(data.checked_in_at) ?? "",
  };
}

function prizeCategory(title: string, description: string | null): PrizeCategory {
  const value = `${title} ${description ?? ""}`.toLowerCase();

  if (value.includes("hauptpreis") || value.includes("reise") || value.includes("e-bike")) {
    return "Hauptpreis";
  }

  if (value.includes("sport")) {
    return "Sport";
  }

  if (value.includes("gutschein") || value.includes("ticket") || value.includes("eintritt")) {
    return "Gutschein";
  }

  if (value.includes("kaffee") || value.includes("brunch") || value.includes("korb")) {
    return "Genuss";
  }

  return "Sachpreis";
}

async function fetchPrizesFromSupabase(): Promise<PrizeData> {
  const supabase = await getSupabase();
  const event = await getLatestEvent();
  const eventDays = await getEventDays(event.id);
  const eventDayIds = eventDays.map((day) => day.id);
  const [{ data: prizeRows, error: prizesError }, { data: drawRows, error: drawsError }] =
    await Promise.all([
      supabase
        .from("prizes")
        .select("id, event_day_id, title, description, value_chf")
        .in("event_day_id", eventDayIds)
        .order("event_day_id", { ascending: true })
        .order("id", { ascending: true })
        .returns<PrizeRow[]>(),
      supabase.from("draws").select("id, prize_id").returns<DrawRow[]>(),
    ]);

  assertSupabaseOk(prizesError);
  assertSupabaseOk(drawsError);

  const drawnPrizeIds = new Set((drawRows ?? []).map((draw) => draw.prize_id));
  const prizes: PrizeRecord[] = (prizeRows ?? []).map((prize) => ({
    id: String(prize.id),
    name: prize.title,
    description: prize.description || "Keine Beschreibung hinterlegt.",
    category: prizeCategory(prize.title, prize.description),
    sponsor: "STV Ennetbürgen",
    value: formatChf(prize.value_chf),
    status: drawnPrizeIds.has(prize.id) ? "Reserviert" : "Bereit",
  }));
  const drawn = prizes.filter((prize) => prize.status === "Reserviert").length;
  const mainPrizes = prizes.filter((prize) => prize.category === "Hauptpreis").length;
  const progress = roundPercent(drawn, prizes.length);
  const totalValue = (prizeRows ?? []).reduce((sum, prize) => sum + Number(prize.value_chf ?? 0), 0);

  return {
    kpis: [
      {
        label: "Total Preise",
        value: String(prizes.length),
        subtitle: "aus Datenbank",
        subtitleTone: "accent",
      },
      {
        label: "Gesamtwert",
        value: formatChf(totalValue),
        subtitle: "erfasst",
        subtitleTone: "accent",
      },
      {
        label: "Hauptpreise",
        value: String(mainPrizes),
        subtitle: "Top-Kategorie",
        subtitleTone: "muted",
      },
      {
        label: "Ausgelost",
        value: String(drawn),
        subtitle: `${progress}%`,
        subtitleTone: "accent",
        progress,
      },
    ],
    overview: {
      currentEvent: event.name,
      nextDraw: "Nächste Verlosung",
      date: formatDate(event.end_date),
      time: "17:00",
      drawn,
      total: prizes.length,
    },
    nextHighlight: prizes[0] ?? null,
    prizes,
  };
}

async function fetchAnalyticsFromSupabase(): Promise<AnalyticsData> {
  const supabase = await getSupabase();
  const [
    guests,
    checkins,
    { data: eventDays, error: eventDaysError },
    { data: events, error: eventsError },
    { data: draws, error: drawsError },
  ] = await Promise.all([
    getGuestRows(),
    fetchAllCheckins(),
    supabase
      .from("event_days")
      .select("id, event_id, day_number, event_date, checkin_open_at, checkin_close_at")
      .returns<EventDayRow[]>(),
    supabase
      .from("lotto_events")
      .select("id, name, event_year, location, start_date, end_date")
      .returns<LottoEventRow[]>(),
    supabase.from("draws").select("id, prize_id").returns<DrawRow[]>(),
  ]);

  assertSupabaseOk(eventDaysError);
  assertSupabaseOk(eventsError);
  assertSupabaseOk(drawsError);

  const totalGuests = guests.length;
  const totalEventDays = eventDays?.length ?? 0;
  const checkInRate = totalGuests && totalEventDays
    ? roundPercent(checkins.length, totalGuests * totalEventDays)
    : 0;
  const participantBuckets = new Map<string, number>();

  guests.forEach((guest) => {
    const month = new Intl.DateTimeFormat("de-CH", {
      month: "short",
      timeZone: APP_TIME_ZONE,
    }).format(new Date(guest.created_at));
    participantBuckets.set(month, (participantBuckets.get(month) ?? 0) + 1);
  });

  const methodTotal = checkins.length || 1;
  const qrTotal = checkins.filter((checkin) => checkin.method === "qr_code").length;
  const manualTotal = checkins.filter((checkin) =>
    ["manual_form", "guest_code"].includes(checkin.method),
  ).length;
  const otherTotal = methodTotal - qrTotal - manualTotal;
  const eventDaysByEventId = new Map<number, EventDayRow[]>();

  (eventDays ?? []).forEach((day) => {
    eventDaysByEventId.set(day.event_id, [
      ...(eventDaysByEventId.get(day.event_id) ?? []),
      day,
    ]);
  });

  const checkinsByDay = (eventDays ?? [])
    .sort((left, right) => left.event_date.localeCompare(right.event_date))
    .map((day) => ({
      label: `Tag ${day.day_number}`,
      value: checkins.filter((checkin) => checkin.event_day_id === day.id).length,
    }));
  const topEvents = (events ?? [])
    .sort((left, right) => right.event_year - left.event_year)
    .map((event) => {
      const days = eventDaysByEventId.get(event.id) ?? [];
      const dayIds = new Set(days.map((day) => day.id));
      const eventCheckins = checkins.filter((checkin) => dayIds.has(checkin.event_day_id));
      const distinctGuests = new Set(eventCheckins.map((checkin) => checkin.guest_id)).size;

      return {
        name: event.name,
        date: formatDate(event.start_date),
        guests: distinctGuests,
        checkIns: eventCheckins.length,
        conversion: distinctGuests
          ? Math.round((eventCheckins.length / distinctGuests) * 1000) / 10
          : 0,
        status: "Abgeschlossen" as const,
      };
    });
  const granted = guests.filter(
    (guest) => guest.allow_email_marketing || guest.allow_post_marketing,
  ).length;
  const grantedPercentage = roundPercent(granted, totalGuests);
  const rejected = totalGuests - granted;
  const rejectedPercentage = totalGuests ? 100 - grantedPercentage : 0;

  return {
    summary: {
      totalGuests,
      checkInRate,
      activeEvents: events?.length ?? 0,
      completedDrawings: draws?.length ?? 0,
    },
    participantTrend: Array.from(participantBuckets.entries()).map(
      ([month, participants]) => ({ month, participants }),
    ),
    deviceDistribution: [
      { key: "mobile", label: "QR-Code", value: roundPercent(qrTotal, methodTotal) },
      { key: "desktop", label: "Manuell", value: roundPercent(manualTotal, methodTotal) },
      { key: "tablet", label: "Andere", value: roundPercent(otherTotal, methodTotal) },
    ],
    checkinsByDay,
    topEvents,
    liveOverview: [
      { key: "visitors", label: "Gäste gesamt", value: totalGuests },
      { key: "devices", label: "Event-Tage", value: totalEventDays },
      { key: "scans", label: "Check-ins", value: checkins.length },
    ],
    marketingConsent: {
      totalGuests,
      grantedPercentage,
      grantedCount: granted,
      breakdown: [
        {
          key: "granted",
          label: "Eingewilligt",
          percentage: grantedPercentage,
          count: granted,
        },
        { key: "pending", label: "Ausstehend", percentage: 0, count: 0 },
        {
          key: "rejected",
          label: "Abgelehnt",
          percentage: rejectedPercentage,
          count: rejected,
        },
      ],
    },
    analyticsPeriods: [{ label: "Datenbank gesamt", value: "all" }],
    reportActions: [
      { key: "csv", label: "CSV herunterladen" },
      { key: "pdf", label: "PDF Report" },
      { key: "share", label: "Dashboard teilen" },
    ],
  };
}

export function fetchDashboardData() {
  return shouldUseHttpApi()
    ? apiFetch<DashboardData>("/dashboard")
    : fetchDashboardDataFromSupabase();
}

export function fetchGuests() {
  return shouldUseHttpApi() ? apiFetch<GuestRecord[]>("/guests") : fetchGuestsFromSupabase();
}

export function toggleGuestMarketing(guestId: string) {
  return shouldUseHttpApi()
    ? apiFetch<{ id: string; marketingActive: boolean }>(
        `/guests/${guestId}/marketing`,
        { method: "PATCH" },
      )
    : toggleGuestMarketingInSupabase(guestId);
}

export function fetchCheckIns() {
  return shouldUseHttpApi()
    ? apiFetch<CheckInData>("/check-ins")
    : fetchCheckInsFromSupabase();
}

export function createCheckIn(guestId: string) {
  return shouldUseHttpApi()
    ? apiFetch<{ id: string; checkedInAt: string }>(`/check-ins/${guestId}`, {
        method: "POST",
      })
    : createCheckInInSupabase(guestId);
}

export function fetchPrizes() {
  return shouldUseHttpApi() ? apiFetch<PrizeData>("/prizes") : fetchPrizesFromSupabase();
}

export function fetchAnalytics() {
  return shouldUseHttpApi()
    ? apiFetch<AnalyticsData>("/analytics")
    : fetchAnalyticsFromSupabase();
}
