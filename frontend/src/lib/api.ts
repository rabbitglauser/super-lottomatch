import { GuestExportCsvBuilder, GUEST_EXPORT_FILENAME } from "@/lib/api/guest-export";
import { runtimeApiClient } from "@/lib/api/http-client";
import { HAS_EXPLICIT_API_BASE_URL, HAS_SUPABASE_MODE } from "@/lib/api-config";

const APP_TIME_ZONE = "Europe/Zurich";
const guestExportCsvBuilder = new GuestExportCsvBuilder();
let hasLoggedCheckInMode = false;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return runtimeApiClient.json<T>(path, options);
}

async function getSupabase() {
  const { supabase } = await import("@/lib/supabase");
  return supabase;
}

function shouldUseHttpApi() {
  return runtimeApiClient.shouldUseHttpApi();
}

function shouldUseBackendApiForCheckIns() {
  const useBackendApi = !HAS_SUPABASE_MODE && HAS_EXPLICIT_API_BASE_URL;

  if (process.env.NODE_ENV !== "production" && !hasLoggedCheckInMode) {
    console.info(useBackendApi ? "Using backend API mode" : "Using Supabase mode");
    hasLoggedCheckInMode = true;
  }

  return useBackendApi;
}

function assertCheckInDataSourceConfigured() {
  if (!HAS_SUPABASE_MODE && !HAS_EXPLICIT_API_BASE_URL) {
    throw new Error(
      "Check-in data source is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or set NEXT_PUBLIC_API_BASE_URL/NEXT_PUBLIC_API_URL.",
    );
  }
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

export interface GuestRegistrationInput {
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  phone?: string;
  email?: string;
  allowEmailMarketing?: boolean;
  allowPostMarketing?: boolean;
  notes?: string;
}

export interface RegisteredGuest {
  id: string;
  guestCode: string;
  name: string;
}

export interface EventCreateInput {
  name: string;
  year: number;
  location?: string;
  days: { date: string }[];
}

export interface CreatedEvent {
  id: string;
  name: string;
  year: number;
  dayCount: number;
}

export interface MobileGuestSearchResult {
  id: string;
  name: string;
  code: string;
  address: string;
  status: "checked-in" | "expected";
  checkedInAt: string | null;
}

export interface MobileCheckInResult {
  status: "checked-in" | "already-checked-in";
  id: string;
  checkedInAt: string | null;
  guest: MobileGuestSearchResult;
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
  eventDayId: number;
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

interface AddressRow {
  city: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
}

interface GuestRow {
  id: number;
  guest_code: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  allow_email_marketing: boolean;
  allow_post_marketing: boolean;
  notes: string | null;
  created_at: string;
  addresses?: AddressRow | AddressRow[] | null;
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

interface PublicPrizeRow {
  id: number;
  event_day_id: number;
  title: string;
  description: string | null;
  value_chf: number | string | null;
  winner_count: number | null;
  eligibility: string | null;
}

export type PrizeEligibility = "all" | "checked_in";

const ELIGIBILITY_LABELS: Record<PrizeEligibility, string> = {
  all: "Alle registrierten Gäste",
  checked_in: "Nur eingecheckte Gäste",
};

function eligibilityLabel(value: string | null): string {
  return ELIGIBILITY_LABELS[(value as PrizeEligibility) ?? "checked_in"] ??
    ELIGIBILITY_LABELS.checked_in;
}

export interface PrizeConfigInput {
  eventDayId: number;
  title: string;
  description?: string;
  valueChf?: number;
  winnerCount: number;
  eligibility: PrizeEligibility;
}

export interface PrizeConfigResult {
  id: string;
  eventDayId: number;
  title: string;
  description: string | null;
  valueChf: string;
  winnerCount: number;
  eligibility: PrizeEligibility;
}

export interface PublicPrize {
  id: string;
  name: string;
  description: string;
  category: PrizeCategory;
  value: string;
  winnerCount: number;
  eligibilityLabel: string;
}

export interface PublicRaffleData {
  eventName: string;
  prizes: PublicPrize[];
  totalWinners: number;
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
      "id, guest_code, first_name, last_name, phone, email, allow_email_marketing, allow_post_marketing, notes, created_at, addresses(city, street, house_number, postal_code), checkins(checked_in_at)",
    )
    .is("deleted_at", null)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .returns<GuestRow[]>();

  assertSupabaseOk(error);
  return data ?? [];
}

function cleanOptional(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function generateClientGuestCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `G-${timestamp}-${suffix}`;
}

function normalizeScannedGuestCode(value: string) {
  const cleaned = value.trim();

  if (!cleaned) {
    return "";
  }

  try {
    const url = new URL(cleaned);
    const queryCode = url.searchParams.get("code");

    if (queryCode) {
      return queryCode.trim().toUpperCase();
    }

    const pathCode = url.pathname.split("/").filter(Boolean).pop();
    if (pathCode) {
      return pathCode.trim().toUpperCase();
    }
  } catch {
    // Raw guest codes are expected for generated QR values.
  }

  return cleaned.toUpperCase();
}

function addressLabel(address: AddressRow | null) {
  if (!address) {
    return "-";
  }

  const street = [address.street, address.house_number].filter(Boolean).join(" ");
  const city = [address.postal_code, address.city].filter(Boolean).join(" ");

  return [street, city].filter(Boolean).join(", ") || address.city || "-";
}

function mapMobileGuestSearchResult(
  guest: GuestRow,
  activeCheckin: CheckinRow | undefined,
): MobileGuestSearchResult {
  const address = relationOne(guest.addresses);

  return {
    id: String(guest.id),
    name: `${guest.first_name} ${guest.last_name}`,
    code: guest.guest_code,
    address: addressLabel(address),
    status: activeCheckin ? "checked-in" : "expected",
    checkedInAt: formatTime(activeCheckin?.checked_in_at),
  };
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

async function fetchGuestExportFromHttp() {
  return {
    blob: await runtimeApiClient.blob("/guests/export"),
    filename: GUEST_EXPORT_FILENAME,
  };
}

async function fetchGuestExportFromSupabase() {
  const rows = await getGuestRows();

  return {
    blob: new Blob([guestExportCsvBuilder.build(rows)], {
      type: "text/csv;charset=utf-8",
    }),
    filename: GUEST_EXPORT_FILENAME,
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

async function createGuestInSupabase(
  input: GuestRegistrationInput,
): Promise<RegisteredGuest> {
  const supabase = await getSupabase();
  const addressPayload = {
    street: input.street.trim(),
    house_number: input.houseNumber.trim(),
    postal_code: input.postalCode.trim(),
    city: input.city.trim(),
  };
  const { data: address, error: addressError } = await supabase
    .from("addresses")
    .upsert(addressPayload, {
      onConflict: "street,house_number,postal_code,city",
    })
    .select("id")
    .single<{ id: number }>();

  assertSupabaseOk(addressError);

  if (!address) {
    throw new Error("Address could not be saved");
  }

  const guestCode = generateClientGuestCode();
  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .insert({
      guest_code: guestCode,
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      address_id: address.id,
      phone: cleanOptional(input.phone),
      email: cleanOptional(input.email),
      allow_email_marketing: input.allowEmailMarketing ?? false,
      allow_post_marketing: input.allowPostMarketing ?? true,
      notes: cleanOptional(input.notes),
    })
    .select("id, guest_code, first_name, last_name")
    .single<{
      id: number;
      guest_code: string;
      first_name: string;
      last_name: string;
    }>();

  assertSupabaseOk(guestError);

  if (!guest) {
    throw new Error("Guest could not be saved");
  }

  return {
    id: String(guest.id),
    guestCode: guest.guest_code,
    name: `${guest.first_name} ${guest.last_name}`,
  };
}

async function deleteGuestInSupabase(guestId: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("guests")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", guestId);

  assertSupabaseOk(error);
}

async function deletePrizeInSupabase(prizeId: string): Promise<void> {
  const supabase = await getSupabase();
  // A prize may be referenced by a draw (FK). Remove the draw first.
  const { error: drawError } = await supabase
    .from("draws")
    .delete()
    .eq("prize_id", prizeId);

  assertSupabaseOk(drawError);

  const { error } = await supabase.from("prizes").delete().eq("id", prizeId);

  assertSupabaseOk(error);
}

async function createEventInSupabase(
  input: EventCreateInput,
): Promise<CreatedEvent> {
  const sortedDates = input.days
    .map((day) => day.date)
    .filter((date) => Boolean(date))
    .sort();

  if (sortedDates.length === 0) {
    throw new Error("Mindestens ein Event-Tag mit Datum ist erforderlich.");
  }

  const supabase = await getSupabase();
  const { data: event, error: eventError } = await supabase
    .from("lotto_events")
    .insert({
      name: input.name.trim(),
      event_year: input.year,
      location: cleanOptional(input.location),
      start_date: sortedDates[0],
      end_date: sortedDates[sortedDates.length - 1],
    })
    .select("id, name, event_year")
    .single<{ id: number; name: string; event_year: number }>();

  assertSupabaseOk(eventError);

  if (!event) {
    throw new Error("Event could not be created");
  }

  const dayRows = sortedDates.map((date, index) => ({
    event_id: event.id,
    day_number: index + 1,
    event_date: date,
  }));

  const { error: daysError } = await supabase
    .from("event_days")
    .insert(dayRows);

  assertSupabaseOk(daysError);

  return {
    id: String(event.id),
    name: event.name,
    year: event.event_year,
    dayCount: dayRows.length,
  };
}

async function searchMobileGuestsInSupabase(
  query: string,
): Promise<MobileGuestSearchResult[]> {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length < 2) {
    return [];
  }

  const event = await getLatestEvent();
  const day = await getLatestEventDay(event.id);
  const [guests, checkins] = await Promise.all([
    getGuestRows(),
    fetchCheckinsByEventDayIds([day.id]),
  ]);
  const checkinByGuestId = new Map(checkins.map((checkin) => [checkin.guest_id, checkin]));

  return guests
    .filter((guest) => {
      const address = relationOne(guest.addresses);
      const haystack = [
        guest.guest_code,
        guest.first_name,
        guest.last_name,
        `${guest.first_name} ${guest.last_name}`,
        guest.email ?? "",
        addressLabel(address),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    })
    .slice(0, 8)
    .map((guest) =>
      mapMobileGuestSearchResult(guest, checkinByGuestId.get(guest.id)),
    );
}

async function checkInByCodeInSupabase(
  rawCode: string,
  method: "qr_code" | "guest_code" | "manual_form" = "qr_code",
): Promise<MobileCheckInResult> {
  const code = normalizeScannedGuestCode(rawCode);

  if (!code) {
    throw new Error("Guest code is required");
  }

  const supabase = await getSupabase();
  const event = await getLatestEvent();
  const day = await getLatestEventDay(event.id);
  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select(
      "id, guest_code, first_name, last_name, email, allow_email_marketing, allow_post_marketing, created_at, addresses(city, street, house_number, postal_code)",
    )
    .ilike("guest_code", code)
    .is("deleted_at", null)
    .maybeSingle<GuestRow>();

  assertSupabaseOk(guestError);

  if (!guest) {
    throw new Error("Guest code not found");
  }

  const { data: existingCheckin, error: existingError } = await supabase
    .from("checkins")
    .select("id, event_day_id, guest_id, method, checked_in_at")
    .eq("event_day_id", day.id)
    .eq("guest_id", guest.id)
    .maybeSingle<CheckinRow>();

  assertSupabaseOk(existingError);

  if (existingCheckin) {
    return {
      status: "already-checked-in",
      id: String(existingCheckin.id),
      checkedInAt: formatTime(existingCheckin.checked_in_at),
      guest: mapMobileGuestSearchResult(guest, existingCheckin),
    };
  }

  const { data: checkin, error: checkinError } = await supabase
    .from("checkins")
    .insert({
      event_day_id: day.id,
      guest_id: guest.id,
      method,
      is_new_guest: false,
      created_by_user_id: 1,
    })
    .select("id, event_day_id, guest_id, method, checked_in_at")
    .single<CheckinRow>();

  assertSupabaseOk(checkinError);

  if (!checkin) {
    throw new Error("Check-in could not be created");
  }

  return {
    status: "checked-in",
    id: String(checkin.id),
    checkedInAt: formatTime(checkin.checked_in_at),
    guest: mapMobileGuestSearchResult(guest, checkin),
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
    eventDayId: prize.event_day_id,
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

export function fetchGuestExport() {
  return shouldUseHttpApi()
    ? fetchGuestExportFromHttp()
    : fetchGuestExportFromSupabase();
}

export function toggleGuestMarketing(guestId: string) {
  return shouldUseHttpApi()
    ? apiFetch<{ id: string; marketingActive: boolean }>(
        `/guests/${guestId}/marketing`,
        { method: "PATCH" },
      )
    : toggleGuestMarketingInSupabase(guestId);
}

export function createGuest(input: GuestRegistrationInput) {
  return shouldUseHttpApi()
    ? apiFetch<RegisteredGuest>("/guests", {
        method: "POST",
        body: JSON.stringify(input),
      })
    : createGuestInSupabase(input);
}

export function deleteGuest(guestId: string) {
  return shouldUseHttpApi()
    ? apiFetch<void>(`/guests/${guestId}`, { method: "DELETE" })
    : deleteGuestInSupabase(guestId);
}

export function deletePrize(prizeId: string) {
  return shouldUseHttpApi()
    ? apiFetch<void>(`/prizes/${prizeId}`, { method: "DELETE" })
    : deletePrizeInSupabase(prizeId);
}

export function createEvent(input: EventCreateInput) {
  return shouldUseHttpApi()
    ? apiFetch<CreatedEvent>("/events", {
        method: "POST",
        body: JSON.stringify(input),
      })
    : createEventInSupabase(input);
}

export function searchMobileGuests(query: string) {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return Promise.resolve<MobileGuestSearchResult[]>([]);
  }

  return shouldUseHttpApi()
    ? apiFetch<MobileGuestSearchResult[]>(
        `/guests/search?q=${encodeURIComponent(normalizedQuery)}`,
      )
    : searchMobileGuestsInSupabase(normalizedQuery);
}

export function fetchCheckIns() {
  assertCheckInDataSourceConfigured();

  return shouldUseBackendApiForCheckIns()
    ? apiFetch<CheckInData>("/check-ins")
    : fetchCheckInsFromSupabase();
}

export function checkInByCode(
  code: string,
  method: "qr_code" | "guest_code" | "manual_form" = "qr_code",
) {
  assertCheckInDataSourceConfigured();

  return shouldUseBackendApiForCheckIns()
    ? apiFetch<MobileCheckInResult>("/check-ins/by-code", {
        method: "POST",
        body: JSON.stringify({ code, method }),
      })
    : checkInByCodeInSupabase(code, method);
}

export function createCheckIn(guestId: string) {
  assertCheckInDataSourceConfigured();

  return shouldUseBackendApiForCheckIns()
    ? apiFetch<{ id: string; checkedInAt: string }>(`/check-ins/${guestId}`, {
        method: "POST",
      })
    : createCheckInInSupabase(guestId);
}

async function fetchPublicRaffleFromSupabase(): Promise<PublicRaffleData> {
  const supabase = await getSupabase();
  const event = await getLatestEvent();
  const eventDays = await getEventDays(event.id);
  const eventDayIds = eventDays.map((day) => day.id);
  const { data: prizeRows, error } = await supabase
    .from("prizes")
    .select(
      "id, event_day_id, title, description, value_chf, winner_count, eligibility",
    )
    .in("event_day_id", eventDayIds)
    .order("event_day_id", { ascending: true })
    .order("id", { ascending: true })
    .returns<PublicPrizeRow[]>();

  assertSupabaseOk(error);

  const prizes: PublicPrize[] = (prizeRows ?? []).map((prize) => ({
    id: String(prize.id),
    name: prize.title,
    description: prize.description || "Keine Beschreibung hinterlegt.",
    category: prizeCategory(prize.title, prize.description),
    value: formatChf(prize.value_chf),
    winnerCount: prize.winner_count ?? 1,
    eligibilityLabel: eligibilityLabel(prize.eligibility),
  }));
  const totalWinners = prizes.reduce((sum, prize) => sum + prize.winnerCount, 0);

  return { eventName: event.name, prizes, totalWinners };
}

async function savePrizeConfigInSupabase(
  input: PrizeConfigInput,
  prizeId?: string,
): Promise<PrizeConfigResult> {
  const supabase = await getSupabase();
  const payload = {
    event_day_id: input.eventDayId,
    title: input.title.trim(),
    description: cleanOptional(input.description),
    value_chf: input.valueChf ?? 0,
    winner_count: input.winnerCount,
    eligibility: input.eligibility,
  };
  const builder = prizeId
    ? supabase.from("prizes").update(payload).eq("id", prizeId)
    : supabase.from("prizes").insert(payload);
  const { data, error } = await builder
    .select(
      "id, event_day_id, title, description, value_chf, winner_count, eligibility",
    )
    .single<PublicPrizeRow>();

  assertSupabaseOk(error);

  if (!data) {
    throw new Error("Preis konnte nicht gespeichert werden");
  }

  return {
    id: String(data.id),
    eventDayId: data.event_day_id,
    title: data.title,
    description: data.description,
    valueChf: String(data.value_chf ?? 0),
    winnerCount: data.winner_count ?? 1,
    eligibility: (data.eligibility as PrizeEligibility) ?? "checked_in",
  };
}

export function fetchPublicRaffle() {
  return shouldUseHttpApi()
    ? apiFetch<PublicRaffleData>("/prizes/public")
    : fetchPublicRaffleFromSupabase();
}

export function createPrizeConfig(input: PrizeConfigInput) {
  return shouldUseHttpApi()
    ? apiFetch<PrizeConfigResult>("/prizes", {
        method: "POST",
        body: JSON.stringify(input),
      })
    : savePrizeConfigInSupabase(input);
}

export function updatePrizeConfig(prizeId: string, input: PrizeConfigInput) {
  return shouldUseHttpApi()
    ? apiFetch<PrizeConfigResult>(`/prizes/${prizeId}`, {
        method: "PUT",
        body: JSON.stringify(input),
      })
    : savePrizeConfigInSupabase(input, prizeId);
}

export function fetchPrizes() {
  return shouldUseHttpApi() ? apiFetch<PrizeData>("/prizes") : fetchPrizesFromSupabase();
}

export function fetchAnalytics() {
  return shouldUseHttpApi()
    ? apiFetch<AnalyticsData>("/analytics")
    : fetchAnalyticsFromSupabase();
}

export interface DuplicateGuestRef {
  id: string;
  name: string;
  email: string | null;
  city: string | null;
}

export interface DuplicatePair {
  left: DuplicateGuestRef;
  right: DuplicateGuestRef;
  confidence: number;
  reasons: string[];
}

export interface DuplicatesData {
  pairs: DuplicatePair[];
}

export interface AiSettings {
  enrichmentEnabled: boolean;
  draftingEnabled: boolean;
  model: string;
  sharedFields: string[];
}

export interface EnrichmentSuggestion {
  organization: string | null;
  country: string | null;
  confidence: number;
}

export interface EnrichmentResult {
  guestId: string;
  enabled: boolean;
  sharedWithModel: string[];
  suggestion: EnrichmentSuggestion | null;
  message?: string | null;
}

export interface FairnessGroup {
  group: string;
  expectedShare: number;
  observedShare: number;
  deviation: number;
  flagged: boolean;
}

export interface FairnessData {
  fairnessScore: number;
  runs: number;
  winnerCount: number;
  participantCount: number;
  groups: FairnessGroup[];
  edgeCases: string[];
  recommendations: string[];
}

export interface SupportDraftResult {
  enabled: boolean;
  draft: string | null;
  source: string;
  auditId?: string | null;
  message?: string | null;
}

export interface SupportMessageInput {
  inquiry: string;
  finalText: string;
  source: "ai" | "edited" | "human";
  guestCode?: string;
}

export interface SupportMessageResult {
  id: string;
  source: string;
}

export function fetchDuplicates(threshold = 70) {
  return apiFetch<DuplicatesData>(`/guests/duplicates?threshold=${threshold}`);
}

export function fetchAiSettings() {
  return apiFetch<AiSettings>("/ai/settings");
}

export function enrichGuest(guestId: string, consent: boolean) {
  return apiFetch<EnrichmentResult>(`/guests/${guestId}/enrich`, {
    method: "POST",
    body: JSON.stringify({ consent }),
  });
}

export function fetchFairness(winnerCount: number, runs = 1000) {
  return apiFetch<FairnessData>(
    `/raffle/fairness?winnerCount=${winnerCount}&runs=${runs}`,
  );
}

export function draftSupportReply(inquiry: string, guestCode?: string) {
  return apiFetch<SupportDraftResult>("/support/draft", {
    method: "POST",
    body: JSON.stringify({ inquiry, guestCode }),
  });
}

export function recordSupportMessage(input: SupportMessageInput) {
  return apiFetch<SupportMessageResult>("/support/messages", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface LoginResult {
  id: string;
  name: string;
  email: string;
}

async function loginWithSupabase(email: string, password: string): Promise<LoginResult> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc("authenticate_user", {
    p_email: email,
    p_password: password,
  });

  assertSupabaseOk(error);

  const rows = data as Array<{ id: number; name: string; email: string }> | null;
  const user = rows?.[0];

  if (!user) {
    throw Object.assign(new Error("Ungültige Zugangsdaten"), { status: 401 });
  }

  return { id: String(user.id), name: user.name, email: user.email };
}

export function login(email: string, password: string): Promise<LoginResult> {
  if (HAS_SUPABASE_MODE) {
    return loginWithSupabase(email, password);
  }

  if (process.env.NODE_ENV === "production") {
    return Promise.reject(
      new Error(
        "Login ist nicht konfiguriert. Bitte NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel setzen.",
      ),
    );
  }

  if (!HAS_EXPLICIT_API_BASE_URL) {
    return Promise.reject(
      new Error(
        "Login ist nicht konfiguriert. Bitte NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY oder NEXT_PUBLIC_API_BASE_URL setzen.",
      ),
    );
  }

  return apiFetch<LoginResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
