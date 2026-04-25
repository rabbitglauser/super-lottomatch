"use client";

import {
  useDeferredValue,
  useState,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  MoreVertical,
  QrCode,
  Search,
  Settings,
  SlidersHorizontal,
  UserX,
  Users,
} from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

import ProgressBar from "@/components/atoms/ProgressBar";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

type GuestStatus = "checked-in" | "expected" | "no-show";
type GuestFilter = "all" | GuestStatus;

interface GuestRecord {
  id: string;
  name: string;
  email: string;
  initials: string;
  ticket: string;
  group: string;
  status: GuestStatus;
  time: string | null;
}

interface OverviewSummary {
  total: number;
  checkedIn: number;
  expected: number;
  noShow: number;
}

interface KpiCardProps {
  label: string;
  value: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  progress?: number;
}

const INITIAL_SUMMARY: OverviewSummary = {
  total: 652,
  checkedIn: 387,
  expected: 242,
  noShow: 23,
};

const INITIAL_GUESTS: GuestRecord[] = [
  {
    id: "guest-1",
    name: "Marco Schneider",
    email: "marco.schneider@email.ch",
    initials: "MS",
    ticket: "VIP Ticket",
    group: "VIP Gäste",
    status: "checked-in",
    time: "10:24",
  },
  {
    id: "guest-2",
    name: "Anna Müller",
    email: "anna.mueller@email.ch",
    initials: "AN",
    ticket: "Standard Ticket",
    group: "Gruppe A",
    status: "checked-in",
    time: "10:21",
  },
  {
    id: "guest-3",
    name: "Jan Lüthi",
    email: "jan.luethi@email.ch",
    initials: "JL",
    ticket: "Standard Ticket",
    group: "Gruppe B",
    status: "checked-in",
    time: "10:18",
  },
  {
    id: "guest-4",
    name: "Sophie Berger",
    email: "sophie.berger@email.ch",
    initials: "SB",
    ticket: "Standard Ticket",
    group: "Gruppe A",
    status: "expected",
    time: null,
  },
  {
    id: "guest-5",
    name: "Michael Kälin",
    email: "michael.kaelin@email.ch",
    initials: "MK",
    ticket: "VIP Ticket",
    group: "VIP Gäste",
    status: "expected",
    time: null,
  },
  {
    id: "guest-6",
    name: "Laura Rüegg",
    email: "laura.ruegg@email.ch",
    initials: "LR",
    ticket: "Standard Ticket",
    group: "Gruppe C",
    status: "no-show",
    time: null,
  },
  {
    id: "guest-7",
    name: "Thomas Huber",
    email: "thomas.huber@email.ch",
    initials: "TH",
    ticket: "Standard Ticket",
    group: "Gruppe B",
    status: "checked-in",
    time: "09:58",
  },
];

const FILTER_OPTIONS: { value: GuestFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "checked-in", label: "Eingecheckt" },
  { value: "expected", label: "Erwartet" },
  { value: "no-show", label: "No-Show" },
];

const OVERVIEW_CHART_CONFIG = {
  checkedIn: { label: "Eingecheckt", color: "#df2634" },
  expected: { label: "Erwartet", color: "#f59e0b" },
  noShow: { label: "No-Show", color: "#b80012" },
} satisfies ChartConfig;

const statusStyles: Record<
  GuestStatus,
  {
    label: string;
    badgeClassName: string;
    dotClassName: string;
    avatarClassName: string;
  }
> = {
  "checked-in": {
    label: "Eingecheckt",
    badgeClassName: "bg-[#eaf7ee] text-[#157f3b]",
    dotClassName: "bg-[#16a34a]",
    avatarClassName: "bg-[#fde6e6] text-accent-red",
  },
  expected: {
    label: "Erwartet",
    badgeClassName: "bg-[#fff5df] text-[#c97f07]",
    dotClassName: "bg-[#f59e0b]",
    avatarClassName: "bg-[#f3eded] text-muted-warm",
  },
  "no-show": {
    label: "No-Show",
    badgeClassName: "bg-[#fee9ea] text-[#b80012]",
    dotClassName: "bg-[#df2634]",
    avatarClassName: "bg-[#fde6e6] text-[#b80012]",
  },
};

