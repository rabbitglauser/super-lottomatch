"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Gift,
  MoreVertical,
  Search,
  SlidersHorizontal,
  Trophy,
  Upload,
  X,
} from "lucide-react";

import ProgressBar from "@/components/atoms/ProgressBar";
import { Button } from "@/components/ui/button";
import {
  PRIZE_NEXT_HIGHLIGHT,
  PRIZE_RAFFLE_OVERVIEW,
  PRIZE_STATS,
  PRIZES,
  type PrizeCategory,
  type PrizeRecord,
  type PrizeStat,
  type PrizeStatus,
} from "@/lib/prizes-mock";
import { cn } from "@/lib/utils";

const desktopGridClass =
  "lg:grid-cols-[minmax(0,2.5fr)_minmax(110px,0.95fr)_minmax(140px,1fr)_minmax(110px,0.85fr)_minmax(120px,0.85fr)_44px]";

const categoryToneClasses: Record<PrizeCategory, string> = {
  Hauptpreis: "bg-[#fde0e2] text-[#b80012]",
  Sport: "bg-[#f1e6e6] text-[#5b3231]",
  Gutschein: "bg-[#f0e7df] text-[#7a4a25]",
  Sachpreis: "bg-[#e7e3ee] text-[#4a3f74]",
  Genuss: "bg-[#efe1d6] text-[#7a4f2d]",
};

const statusToneClasses: Record<PrizeStatus, string> = {
  Bereit: "bg-[#fde6e6] text-accent-red",
  Offen: "bg-[#ece6e5] text-muted-warm",
  Reserviert: "bg-[#fbe7d2] text-[#8a4d1c]",
};

interface ActionButtonProps {
  icon: LucideIcon;
  variant: "primary" | "secondary";
  children: ReactNode;
  onClick?: () => void;
}

function ActionButton({
  icon: Icon,
  variant,
  children,
  onClick,
}: ActionButtonProps) {
  const className = cn(
    "inline-flex h-[58px] w-full items-center justify-center gap-3 rounded-2xl px-6 text-base font-semibold transition sm:w-auto sm:min-w-[180px]",
    variant === "primary"
      ? "bg-gradient-to-r from-[#f03a49] to-[#b90f1d] text-white shadow-[0_18px_36px_rgba(220,31,45,0.24)] hover:opacity-95"
      : "bg-[#f9e9ea] text-accent-red hover:bg-[#f4dcde]",
  );

  return (
    <Button type="button" className={className} onClick={onClick}>
      <Icon className="size-5 shrink-0" />
      <span>{children}</span>
    </Button>
  );
}

function PrizeStatCard({ stat }: { stat: PrizeStat }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(31,29,29,0.04)] ring-1 ring-black/5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-warm">
        {stat.label}
      </p>

      <p className="mt-4 text-[2.6rem] font-semibold leading-none tracking-tight text-charcoal tabular-nums">
        {stat.value}
      </p>

      {stat.caption ? (
        <p
          className={cn(
            "mt-3 text-sm font-semibold",
            stat.captionTone === "accent"
              ? "text-accent-red"
              : "text-muted-warm",
          )}
        >
          {stat.caption}
        </p>
      ) : null}

      {typeof stat.progress === "number" ? (
        <ProgressBar value={stat.progress} className="mt-5" />
      ) : null}
    </div>
  );
}

function PrizeCategoryPill({ category }: { category: PrizeCategory }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide",
        categoryToneClasses[category],
      )}
    >
      {category}
    </span>
  );
}

function PrizeStatusPill({ status }: { status: PrizeStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
        statusToneClasses[status],
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "Bereit"
            ? "bg-accent-red"
            : status === "Reserviert"
              ? "bg-[#c87528]"
              : "bg-muted-warm",
        )}
      />
      {status}
    </span>
  );
}

function PrizeIconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex size-[52px] shrink-0 items-center justify-center rounded-2xl bg-[#fde6e6] text-accent-red ring-4 ring-[#fff6f6]">
      <Icon className="size-6" strokeWidth={1.75} />
    </div>
  );
}

