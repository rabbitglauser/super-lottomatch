"use client";

import {
  useEffect,
  useDeferredValue,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bike,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Coins,
  Gift,
  Info,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Target,
  Ticket,
  Trophy,
  Upload,
  Wine,
} from "lucide-react";

import PageReveal from "@/components/atoms/PageReveal";
import ProgressBar from "@/components/atoms/ProgressBar";
import { Button } from "@/components/ui/button";
import {
  deletePrize,
  fetchPrizes,
  type PrizeCategory,
  type PrizeData,
  type PrizeKpi,
  type PrizeOverview,
  type PrizeRecord,
  type PrizeStatus,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type PrizeFilter = "all" | PrizeCategory | PrizeStatus;

type PrizeViewModel = PrizeRecord & { icon: LucideIcon };
type PrizeKpiViewModel = PrizeKpi & { icon: LucideIcon };

const FILTER_OPTIONS: { value: PrizeFilter; label: string }[] = [
  { value: "all", label: "Alle Kategorien" },
  { value: "Hauptpreis", label: "Hauptpreis" },
  { value: "Sport", label: "Sport" },
  { value: "Gutschein", label: "Gutschein" },
  { value: "Sachpreis", label: "Sachpreis" },
  { value: "Genuss", label: "Genuss" },
  { value: "Bereit", label: "Bereit" },
  { value: "Offen", label: "Offen" },
  { value: "Reserviert", label: "Reserviert" },
];

const categoryClassName =
  "inline-flex rounded-full bg-[#fde6e6] px-3 py-1.5 text-xs font-semibold text-accent-red";

const statusClassNames: Record<PrizeStatus, string> = {
  Bereit: "bg-[#fde6e6] text-accent-red",
  Offen: "bg-[#efebeb] text-muted-warm",
  Reserviert: "bg-[#fff0dc] text-[#ad6a18]",
};

const surfaceClassName =
  "min-w-0 rounded-[28px] border border-black/5 bg-white shadow-[0_18px_42px_rgba(116,82,82,0.08)]";

const kpiIcons = [Gift, Coins, Trophy, Target] as const;

function getPrizeIcon(category: PrizeCategory) {
  if (category === "Hauptpreis") return Trophy;
  if (category === "Sport") return Bike;
  if (category === "Gutschein") return Ticket;
  if (category === "Genuss") return Wine;
  return Coffee;
}

function mapPrizeData(data: PrizeData) {
  return {
    ...data,
    kpis: data.kpis.map((kpi, index) => ({
      ...kpi,
      icon: kpiIcons[index] ?? Gift,
    })),
    prizes: data.prizes.map((prize) => ({
      ...prize,
      icon: getPrizeIcon(prize.category),
    })),
    nextHighlight: data.nextHighlight
      ? {
          ...data.nextHighlight,
          icon: getPrizeIcon(data.nextHighlight.category),
        }
      : null,
  };
}

function closeParentMenu(event: MouseEvent<HTMLButtonElement>) {
  event.currentTarget.closest("details")?.removeAttribute("open");
}

function SurfaceCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <section className={cn(surfaceClassName, className)}>{children}</section>;
}

function HeaderActionButton({
  icon: Icon,
  children,
  variant,
  onClick,
}: {
  icon: LucideIcon;
  children: ReactNode;
  variant: "primary" | "secondary";
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn(
        "h-[58px] rounded-2xl px-5 text-base font-semibold shadow-[0_14px_30px_rgba(31,29,29,0.05)]",
        variant === "primary"
          ? "w-full border-transparent bg-[linear-gradient(135deg,#df2634_0%,#b80012_100%)] text-white shadow-[0_18px_34px_rgba(223,38,52,0.24)] hover:opacity-95 sm:w-[210px]"
          : "w-full border-[#eadede] bg-white text-charcoal hover:bg-[#fff7f7] sm:w-[190px]",
      )}
    >
      <Icon className={cn("size-5", variant === "primary" ? "text-white" : "text-accent-red")} />
      {children}
    </Button>
  );
}