const surfaceClassName =
  "rounded-[28px] border border-black/5 bg-white shadow-[0_18px_42px_rgba(116,82,82,0.08)]";

function closeParentMenu(event: MouseEvent<HTMLButtonElement>) {
  event.currentTarget.closest("details")?.removeAttribute("open");
}

function getStatusCounts(guests: GuestRecord[]) {
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

const INITIAL_STATUS_COUNTS = getStatusCounts(INITIAL_GUESTS);

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function formatRate(value: number) {
  return `${value.toFixed(1)}%`;
}

function parseTimeToMinutes(value: string | null) {
  if (!value) {
    return -1;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatCurrentTime() {
  return new Intl.DateTimeFormat("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function AppCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("min-w-0", surfaceClassName, className)}>
      {children}
    </section>
  );
}

function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold tracking-tight text-charcoal">
        {title}
      </h2>
      {action}
    </div>
  );
}

function KpiCard({ label, value, subtitle, icon: Icon, progress }: KpiCardProps) {
  return (
    <AppCard className="min-h-[132px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/85">
            {label}
          </p>
          <p className="mt-4 text-[2.2rem] font-semibold leading-none tracking-tight text-charcoal sm:text-[2.55rem]">
            {value}
          </p>
          <p className="mt-2 text-sm text-muted-warm">{subtitle}</p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#fde6e6] text-accent-red">
          <Icon className="size-5" />
        </div>
      </div>

      {typeof progress === "number" ? (
        <ProgressBar value={progress} className="mt-4 h-2 bg-[#f6e4e5]" />
      ) : null}
    </AppCard>
  );
}

function StatusBadge({ status }: { status: GuestStatus }) {
  const style = statusStyles[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
        style.badgeClassName,
      )}
    >
      <span className={cn("size-2 rounded-full", style.dotClassName)} />
      {style.label}
    </span>
  );
}

function GuestAvatar({
  initials,
  status,
  size = "default",
}: {
  initials: string;
  status: GuestStatus;
  size?: "default" | "small";
}) {
  const style = statusStyles[status];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        size === "default" ? "size-11 text-sm" : "size-10 text-xs",
        style.avatarClassName,
      )}
    >
      {initials}
    </div>
  );
}

function FilterMenu({
  selectedFilter,
  onSelect,
}: {
  selectedFilter: GuestFilter;
  onSelect: (filter: GuestFilter) => void;
}) {
  const activeFilter =
    FILTER_OPTIONS.find((option) => option.value === selectedFilter) ??
    FILTER_OPTIONS[0];

  return (
    <details className="group relative w-full sm:w-auto">
      <summary className="flex h-[52px] list-none items-center justify-between gap-3 rounded-2xl border border-[#eadede] bg-white px-4 text-sm font-semibold text-charcoal shadow-[0_10px_24px_rgba(31,29,29,0.05)] transition hover:bg-[#fff8f8] [&::-webkit-details-marker]:hidden sm:min-w-[148px]">
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-accent-red" />
          Filter
          {selectedFilter !== "all" ? (
            <span className="rounded-full bg-[#fde6e6] px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.16em] text-accent-red">
              {activeFilter.label}
            </span>
          ) : null}
        </span>
        <ChevronDown className="size-4 text-muted-warm transition group-open:rotate-180" />
      </summary>

      <div className="absolute right-0 z-20 mt-2 min-w-[220px] rounded-2xl border border-[#eadede] bg-white p-2 shadow-[0_18px_40px_rgba(31,29,29,0.12)]">
        {FILTER_OPTIONS.map((option) => {
          const isActive = option.value === selectedFilter;

          return (
            <button
              key={option.value}
              type="button"
              onClick={(event) => {
                onSelect(option.value);
                closeParentMenu(event);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition",
                isActive
                  ? "bg-[#fde6e6] font-semibold text-accent-red"
                  : "text-charcoal hover:bg-[#fff7f7]",
              )}
            >
              <span>{option.label}</span>
              {isActive ? (
                <span className="size-2 rounded-full bg-accent-red" />
              ) : null}
            </button>
          );
        })}
      </div>
    </details>
  );
}