function MobileField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-muted-warm/85">
        {label}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function PrizeRow({ prize }: { prize: PrizeRecord }) {
  return (
    <article className="rounded-3xl bg-white px-5 py-5 shadow-[0_18px_36px_rgba(42,23,23,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_52px_rgba(42,23,23,0.1)] sm:px-6 lg:min-h-[92px] lg:px-7 lg:py-4">
      <div className="flex items-start justify-between gap-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-4">
          <PrizeIconBadge icon={prize.icon} />
          <div className="min-w-0">
            <p className="truncate text-[1.05rem] font-semibold text-charcoal">
              {prize.name}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-warm">
              {prize.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={`${prize.name} Optionen`}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl text-muted-warm transition hover:bg-[#f8eeee]"
        >
          <MoreVertical className="size-5" />
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:hidden">
        <MobileField label="Kategorie">
          <PrizeCategoryPill category={prize.category} />
        </MobileField>
        <MobileField label="Sponsor">
          <p className="truncate text-sm font-medium text-charcoal">
            {prize.sponsor}
          </p>
        </MobileField>
        <MobileField label="Wert">
          <p className="text-sm font-semibold text-charcoal tabular-nums">
            {prize.value}
          </p>
        </MobileField>
        <MobileField label="Status">
          <PrizeStatusPill status={prize.status} />
        </MobileField>
      </div>

      <div className={cn("hidden items-center gap-6 lg:grid", desktopGridClass)}>
        <div className="flex min-w-0 items-center gap-4">
          <PrizeIconBadge icon={prize.icon} />
          <div className="min-w-0">
            <p className="truncate text-[1rem] font-semibold text-charcoal">
              {prize.name}
            </p>
            <p className="mt-1 truncate text-sm text-muted-warm">
              {prize.description}
            </p>
          </div>
        </div>

        <PrizeCategoryPill category={prize.category} />

        <p className="truncate text-sm font-medium text-charcoal">
          {prize.sponsor}
        </p>

        <p className="text-sm font-semibold text-charcoal tabular-nums">
          {prize.value}
        </p>

        <PrizeStatusPill status={prize.status} />

        <button
          type="button"
          aria-label={`${prize.name} Optionen`}
          className="inline-flex size-10 items-center justify-center rounded-2xl text-muted-warm transition hover:bg-[#f8eeee]"
        >
          <MoreVertical className="size-5" />
        </button>
      </div>
    </article>
  );
}

function PrizeSummaryPanel() {
  const overview = PRIZE_RAFFLE_OVERVIEW;
  const highlight = PRIZE_NEXT_HIGHLIGHT;
  const progress = Math.round((overview.drawn / overview.total) * 100);

  return (
    <aside className="flex flex-col gap-5">
      <div className="rounded-3xl bg-white p-6 shadow-[0_18px_36px_rgba(42,23,23,0.06)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-warm">
          Verlosungsübersicht
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-muted-warm/85">
              Aktuelles Event
            </p>
            <p className="mt-1.5 text-base font-semibold text-charcoal">
              {overview.currentEvent}
            </p>
          </div>

          <div className="rounded-2xl bg-[#faf1f1] p-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-muted-warm/85">
              Nächste Verlosung
            </p>
            <p className="mt-1.5 text-base font-semibold text-charcoal">
              {overview.nextDraw}
            </p>
            <p className="mt-1 text-sm text-muted-warm">{overview.time}</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-muted-warm/85">
                Fortschritt
              </p>
              <p className="text-xs font-semibold text-charcoal tabular-nums">
                {progress}%
              </p>
            </div>
            <ProgressBar value={progress} className="mt-3" />
            <p className="mt-2 text-sm text-muted-warm">
              {overview.drawn} von {overview.total} Preisen ausgelost
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#fde6e6] to-[#f9d6d8] p-6 shadow-[0_18px_36px_rgba(42,23,23,0.06)]">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/85 text-accent-red shadow-[0_8px_18px_rgba(220,31,45,0.15)]">
            <Trophy className="size-6" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-accent-red-dark/80">
              {highlight.title}
            </p>
            <p className="mt-1.5 truncate text-lg font-semibold text-charcoal">
              {highlight.prize}
            </p>
            <p className="mt-1 truncate text-sm text-muted-warm">
              {highlight.sponsor}
            </p>
          </div>
        </div>
        <p className="mt-5 text-2xl font-semibold tracking-tight text-accent-red-dark tabular-nums">
          {highlight.value}
        </p>
      </div>
    </aside>
  );
}

interface CreatePrizeModalProps {
  open: boolean;
  onClose: () => void;
}

function CreatePrizeModal({ open, onClose }: CreatePrizeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-7 shadow-[0_28px_60px_rgba(42,23,23,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-warm">
              Neuer Preis
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-charcoal">
              Preis erstellen
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="inline-flex size-10 items-center justify-center rounded-2xl text-muted-warm transition hover:bg-[#f8eeee]"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onClose();
          }}
        >
          <ModalField label="Preisname" placeholder="z. B. Wellness Wochenende" />
          <ModalField
            label="Beschreibung"
            placeholder="Kurze Beschreibung"
            multiline
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <ModalSelect
              label="Kategorie"
              options={[
                "Hauptpreis",
                "Sport",
                "Gutschein",
                "Sachpreis",
                "Genuss",
              ]}
            />
            <ModalField label="Sponsor" placeholder="z. B. Hotel Alpenblick" />
            <ModalField label="Wert" placeholder="CHF 0" />
            <ModalSelect
              label="Status"
              options={["Bereit", "Offen", "Reserviert"]}
            />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-semibold text-charcoal transition hover:bg-[#f8eeee]"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#f03a49] to-[#b90f1d] px-6 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(220,31,45,0.22)] transition hover:opacity-95"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalField({
  label,
  placeholder,
  multiline,
}: {
  label: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const inputClass =
    "w-full rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-sm text-charcoal outline-none transition placeholder:text-input-text focus:border-accent-red/20 focus:ring-4 focus:ring-accent-red/10";

  return (
    <label className="block">
      <span className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-muted-warm/85">
        {label}
      </span>
      {multiline ? (
        <textarea rows={3} placeholder={placeholder} className={inputClass} />
      ) : (
        <input type="text" placeholder={placeholder} className={inputClass} />
      )}
    </label>
  );
}

function ModalSelect({
  label,
  options,
}: {
  label: string;
  options: readonly string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-muted-warm/85">
        {label}
      </span>
      <select className="h-[46px] w-full appearance-none rounded-2xl border border-black/[0.06] bg-white px-4 text-sm font-medium text-charcoal outline-none transition focus:border-accent-red/20 focus:ring-4 focus:ring-accent-red/10">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function DesktopPrizeManagementPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="w-full px-6 py-8 md:px-8 xl:px-10 xl:py-10">
        <header className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-charcoal sm:text-[3.3rem]">
              Preise
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-warm sm:text-lg">
              Verwalten Sie Gewinne, Sponsoren und Verlosungsdetails für Ihr
              Event.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row xl:shrink-0">
            <ActionButton icon={Upload} variant="secondary">
              Importieren
            </ActionButton>
            <ActionButton
              icon={Gift}
              variant="primary"
              onClick={() => setCreateOpen(true)}
            >
              Preis erstellen
            </ActionButton>
          </div>
        </header>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRIZE_STATS.map((stat) => (
            <PrizeStatCard key={stat.label} stat={stat} />
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] bg-white/70 p-4 shadow-[0_18px_40px_rgba(42,23,23,0.05)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-warm" />
              <input
                type="search"
                placeholder="Preise nach Name, Sponsor oder Kategorie suchen..."
                className="h-[64px] w-full rounded-2xl border border-black/[0.04] bg-white pl-14 pr-5 text-[0.97rem] text-charcoal shadow-[0_10px_24px_rgba(42,23,23,0.05)] outline-none transition placeholder:text-input-text focus:border-accent-red/15 focus:ring-4 focus:ring-accent-red/10"
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowFilters((current) => !current)}
              aria-expanded={showFilters}
              className={cn(
                "h-[64px] rounded-2xl border px-6 text-base font-semibold shadow-[0_10px_24px_rgba(42,23,23,0.05)] lg:w-[120px]",
                showFilters
                  ? "border-accent-red/10 bg-[#f9e9ea] text-accent-red hover:bg-[#f4dcde]"
                  : "border-black/[0.04] bg-white text-charcoal hover:bg-white",
              )}
            >
              <SlidersHorizontal className="size-5 text-accent-red" />
              Filter
            </Button>
          </div>
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] xl:gap-10">
          <section>
            <div
              className={cn(
                "hidden px-8 pb-3 text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-muted-warm/85 lg:grid",
                desktopGridClass,
              )}
            >
              <span>Preis</span>
              <span>Kategorie</span>
              <span>Sponsor</span>
              <span>Wert</span>
              <span>Status</span>
              <span />
            </div>

            <div className="space-y-4">
              {PRIZES.map((prize) => (
                <PrizeRow key={prize.id} prize={prize} />
              ))}
            </div>
          </section>

          <PrizeSummaryPanel />
        </div>
      </div>

      <CreatePrizeModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
