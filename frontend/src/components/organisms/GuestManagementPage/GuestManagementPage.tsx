import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  MoreVertical,
  Search,
  SlidersHorizontal,
  Upload,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { GUESTS, type GuestRecord } from "@/lib/guest-management-mock";
import { cn } from "@/lib/utils";

const desktopGridClass =
  "lg:grid-cols-[minmax(0,2.45fr)_minmax(120px,0.95fr)_minmax(110px,0.8fr)_minmax(140px,1fr)_110px_40px]";

const avatarToneClasses = {
  rose: "bg-[#f7d8dc] text-[#b53948]",
  amber: "bg-[#f4e1c5] text-[#9d6226]",
  blue: "bg-[#d7e6ef] text-[#365f82]",
  peach: "bg-[#f5d5cf] text-[#ab5147]",
} as const;

interface ActionButtonProps {
  icon: LucideIcon;
  variant: "primary" | "secondary";
  children: ReactNode;
}

function ActionButton({
  icon: Icon,
  variant,
  children,
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      className={cn(
        "h-[74px] w-full justify-start gap-3 rounded-[1.6rem] px-6 text-left text-base font-semibold transition sm:w-[200px]",
        variant === "primary"
          ? "bg-gradient-to-r from-[#f03a49] to-[#b90f1d] text-white shadow-[0_20px_40px_rgba(220,31,45,0.24)] hover:opacity-95"
          : "bg-[#f9e9ea] text-accent-red hover:bg-[#f4dcde]",
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span className="leading-[1.15]">{children}</span>
    </Button>
  );
}

function MarketingToggle({ active }: { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 w-14 shrink-0 rounded-full p-1 transition",
        active
          ? "bg-gradient-to-r from-[#ef3543] to-[#c31524] shadow-[0_12px_26px_rgba(220,31,45,0.22)]"
          : "bg-[#d9cdcc]",
      )}
    >
      <span
        className={cn(
          "size-6 rounded-full bg-white shadow-[0_4px_10px_rgba(31,29,29,0.14)] transition-transform duration-200",
          active ? "translate-x-6" : "translate-x-0",
        )}
      />
    </button>
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
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-muted-warm/80">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function GuestRow({ guest }: { guest: GuestRecord }) {
  return (
    <article className="rounded-[1.75rem] bg-white px-5 py-5 shadow-[0_18px_36px_rgba(42,23,23,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_52px_rgba(42,23,23,0.1)] sm:px-6 lg:min-h-[92px] lg:px-7">
      <div className="flex items-start justify-between gap-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-4 ring-[#fff6f6]",
              avatarToneClasses[guest.avatarTone],
            )}
          >
            {guest.initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[1.05rem] font-semibold text-charcoal">
              {guest.name}
            </p>
            <p className="mt-1 truncate text-sm text-muted-warm">{guest.email}</p>
          </div>
        </div>

        <button
          type="button"
          aria-label={`${guest.name} Optionen`}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl text-muted-warm transition hover:bg-[#f8eeee]"
        >
          <MoreVertical className="size-5" />
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:hidden">
        <MobileField label="Gast-Code">
          <span className="inline-flex rounded-full bg-[#fce8ea] px-3 py-2 text-sm font-semibold text-accent-red">
            {guest.code}
          </span>
        </MobileField>

        <MobileField label="Wohnort">
          <p className="text-sm font-medium text-charcoal">{guest.city}</p>
        </MobileField>

        <MobileField label="Letzte Teilnahme">
          <p className="text-sm font-medium text-charcoal">{guest.lastParticipation}</p>
        </MobileField>

        <MobileField label="Marketing">
          <MarketingToggle active={guest.marketingActive} />
        </MobileField>
      </div>

      <div className={cn("hidden items-center gap-6 lg:grid", desktopGridClass)}>
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-4 ring-[#fff6f6]",
              avatarToneClasses[guest.avatarTone],
            )}
          >
            {guest.initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[1.02rem] font-semibold text-charcoal">
              {guest.name}
            </p>
            <p className="mt-1 truncate text-sm text-muted-warm">{guest.email}</p>
          </div>
        </div>

        <div>
          <span className="inline-flex rounded-full bg-[#fce8ea] px-3 py-2 text-sm font-semibold text-accent-red">
            {guest.code}
          </span>
        </div>

        <p className="text-sm font-medium text-charcoal">{guest.city}</p>
        <p className="text-sm font-medium text-charcoal">{guest.lastParticipation}</p>
        <MarketingToggle active={guest.marketingActive} />

        <button
          type="button"
          aria-label={`${guest.name} Optionen`}
          className="inline-flex size-10 items-center justify-center rounded-2xl text-muted-warm transition hover:bg-[#f8eeee]"
        >
          <MoreVertical className="size-5" />
        </button>
      </div>
    </article>
  );
}

export default function GuestManagementPage() {
  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="w-full px-6 py-8 md:px-8 xl:px-10 xl:py-10">
        <header className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-charcoal sm:text-[3.3rem]">
              Gästeverwaltung
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-warm sm:text-lg">
              Verwalten Sie Ihre Teilnehmerliste, Importieren Sie Daten und
              behalten Sie den Überblick über die Event-Präsenz.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row xl:shrink-0">
            <ActionButton icon={Upload} variant="secondary">
              Importieren
            </ActionButton>

            <ActionButton icon={UserPlus} variant="primary">
              <span className="block">Manueller</span>
              <span className="block">Gast</span>
            </ActionButton>
          </div>
        </header>

        <section className="mt-10 rounded-[2rem] bg-white/70 p-4 shadow-[0_18px_40px_rgba(42,23,23,0.05)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-warm" />
              <input
                type="search"
                placeholder="Gäste nach Name, Code oder Wohnort suchen..."
                className="h-[68px] w-full rounded-[1.5rem] border border-black/[0.04] bg-white pl-14 pr-5 text-[0.97rem] text-charcoal shadow-[0_10px_24px_rgba(42,23,23,0.05)] outline-none transition placeholder:text-input-text focus:border-accent-red/15 focus:ring-4 focus:ring-accent-red/10"
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              className="h-[68px] rounded-[1.4rem] border border-black/[0.04] bg-white px-6 text-base font-semibold text-charcoal shadow-[0_10px_24px_rgba(42,23,23,0.05)] hover:bg-white lg:w-[110px]"
            >
              <SlidersHorizontal className="size-5 text-accent-red" />
              Filter
            </Button>
          </div>
        </section>

        <section className="mt-8">
          <div
            className={cn(
              "hidden px-8 pb-3 text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-muted-warm/85 lg:grid",
              desktopGridClass,
            )}
          >
            <span>Name</span>
            <span>Gast-Code</span>
            <span>Wohnort</span>
            <span>Letzte Teilnahme</span>
            <span>Marketing</span>
            <span />
          </div>

          <div className="space-y-4">
            {GUESTS.map((guest) => (
              <GuestRow key={guest.id} guest={guest} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
