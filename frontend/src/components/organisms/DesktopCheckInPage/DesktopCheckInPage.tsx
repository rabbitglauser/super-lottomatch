"use client";

import { useMemo, useState } from "react";
import { Check, QrCode, Search, UserCheck } from "lucide-react";

import AnimatedCounter from "@/components/atoms/AnimatedCounter";
import ProgressBar from "@/components/atoms/ProgressBar";
import {
  CHECKIN_GUESTS,
  type CheckInGuest,
  type AvatarTone,
} from "@/lib/checkin-mock";
import { cn } from "@/lib/utils";

type FilterKey = "all" | "checked-in" | "pending";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "checked-in", label: "Eingecheckt" },
  { key: "pending", label: "Ausstehend" },
];

const avatarToneClasses: Record<AvatarTone, string> = {
  rose: "bg-[#f7d8dc] text-[#b53948]",
  amber: "bg-[#f4e1c5] text-[#9d6226]",
  blue: "bg-[#d7e6ef] text-[#365f82]",
  peach: "bg-[#f5d5cf] text-[#ab5147]",
};

interface StatBlockProps {
  label: string;
  value: number;
  accent?: "red" | "charcoal";
}

function StatBlock({ label, value, accent = "charcoal" }: StatBlockProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(31,29,29,0.04)] ring-1 ring-black/5">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted-warm uppercase">
        {label}
      </p>
      <AnimatedCounter
        value={value}
        className={cn(
          "mt-4 block text-5xl font-semibold tabular-nums",
          accent === "red" ? "text-accent-red" : "text-charcoal",
        )}
      />
    </div>
  );
}

interface GuestRowProps {
  guest: CheckInGuest;
  onCheckIn: (id: string) => void;
}

function GuestRow({ guest, onCheckIn }: GuestRowProps) {
  const isCheckedIn = guest.status === "checked-in";

  return (
    <article className="flex items-center gap-5 rounded-[1.5rem] bg-white px-5 py-4 shadow-[0_12px_28px_rgba(42,23,23,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(42,23,23,0.08)] sm:px-6">
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-4 ring-[#fff6f6]",
          avatarToneClasses[guest.avatarTone],
        )}
      >
        {guest.initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[1.02rem] font-semibold text-charcoal">
          {guest.name}
        </p>
        <p className="mt-0.5 truncate text-sm text-muted-warm">{guest.email}</p>
      </div>

      <span className="hidden rounded-full bg-[#fce8ea] px-3 py-1.5 text-xs font-semibold tracking-wide text-accent-red sm:inline-flex">
        {guest.code}
      </span>

      <p className="hidden w-32 text-sm font-medium text-charcoal md:block">
        {guest.city}
      </p>

      {isCheckedIn ? (
        <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#e9f5ec] px-4 py-2 text-sm font-semibold text-[#2f7a44]">
          <Check className="size-4" />
          <span className="hidden sm:inline">{guest.checkedInAt ?? "OK"}</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onCheckIn(guest.id)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-[#f03a49] to-[#b90f1d] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(220,31,45,0.22)] transition hover:opacity-95"
        >
          <UserCheck className="size-4" />
          <span>Check-in</span>
        </button>
      )}
    </article>
  );
}

export default function DesktopCheckInPage() {
  const [guests, setGuests] = useState<CheckInGuest[]>(CHECKIN_GUESTS);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const checkedInCount = useMemo(
    () => guests.filter((g) => g.status === "checked-in").length,
    [guests],
  );
  const totalGuests = guests.length;
  const pendingCount = totalGuests - checkedInCount;
  const progress = totalGuests === 0 ? 0 : (checkedInCount / totalGuests) * 100;

  const visibleGuests = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((guest) => {
      if (filter === "checked-in" && guest.status !== "checked-in") return false;
      if (filter === "pending" && guest.status !== "pending") return false;
      if (!q) return true;
      return (
        guest.name.toLowerCase().includes(q) ||
        guest.email.toLowerCase().includes(q) ||
        guest.code.toLowerCase().includes(q) ||
        guest.city.toLowerCase().includes(q)
      );
    });
  }, [guests, query, filter]);

  const handleCheckIn = (id: string) => {
    const time = new Date().toLocaleTimeString("de-CH", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setGuests((current) =>
      current.map((g) =>
        g.id === id ? { ...g, status: "checked-in", checkedInAt: time } : g,
      ),
    );
  };

  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="w-full px-6 py-8 md:px-8 xl:px-10 xl:py-10">
        <header className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-charcoal sm:text-[3.3rem]">
              Check-in
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-warm sm:text-lg">
              Erfassen Sie Gäste am Empfang per QR-Code oder manueller Suche und
              behalten Sie den Live-Fortschritt im Blick.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-[74px] items-center justify-center gap-3 rounded-[1.6rem] bg-gradient-to-r from-[#f03a49] to-[#b90f1d] px-6 text-base font-semibold text-white shadow-[0_20px_40px_rgba(220,31,45,0.24)] transition hover:opacity-95"
          >
            <QrCode className="size-5" />
            QR-Scanner öffnen
          </button>
        </header>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatBlock label="Total Gäste" value={totalGuests} accent="red" />
          <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(31,29,29,0.04)] ring-1 ring-black/5">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-warm uppercase">
              Heutige Check-ins
            </p>
            <div className="mt-4 flex items-baseline gap-3">
              <AnimatedCounter
                value={checkedInCount}
                className="text-5xl font-semibold text-charcoal tabular-nums"
              />
              <span className="text-sm font-medium text-muted-warm">
                / {totalGuests}
              </span>
            </div>
            <ProgressBar value={progress} className="mt-4" />
          </div>
          <StatBlock label="Ausstehend" value={pendingCount} />
        </section>

        <section className="mt-10 rounded-[2rem] bg-white/70 p-4 shadow-[0_18px_40px_rgba(42,23,23,0.05)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-warm" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Gast nach Name, Code oder Ort suchen..."
                className="h-[68px] w-full rounded-[1.5rem] border border-black/[0.04] bg-white pl-14 pr-5 text-[0.97rem] text-charcoal shadow-[0_10px_24px_rgba(42,23,23,0.05)] outline-none transition placeholder:text-input-text focus:border-accent-red/15 focus:ring-4 focus:ring-accent-red/10"
              />
            </div>

            <div className="flex gap-2 rounded-[1.4rem] bg-white p-1.5 shadow-[0_10px_24px_rgba(42,23,23,0.05)]">
              {FILTERS.map((option) => {
                const isActive = filter === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setFilter(option.key)}
                    className={cn(
                      "rounded-[1.1rem] px-5 py-2.5 text-sm font-semibold transition",
                      isActive
                        ? "bg-gradient-to-r from-[#f03a49] to-[#b90f1d] text-white shadow-[0_10px_22px_rgba(220,31,45,0.22)]"
                        : "text-muted-warm hover:text-charcoal",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-3">
          {visibleGuests.length === 0 ? (
            <div className="rounded-[1.5rem] bg-white px-6 py-10 text-center text-sm text-muted-warm shadow-[0_12px_28px_rgba(42,23,23,0.05)]">
              Keine Gäste gefunden.
            </div>
          ) : (
            visibleGuests.map((guest) => (
              <GuestRow
                key={guest.id}
                guest={guest}
                onCheckIn={handleCheckIn}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
