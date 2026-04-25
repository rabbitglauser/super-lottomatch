export type CheckInStatus = "checked-in" | "pending";

export type AvatarTone = "rose" | "amber" | "blue" | "peach";

export interface CheckInGuest {
  id: string;
  name: string;
  email: string;
  code: string;
  initials: string;
  avatarTone: AvatarTone;
  city: string;
  status: CheckInStatus;
  checkedInAt?: string;
}

export interface CheckInStats {
  totalGuests: number;
  checkedIn: number;
  pending: number;
}

export const CHECKIN_GUESTS: CheckInGuest[] = [
  {
    id: "g-001",
    name: "Anna Müller",
    email: "anna.mueller@example.ch",
    code: "L-2410-A1",
    initials: "AM",
    avatarTone: "rose",
    city: "Ennetbürgen",
    status: "checked-in",
    checkedInAt: "09:14",
  },
  {
    id: "g-002",
    name: "Beat Hofstetter",
    email: "beat.hofstetter@example.ch",
    code: "L-2410-B2",
    initials: "BH",
    avatarTone: "amber",
    city: "Stans",
    status: "checked-in",
    checkedInAt: "09:22",
  },
  {
    id: "g-003",
    name: "Carla Zumstein",
    email: "carla.zumstein@example.ch",
    code: "L-2410-C3",
    initials: "CZ",
    avatarTone: "blue",
    city: "Buochs",
    status: "pending",
  },
  {
    id: "g-004",
    name: "Daniel Imhof",
    email: "daniel.imhof@example.ch",
    code: "L-2410-D4",
    initials: "DI",
    avatarTone: "peach",
    city: "Beckenried",
    status: "checked-in",
    checkedInAt: "09:31",
  },
  {
    id: "g-005",
    name: "Eveline Käslin",
    email: "eveline.kaeslin@example.ch",
    code: "L-2410-E5",
    initials: "EK",
    avatarTone: "rose",
    city: "Hergiswil",
    status: "pending",
  },
  {
    id: "g-006",
    name: "Felix Niederberger",
    email: "felix.niederberger@example.ch",
    code: "L-2410-F6",
    initials: "FN",
    avatarTone: "amber",
    city: "Stansstad",
    status: "checked-in",
    checkedInAt: "09:48",
  },
  {
    id: "g-007",
    name: "Gabriela Odermatt",
    email: "gabriela.odermatt@example.ch",
    code: "L-2410-G7",
    initials: "GO",
    avatarTone: "blue",
    city: "Emmetten",
    status: "pending",
  },
  {
    id: "g-008",
    name: "Hans Wyrsch",
    email: "hans.wyrsch@example.ch",
    code: "L-2410-H8",
    initials: "HW",
    avatarTone: "peach",
    city: "Wolfenschiessen",
    status: "checked-in",
    checkedInAt: "10:02",
  },
];

export const CHECKIN_STATS: CheckInStats = {
  totalGuests: 30,
  checkedIn: CHECKIN_GUESTS.filter((g) => g.status === "checked-in").length,
  pending: CHECKIN_GUESTS.filter((g) => g.status === "pending").length,
};