function PrizeKpiCard({ kpi }: { kpi: PrizeKpiViewModel }) {
  const Icon = kpi.icon;

  return (
    <div className="min-h-[145px] rounded-[24px] border border-black/5 bg-white p-5 shadow-[0_18px_40px_rgba(116,82,82,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(116,82,82,0.11)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/85">
            {kpi.label}
          </p>
          <p className="mt-4 text-[2.15rem] font-semibold leading-none tracking-tight text-charcoal sm:text-[2.45rem]">
            {kpi.value}
          </p>
          <p
            className={cn(
              "mt-3 text-sm font-semibold",
              kpi.subtitleTone === "accent" ? "text-accent-red" : "text-muted-warm",
            )}
          >
            {kpi.subtitle}
          </p>
        </div>

        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#fde6e6] text-accent-red">
          <Icon className="size-5" />
        </div>
      </div>

      {typeof kpi.progress === "number" ? (
        <ProgressBar value={kpi.progress} className="mt-4 h-2 bg-[#f4e5e6]" />
      ) : null}
    </div>
  );
}

function PrizeCategoryBadge({ category }: { category: PrizeCategory }) {
  return <span className={categoryClassName}>{category}</span>;
}

function PrizeStatusBadge({ status }: { status: PrizeStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1.5 text-xs font-semibold",
        statusClassNames[status],
      )}
    >
      {status}
    </span>
  );
}

function PrizeIconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#fde6e6] text-accent-red">
      <Icon className="size-6" strokeWidth={1.9} />
    </div>
  );
}

function PrizeFilterMenu({
  selectedFilter,
  onSelect,
}: {
  selectedFilter: PrizeFilter;
  onSelect: (filter: PrizeFilter) => void;
}) {
  const activeOption =
    FILTER_OPTIONS.find((option) => option.value === selectedFilter) ??
    FILTER_OPTIONS[0];

  return (
    <details className="group relative w-full sm:w-auto">
      <summary className="flex h-[58px] list-none items-center justify-between gap-3 rounded-2xl border border-[#eadede] bg-white px-4 text-sm font-semibold text-charcoal shadow-[0_10px_24px_rgba(31,29,29,0.04)] transition hover:bg-[#fff8f8] [&::-webkit-details-marker]:hidden sm:w-[130px]">
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-accent-red" />
          Filter
        </span>
        <ChevronDown className="size-4 text-muted-warm transition group-open:rotate-180" />
      </summary>

      <div className="absolute right-0 z-20 mt-2 min-w-[220px] rounded-2xl border border-[#eadede] bg-white p-2 shadow-[0_18px_40px_rgba(31,29,29,0.12)]">
        <div className="px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-warm/80">
          {activeOption.label}
        </div>
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
              {isActive ? <span className="size-2 rounded-full bg-accent-red" /> : null}
            </button>
          );
        })}
      </div>
    </details>
  );
}

function PrizeRowMenu({
  prizeName,
  onAction,
  onDelete,
}: {
  prizeName: string;
  onAction: (label: string) => void;
  onDelete: () => void;
}) {
  const actions = [
    "Details anzeigen",
    "Bearbeiten",
    "Auslosungsstatus ändern",
    "Löschen",
  ];

  return (
    <details className="group relative">
      <summary className="flex size-10 list-none items-center justify-center rounded-xl text-muted-warm transition hover:bg-[#fff4f4] [&::-webkit-details-marker]:hidden">
        <MoreVertical className="size-4" />
      </summary>

      <div className="absolute right-0 z-20 mt-2 min-w-[220px] rounded-2xl border border-[#eadede] bg-white p-2 shadow-[0_18px_40px_rgba(31,29,29,0.12)]">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={(event) => {
              if (action === "Löschen") {
                onDelete();
              } else {
                onAction(`${action} – ${prizeName}`);
              }
              closeParentMenu(event);
            }}
            className={cn(
              "flex w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-[#fff7f7]",
              action === "Löschen" ? "text-accent-red" : "text-charcoal",
            )}
          >
            {action}
          </button>
        ))}
      </div>
    </details>
  );
}

