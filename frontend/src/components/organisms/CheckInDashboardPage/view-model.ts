import type { CheckInGuest, CheckInSummary, GuestStatus } from "@/lib/api";

export type GuestFilter = "all" | GuestStatus;
export type GuestRecord = CheckInGuest;
export type OverviewSummary = CheckInSummary;

export const FILTER_OPTIONS: { value: GuestFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "checked-in", label: "Eingecheckt" },
  { value: "expected", label: "Erwartet" },
  { value: "no-show", label: "No-Show" },
];

export function getStatusCounts(guests: GuestRecord[]) {
  return guests.reduce(
    (accumulator, guest) => {
      accumulator[guest.status] += 1;
      return accumulator;
    },
    {
      "checked-in": 0,
      expected: 0,
      "no-show": 0,
    } as Record<GuestStatus, number>,
  );
}

export function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

export function formatRate(value: number) {
  return `${value.toFixed(1)}%`;
}

export function parseTimeToMinutes(value: string | null) {
  if (!value) {
    return -1;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatCurrentTime() {
  return new Intl.DateTimeFormat("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}