function GuestActionsMenu({
  guest,
  onShowDetails,
  onManualCheckIn,
  onCycleStatus,
}: {
  guest: GuestRecord;
  onShowDetails: (guest: GuestRecord) => void;
  onManualCheckIn: (guestId: string) => void;
  onCycleStatus: (guestId: string) => void;
}) {
  return (
    <details className="group relative">
      <summary className="flex size-10 list-none items-center justify-center rounded-xl text-muted-warm transition hover:bg-[#fff4f4] [&::-webkit-details-marker]:hidden">
        <MoreVertical className="size-4" />
      </summary>

      <div className="absolute right-0 z-20 mt-2 min-w-[210px] rounded-2xl border border-[#eadede] bg-white p-2 shadow-[0_18px_40px_rgba(31,29,29,0.12)]">
        <button
          type="button"
          onClick={(event) => {
            onShowDetails(guest);
            closeParentMenu(event);
          }}
          className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm text-charcoal transition hover:bg-[#fff7f7]"
        >
          Details anzeigen
        </button>
        <button
          type="button"
          onClick={(event) => {
            onManualCheckIn(guest.id);
            closeParentMenu(event);
          }}
          className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm text-charcoal transition hover:bg-[#fff7f7]"
        >
          Manuell einchecken
        </button>
        <button
          type="button"
          onClick={(event) => {
            onCycleStatus(guest.id);
            closeParentMenu(event);
          }}
          className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm text-charcoal transition hover:bg-[#fff7f7]"
        >
          Status ändern
        </button>
      </div>
    </details>
  );
}

function GuestListRow({
  guest,
  onShowDetails,
  onManualCheckIn,
  onCycleStatus,
}: {
  guest: GuestRecord;
  onShowDetails: (guest: GuestRecord) => void;
  onManualCheckIn: (guestId: string) => void;
  onCycleStatus: (guestId: string) => void;
}) {
  return (
    <div className="grid min-h-[74px] grid-cols-[minmax(0,2.35fr)_minmax(0,1.45fr)_minmax(132px,0.9fr)_72px_44px] items-center gap-4 px-6 py-4 transition hover:bg-[#fff7f7]">
      <div className="flex min-w-0 items-center gap-4">
        <GuestAvatar initials={guest.initials} status={guest.status} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-charcoal sm:text-[0.97rem]">
            {guest.name}
          </p>
          <p className="mt-1 truncate text-sm text-muted-warm">{guest.email}</p>
        </div>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-charcoal">
          {guest.ticket}
        </p>
        <p className="mt-1 truncate text-sm text-muted-warm">{guest.group}</p>
      </div>

      <StatusBadge status={guest.status} />

      <p className="text-sm font-medium text-charcoal">{guest.time ?? "—"}</p>

      <div className="flex justify-end">
        <GuestActionsMenu
          guest={guest}
          onShowDetails={onShowDetails}
          onManualCheckIn={onManualCheckIn}
          onCycleStatus={onCycleStatus}
        />
      </div>
    </div>
  );
}

function GuestMobileCard({
  guest,
  onShowDetails,
  onManualCheckIn,
  onCycleStatus,
}: {
  guest: GuestRecord;
  onShowDetails: (guest: GuestRecord) => void;
  onManualCheckIn: (guestId: string) => void;
  onCycleStatus: (guestId: string) => void;
}) {
  return (
    <article className="rounded-[24px] border border-[#f1e5e5] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(31,29,29,0.04)]">
      <div className="flex items-start gap-3">
        <GuestAvatar initials={guest.initials} status={guest.status} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-charcoal">
                {guest.name}
              </p>
              <p className="mt-1 truncate text-sm text-muted-warm">
                {guest.email}
              </p>
            </div>
            <StatusBadge status={guest.status} />
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-charcoal">{guest.ticket}</p>
            <p className="mt-1 text-sm text-muted-warm">{guest.group}</p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-charcoal">
              Zeit: {guest.time ?? "—"}
            </p>
            <GuestActionsMenu
              guest={guest}
              onShowDetails={onShowDetails}
              onManualCheckIn={onManualCheckIn}
              onCycleStatus={onCycleStatus}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function TicketScannerCard({
  onActivateCamera,
}: {
  onActivateCamera: () => void;
}) {
  return (
    <AppCard className="p-5 sm:p-6">
      <SectionTitle title="Ticket scannen" />

      <div className="mt-5 rounded-[24px] border-2 border-dashed border-[#efcfd3] bg-[#fdeeee] px-5 py-7">
        <div className="flex h-[150px] flex-col items-center justify-center rounded-[20px] bg-[#fdf3f3] text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-white text-accent-red shadow-[0_12px_24px_rgba(223,38,52,0.12)]">
            <QrCode className="size-8" />
          </div>
          <p className="mt-4 text-sm font-semibold text-charcoal">
            Scannen Sie den QR-Code
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onActivateCamera}
        className="mt-5 h-12 w-full rounded-xl border-[#eadede] bg-white text-charcoal shadow-[0_14px_30px_rgba(31,29,29,0.05)] hover:bg-[#fff7f7]"
      >
        <Camera className="size-4 text-accent-red" />
        Kamera aktivieren
      </Button>
    </AppCard>
  );
}

function CheckInOverviewCard({ summary }: { summary: OverviewSummary }) {
  const chartData = [
    {
      key: "checkedIn",
      label: "Eingecheckt",
      value: summary.checkedIn,
      fill: "#df2634",
    },
    {
      key: "expected",
      label: "Erwartet",
      value: summary.expected,
      fill: "#f59e0b",
    },
    {
      key: "noShow",
      label: "No-Show",
      value: summary.noShow,
      fill: "#b80012",
    },
  ];

  const checkInShare = Math.round((summary.checkedIn / summary.total) * 100);

  return (
    <AppCard className="p-5 sm:p-6">
      <SectionTitle title="Check-in Übersicht" />

      <div className="mt-5 flex min-w-0 flex-col items-center gap-4">
        <div className="relative mx-auto h-[208px] w-[208px] shrink-0">
          <ChartContainer
            config={OVERVIEW_CHART_CONFIG}
            className="h-[208px] min-h-[208px] w-[208px]"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    valueFormatter={(value, item) => `${item.name}: ${value}`}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                innerRadius={58}
                outerRadius={86}
                paddingAngle={3}
                stroke="none"
              >
                {chartData.map((item) => (
                  <Cell key={item.key} fill={item.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[2.1rem] font-semibold leading-none tracking-tight text-charcoal">
              {checkInShare}%
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-warm/85">
              Live
            </p>
          </div>
        </div>

        <div className="w-full min-w-0 max-w-[240px] space-y-3">
          {chartData.map((item) => (
            <div
              key={item.key}
              className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-[#fff8f8] px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="min-w-0 text-sm leading-5 text-muted-warm">
                  {item.label}
                </span>
              </div>
              <span className="shrink-0 text-sm font-semibold text-charcoal">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppCard>
  );
}

function RecentCheckInsCard({
  guests,
  onViewAll,
}: {
  guests: GuestRecord[];
  onViewAll: () => void;
}) {
  return (
    <AppCard className="p-5 sm:p-6">
      <SectionTitle title="Letzte Check-ins" />

      <div className="mt-5 space-y-3">
        {guests.map((guest) => (
          <div
            key={guest.id}
            className="flex items-center gap-3 rounded-2xl bg-[#fff8f8] px-4 py-3"
          >
            <GuestAvatar initials={guest.initials} status={guest.status} size="small" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-charcoal">
                {guest.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#16a34a]" />
              <span className="text-sm font-medium text-charcoal">
                {guest.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onViewAll}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-red transition hover:text-accent-red-dark"
      >
        Alle anzeigen
        <ArrowRight className="size-4" />
      </button>
    </AppCard>
  );
}

export default function CheckInDashboardPage() {
  const [guests, setGuests] = useState(INITIAL_GUESTS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<GuestFilter>("all");
  const [visibleCount, setVisibleCount] = useState(5);
  const deferredQuery = useDeferredValue(query);

  const currentCounts = getStatusCounts(guests);

  const summary: OverviewSummary = {
    total: INITIAL_SUMMARY.total,
    checkedIn:
      INITIAL_SUMMARY.checkedIn +
      currentCounts["checked-in"] -
      INITIAL_STATUS_COUNTS["checked-in"],
    expected:
      INITIAL_SUMMARY.expected +
      currentCounts.expected -
      INITIAL_STATUS_COUNTS.expected,
    noShow:
      INITIAL_SUMMARY.noShow +
      currentCounts["no-show"] -
      INITIAL_STATUS_COUNTS["no-show"],
  };

  const checkedInRate = roundToSingleDecimal((summary.checkedIn / summary.total) * 100);
  const expectedRate = roundToSingleDecimal((summary.expected / summary.total) * 100);
  const noShowRate = roundToSingleDecimal((summary.noShow / summary.total) * 100);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredGuests = guests.filter((guest) => {
    if (statusFilter !== "all" && guest.status !== statusFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [
      guest.name,
      guest.email,
      guest.ticket,
      guest.group,
      guest.initials,
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  const visibleGuests = filteredGuests.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredGuests.length;

  const recentGuests = [...guests]
    .filter((guest) => guest.status === "checked-in" && guest.time)
    .sort((left, right) => parseTimeToMinutes(right.time) - parseTimeToMinutes(left.time))
    .slice(0, 4);

  const handlePlaceholderAction = (label: string) => {
    console.info(`${label} ist noch nicht verbunden.`);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setVisibleCount(5);
  };

  const handleFilterSelect = (value: GuestFilter) => {
    setStatusFilter(value);
    setVisibleCount(5);
  };

  const handleManualCheckIn = (guestId: string) => {
    const checkedInAt = formatCurrentTime();
    setGuests((currentGuests) =>
      currentGuests.map((guest) =>
        guest.id === guestId
          ? { ...guest, status: "checked-in", time: checkedInAt }
          : guest,
      ),
    );
  };

  const handleCycleStatus = (guestId: string) => {
    setGuests((currentGuests) =>
      currentGuests.map((guest) => {
        if (guest.id !== guestId) {
          return guest;
        }

        if (guest.status === "checked-in") {
          return { ...guest, status: "expected", time: null };
        }

        if (guest.status === "expected") {
          return { ...guest, status: "no-show", time: null };
        }

        return { ...guest, status: "checked-in", time: formatCurrentTime() };
      }),
    );
  };

  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="w-full px-6 py-8 md:px-8 xl:px-10 xl:py-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
              Check-in
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-warm sm:text-lg">
              Scannen Sie Tickets oder suchen Sie Gäste, um den Check-in
              durchzuführen.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => handlePlaceholderAction("Check-in Einstellungen")}
            className="h-12 rounded-xl border-[#eadede] bg-white px-4 text-charcoal shadow-[0_14px_30px_rgba(31,29,29,0.05)] hover:bg-[#fff7f7]"
          >
            <Settings className="size-4 text-accent-red" />
            Check-in Einstellungen
          </Button>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
          <KpiCard
            label="Heute Gesamt"
            value={String(summary.total)}
            subtitle="Gäste erwartet"
            icon={Users}
          />
          <KpiCard
            label="Bereits Eingecheckt"
            value={String(summary.checkedIn)}
            subtitle={formatRate(checkedInRate)}
            icon={CheckCircle2}
            progress={checkedInRate}
          />
          <KpiCard
            label="No-Shows"
            value={String(summary.noShow)}
            subtitle={formatRate(noShowRate)}
            icon={UserX}
          />
          <KpiCard
            label="Verbleibend"
            value={String(summary.expected)}
            subtitle={formatRate(expectedRate)}
            icon={CircleDot}
          />
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2.85fr)_minmax(320px,1.12fr)] 2xl:grid-cols-[minmax(0,3.05fr)_minmax(340px,1fr)]">
          <AppCard className="p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <label className="relative block flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-warm" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => handleQueryChange(event.target.value)}
                  placeholder="Nach Name, E-Mail, Ticket oder Firma suchen..."
                  className="h-[52px] w-full rounded-2xl border border-[#eadede] bg-[#fffdfd] pl-12 pr-4 text-sm text-charcoal shadow-[0_10px_24px_rgba(31,29,29,0.04)] outline-none transition placeholder:text-muted-warm/80 focus:border-accent-red/25 focus:ring-4 focus:ring-accent-red/10"
                />
              </label>

              <FilterMenu
                selectedFilter={statusFilter}
                onSelect={handleFilterSelect}
              />
            </div>

            <div className="mt-6 overflow-hidden rounded-[24px] border border-[#f0e4e4] bg-[#fffdfd]">
              <div className="hidden grid-cols-[minmax(0,2.35fr)_minmax(0,1.45fr)_minmax(132px,0.9fr)_72px_44px] gap-4 border-b border-[#f0e4e4] px-6 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-warm/80 lg:grid">
                <span>Gast</span>
                <span>Ticket / Gruppe</span>
                <span>Status</span>
                <span>Zeit</span>
                <span />
              </div>

              {visibleGuests.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-base font-semibold text-charcoal">
                    Keine Gäste gefunden
                  </p>
                  <p className="mt-2 text-sm text-muted-warm">
                    Passen Sie Ihre Suche oder den Filter an.
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden lg:block">
                    {visibleGuests.map((guest, index) => (
                      <div
                        key={guest.id}
                        className={cn(
                          index !== visibleGuests.length - 1 &&
                            "border-b border-[#f0e4e4]",
                        )}
                      >
                        <GuestListRow
                          guest={guest}
                          onShowDetails={(selectedGuest) =>
                            handlePlaceholderAction(
                              `Details für ${selectedGuest.name}`,
                            )
                          }
                          onManualCheckIn={handleManualCheckIn}
                          onCycleStatus={handleCycleStatus}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 p-3 lg:hidden">
                    {visibleGuests.map((guest) => (
                      <GuestMobileCard
                        key={guest.id}
                        guest={guest}
                        onShowDetails={(selectedGuest) =>
                          handlePlaceholderAction(
                            `Details für ${selectedGuest.name}`,
                          )
                        }
                        onManualCheckIn={handleManualCheckIn}
                        onCycleStatus={handleCycleStatus}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {canLoadMore ? (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((currentCount) => currentCount + 4)
                  }
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent-red transition hover:text-accent-red-dark"
                >
                  Weitere Gäste laden
                  <ChevronDown className="size-4" />
                </button>
              </div>
            ) : null}
          </AppCard>

          <aside className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-1">
            <TicketScannerCard
              onActivateCamera={() => handlePlaceholderAction("Kamera aktivieren")}
            />
            <CheckInOverviewCard summary={summary} />
            <RecentCheckInsCard
              guests={recentGuests}
              onViewAll={() => handlePlaceholderAction("Alle Check-ins anzeigen")}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