function PrizeDesktopRow({
  prize,
  onAction,
  onDelete,
}: {
  prize: PrizeViewModel;
  onAction: (label: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid min-h-[92px] grid-cols-[minmax(0,2.4fr)_minmax(118px,0.9fr)_minmax(0,1.1fr)_110px_110px_44px] items-center gap-4 px-6 py-4 transition hover:bg-[#fff7f7]">
      <div className="flex min-w-0 items-center gap-4">
        <PrizeIconTile icon={prize.icon} />
        <div className="min-w-0">
          <p className="truncate text-[0.98rem] font-semibold text-charcoal">
            {prize.name}
          </p>
          <p className="mt-1 truncate text-sm text-muted-warm">
            {prize.description}
          </p>
        </div>
      </div>

      <PrizeCategoryBadge category={prize.category} />

      <p className="truncate text-sm font-medium text-charcoal">{prize.sponsor}</p>

      <p className="text-sm font-semibold text-charcoal tabular-nums">
        {prize.value}
      </p>

      <PrizeStatusBadge status={prize.status} />

      <div className="flex justify-end">
        <PrizeRowMenu
          prizeName={prize.name}
          onAction={onAction}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

function PrizeMobileCard({
  prize,
  onAction,
  onDelete,
}: {
  prize: PrizeViewModel;
  onAction: (label: string) => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-[24px] border border-[#f0e4e4] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(31,29,29,0.04)]">
      <div className="flex items-start gap-3">
        <PrizeIconTile icon={prize.icon} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-charcoal">
                {prize.name}
              </p>
              <p className="mt-1 text-sm text-muted-warm">{prize.description}</p>
            </div>
            <PrizeStatusBadge status={prize.status} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/80">
                Kategorie
              </p>
              <div className="mt-2">
                <PrizeCategoryBadge category={prize.category} />
              </div>
            </div>
            <div>
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/80">
                Sponsor
              </p>
              <p className="mt-2 text-sm font-medium text-charcoal">
                {prize.sponsor}
              </p>
            </div>
            <div className="flex items-end justify-between gap-3 sm:block">
              <div>
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/80">
                  Wert
                </p>
                <p className="mt-2 text-sm font-semibold text-charcoal tabular-nums">
                  {prize.value}
                </p>
              </div>

              <PrizeRowMenu
                prizeName={prize.name}
                onAction={onAction}
                onDelete={onDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function PrizePagination({
  visibleCount,
  totalCount,
}: {
  visibleCount: number;
  totalCount: number;
}) {
  const paginationItems = ["1", "2", "3", "…", "5"];
  const rangeLabel =
    visibleCount === 0
      ? `0 von ${totalCount} Preisen`
      : `1–${visibleCount} von ${totalCount} Preisen`;

  return (
    <div className="mt-6 flex flex-col gap-4 border-t border-[#f0e4e4] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-warm">{rangeLabel}</p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled
          className="inline-flex size-9 items-center justify-center rounded-xl border border-[#eadede] bg-white text-muted-warm/50"
        >
          <ChevronLeft className="size-4" />
        </button>

        {paginationItems.map((item) => (
          <button
            key={item}
            type="button"
            disabled={item === "…"}
            className={cn(
              "inline-flex min-w-9 items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition",
              item === "1"
                ? "bg-accent-red text-white shadow-[0_12px_24px_rgba(223,38,52,0.2)]"
                : item === "…"
                  ? "cursor-default text-muted-warm"
                  : "border border-[#eadede] bg-white text-charcoal hover:bg-[#fff7f7]",
            )}
          >
            {item}
          </button>
        ))}

        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-xl border border-[#eadede] bg-white text-charcoal transition hover:bg-[#fff7f7]"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function PrizeOverviewCard({ overview }: { overview: PrizeOverview }) {
  const progress = overview.total
    ? Math.round((overview.drawn / overview.total) * 100)
    : 0;

  return (
    <SurfaceCard className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/85">
          Verlosungsübersicht
        </p>
        <CalendarDays className="size-4 text-accent-red" />
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/80">
            Aktuelles Event
          </p>
          <p className="mt-2 text-base font-semibold text-charcoal">
            {overview.currentEvent}
          </p>
        </div>

        <div>
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/80">
            Nächste Verlosung
          </p>
          <p className="mt-2 text-base font-semibold text-charcoal">
            {overview.nextDraw}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-charcoal">
          <CalendarDays className="size-4 text-accent-red" />
          <span>{overview.date}</span>
          <span className="size-1 rounded-full bg-muted-warm/60" />
          <span>{overview.time}</span>
        </div>

        <div className="h-px bg-[#f0e4e4]" />

        <div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-warm">
              {overview.drawn} von {overview.total} Preisen ausgelost
            </span>
            <span className="font-semibold text-accent-red">{progress}%</span>
          </div>
          <ProgressBar value={progress} className="mt-3 h-2 bg-[#f4e5e6]" />
        </div>
      </div>
    </SurfaceCard>
  );
}

function NextMainPrizeCard({ prize }: { prize: PrizeViewModel | null }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#f2d7d8] bg-[#fdeaea] p-5 shadow-[0_18px_42px_rgba(116,82,82,0.08)] sm:p-6">
      <div className="relative z-10 flex items-center justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-red-dark/80">
          Nächster Hauptpreis
        </p>
        <Trophy className="size-5 text-accent-red" />
      </div>

      <div className="relative z-10 mt-5">
        <p className="text-xl font-semibold tracking-tight text-charcoal">
          {prize?.name ?? "Noch kein Hauptpreis"}
        </p>
        <p className="mt-2 text-sm font-medium text-muted-warm">
          {prize?.sponsor ?? "Keine Sponsor-Daten"}
        </p>
      </div>

      <div className="relative z-10 mt-5 h-px bg-[#efcfd1]" />

      <div className="relative z-10 mt-5">
        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/80">
          Wert
        </p>
        <p className="mt-2 text-[1.9rem] font-semibold tracking-tight text-accent-red-dark">
          {prize?.value ?? "CHF -"}
        </p>
      </div>

      <Gift className="pointer-events-none absolute bottom-2 right-2 size-28 text-accent-red/10" />
    </section>
  );
}

function PrizeHintCard({ onAdjust }: { onAdjust: () => void }) {
  return (
    <SurfaceCard className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/85">
          Hinweis
        </p>
        <Info className="size-4 text-accent-red" />
      </div>

      <p className="mt-4 text-sm leading-7 text-muted-warm">
        Hauptpreise werden zuerst ausgelost. Sie können die Reihenfolge in den{" "}
        <button
          type="button"
          onClick={onAdjust}
          className="font-semibold text-accent-red transition hover:text-accent-red-dark"
        >
          Einstellungen anpassen.
        </button>
      </p>
    </SurfaceCard>
  );
}

export default function DesktopPrizeManagementPage() {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<PrizeFilter>("all");
  const [prizeData, setPrizeData] = useState<ReturnType<typeof mapPrizeData> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    fetchPrizes()
      .then((data) => setPrizeData(mapPrizeData(data)))
      .catch(() => setError("Preisdaten konnten nicht geladen werden."));
  }, []);

  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredPrizes = useMemo(() => {
    return (prizeData?.prizes ?? []).filter((prize) => {
      const matchesFilter =
        selectedFilter === "all" ||
        prize.category === selectedFilter ||
        prize.status === selectedFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [prize.name, prize.description, prize.category, prize.sponsor]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [normalizedQuery, prizeData, selectedFilter]);

  const handlePlaceholderAction = (label: string) => {
    console.info(`${label} ist noch nicht verbunden.`);
  };

  const handleDeletePrize = (prizeId: string) => {
    const prize = prizeData?.prizes.find((item) => item.id === prizeId);

    if (!prize) {
      return;
    }

    if (!window.confirm(`Preis "${prize.name}" wirklich löschen?`)) {
      return;
    }

    const previousData = prizeData;
    setPrizeData((current) =>
      current
        ? {
            ...current,
            prizes: current.prizes.filter((item) => item.id !== prizeId),
            nextHighlight:
              current.nextHighlight?.id === prizeId ? null : current.nextHighlight,
          }
        : current,
    );

    deletePrize(prizeId).catch(() => {
      setPrizeData(previousData);
      setError("Preis konnte nicht gelöscht werden.");
    });
  };

  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="w-full px-6 py-8 md:px-8 xl:px-10 xl:py-10">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <PageReveal delay={0} variant="up" className="max-w-4xl">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
                Preise
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-warm sm:text-lg">
                Verwalten Sie Gewinne, Sponsoren und Verlosungsdetails für Ihr Event.
              </p>
            </div>
          </PageReveal>

          <PageReveal delay={120} variant="right" className="xl:shrink-0">
            <div className="flex flex-col gap-3 sm:flex-row">
              <HeaderActionButton
                icon={Upload}
                variant="secondary"
                onClick={() => handlePlaceholderAction("Preise importieren")}
              >
                Importieren
              </HeaderActionButton>
              <HeaderActionButton
                icon={Plus}
                variant="primary"
                onClick={() => handlePlaceholderAction("Preis erstellen")}
              >
                Preis erstellen
              </HeaderActionButton>
            </div>
          </PageReveal>
        </header>

        {error ? (
          <p className="mt-6 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-accent-red shadow-[0_12px_28px_rgba(42,23,23,0.05)]">
            {error}
          </p>
        ) : null}

        <section className="mt-8 grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
          {(prizeData?.kpis ?? []).map((kpi, index) => (
            <PageReveal
              key={kpi.label}
              delay={200 + index * 80}
              variant="up"
              className="h-full w-full"
            >
              <PrizeKpiCard kpi={kpi} />
            </PageReveal>
          ))}
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
          <PageReveal delay={540} variant="left" className="h-full w-full">
            <SurfaceCard className="p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <label className="relative block flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-warm" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Preise nach Name, Sponsor oder Kategorie suchen..."
                    className="h-[58px] w-full rounded-2xl border border-[#eadede] bg-[#fffdfd] pl-12 pr-4 text-sm text-charcoal shadow-[0_10px_24px_rgba(31,29,29,0.04)] outline-none transition placeholder:text-muted-warm/80 focus:border-accent-red/25 focus:ring-4 focus:ring-accent-red/10"
                  />
                </label>

                <PrizeFilterMenu
                  selectedFilter={selectedFilter}
                  onSelect={setSelectedFilter}
                />
              </div>

              <div className="mt-6 overflow-hidden rounded-[24px] border border-[#f0e4e4] bg-[#fffdfd]">
                <div className="hidden grid-cols-[minmax(0,2.4fr)_minmax(118px,0.9fr)_minmax(0,1.1fr)_110px_110px_44px] gap-4 border-b border-[#f0e4e4] px-6 py-4 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-warm/80 lg:grid">
                  <span>Preis</span>
                  <span>Kategorie</span>
                  <span>Sponsor</span>
                  <span>Wert</span>
                  <span>Status</span>
                  <span />
                </div>

                {filteredPrizes.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-base font-semibold text-charcoal">
                      Keine Preise gefunden
                    </p>
                    <p className="mt-2 text-sm text-muted-warm">
                      Passen Sie Ihre Suche oder die Filter an.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="hidden lg:block">
                      {filteredPrizes.map((prize, index) => (
                        <div
                          key={prize.id}
                          className={cn(
                            index !== filteredPrizes.length - 1 &&
                              "border-b border-[#f0e4e4]",
                          )}
                        >
                          <PrizeDesktopRow
                            prize={prize}
                            onAction={handlePlaceholderAction}
                            onDelete={() => handleDeletePrize(prize.id)}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 p-3 lg:hidden">
                      {filteredPrizes.map((prize) => (
                        <PrizeMobileCard
                          key={prize.id}
                          prize={prize}
                          onAction={handlePlaceholderAction}
                          onDelete={() => handleDeletePrize(prize.id)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <PrizePagination
                visibleCount={filteredPrizes.length}
                totalCount={prizeData?.prizes.length ?? 0}
              />
            </SurfaceCard>
          </PageReveal>

          <aside className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-1">
            <PageReveal delay={640} variant="right" className="h-full w-full">
              {prizeData ? <PrizeOverviewCard overview={prizeData.overview} /> : null}
            </PageReveal>
            <PageReveal delay={720} variant="right" className="h-full w-full">
              <NextMainPrizeCard prize={prizeData?.nextHighlight ?? null} />
            </PageReveal>
            <PageReveal delay={800} variant="right" className="h-full w-full">
              <PrizeHintCard
                onAdjust={() =>
                  handlePlaceholderAction("Preiseinstellungen anpassen")
                }
              />
            </PageReveal>
          </aside>
        </div>
      </div>
    </div>
  );
}
