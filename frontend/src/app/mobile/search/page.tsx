"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  Calendar,
  CheckCircle,
  CircleUser,
  Loader2,
  QrCode,
  Search,
  UserPlus,
} from "lucide-react";

import {
  checkInByCode,
  searchMobileGuests,
  type MobileGuestSearchResult,
} from "@/lib/api";

function resultParams(result: Awaited<ReturnType<typeof checkInByCode>>) {
  return new URLSearchParams({
    name: result.guest.name,
    code: result.guest.code,
    checkedInAt: result.checkedInAt ?? "",
    address: result.guest.address,
  });
}

export default function MobileSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MobileGuestSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timeout = window.setTimeout(() => {
      searchMobileGuests(trimmedQuery)
        .then(setResults)
        .catch(() => setError("Suche konnte nicht geladen werden."))
        .finally(() => setIsLoading(false));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const handleCheckIn = async (guest: MobileGuestSearchResult) => {
    setActiveCode(guest.code);
    setError(null);

    try {
      const result = await checkInByCode(guest.code, "guest_code");
      const params = resultParams(result).toString();
      router.push(
        result.status === "already-checked-in"
          ? `/mobile/scanner/warning?${params}`
          : `/mobile/scanner/success?${params}`,
      );
    } catch {
      router.push(`/mobile/scanner/error?code=${encodeURIComponent(guest.code)}`);
    } finally {
      setActiveCode(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbf7f8] text-[#231f20]">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[#fbf7f8]">
        <MobileHeader />

        <section className="flex-1 px-6 pb-32 pt-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#e12c39]">
              Manuelle Suche
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em]">
              Gast suchen
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6f5a5d]">
              Suchen Sie nach Name, Gast-Code oder Adresse.
            </p>
          </div>

          <label className="mt-8 flex h-16 items-center gap-3 rounded-2xl bg-white px-5 shadow-sm ring-1 ring-[#f0e1e3]">
            <Search size={24} className="text-[#9b8b8d]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="z.B. Hans Mueller oder G-000001"
              className="w-full bg-transparent text-base outline-none placeholder:text-[#bdaeb0]"
            />
          </label>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#5b484b]">
                Suchresultate
              </p>
              {isLoading ? (
                <Loader2 className="size-5 animate-spin text-[#e12c39]" />
              ) : null}
            </div>

            {error ? (
              <p className="rounded-2xl bg-white p-5 text-sm font-bold text-[#e12c39] shadow-sm ring-1 ring-[#f0e1e3]">
                {error}
              </p>
            ) : null}

            <div className="space-y-4">
              {results.map((guest) => (
                <GuestResult
                  key={guest.id}
                  guest={guest}
                  isSubmitting={activeCode === guest.code}
                  onCheckIn={() => handleCheckIn(guest)}
                />
              ))}
            </div>

            {!isLoading && query.trim().length >= 2 && results.length === 0 ? (
              <div className="rounded-2xl bg-white p-5 text-sm font-bold text-[#6f5a5d] shadow-sm ring-1 ring-[#f0e1e3]">
                Kein passender Gast gefunden.
              </div>
            ) : null}
          </div>

          <Link
            href="/mobile/register"
            className="mt-8 flex h-14 items-center justify-center rounded-xl bg-white text-base font-extrabold text-[#e12c39] shadow-sm ring-1 ring-[#f0e1e3]"
          >
            Neuen Gast registrieren
          </Link>
        </section>

        <BottomNavigation active="search" />
      </div>
    </main>
  );
}

function MobileHeader() {
  return (
    <header className="flex items-center justify-between border-b border-[#f0e1e3] bg-white px-6 py-5">
      <h1 className="text-xl font-extrabold text-[#e12c39]">
        STV Event Manager
      </h1>

      <div className="flex items-center gap-4 text-[#5b484b]">
        <Bell size={22} />
        <CircleUser size={24} />
      </div>
    </header>
  );
}

function GuestResult({
  guest,
  isSubmitting,
  onCheckIn,
}: {
  guest: MobileGuestSearchResult;
  isSubmitting: boolean;
  onCheckIn: () => void;
}) {
  const isCheckedIn = guest.status === "checked-in";

  return (
    <button
      type="button"
      onClick={onCheckIn}
      disabled={isSubmitting}
      className="block w-full rounded-2xl border border-[#f0e1e3] bg-white p-5 text-left shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold">{guest.name}</h2>
          <p className="mt-1 text-sm text-[#6f5a5d]">{guest.address}</p>
        </div>

        <span className="rounded-full bg-[#f3eeee] px-3 py-1 text-xs font-extrabold text-[#e12c39]">
          {guest.code}
        </span>
      </div>

      <div
        className={`mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${
          isCheckedIn
            ? "bg-[#ffe8eb] text-[#e12c39]"
            : "bg-[#f0fff4] text-[#1d7a3a]"
        }`}
      >
        {isSubmitting ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <CheckCircle size={20} />
        )}
        {isSubmitting
          ? "Check-in laeuft..."
          : isCheckedIn
            ? `Bereits eingecheckt${guest.checkedInAt ? ` um ${guest.checkedInAt}` : ""}`
            : "Antippen zum Check-in"}
      </div>
    </button>
  );
}

function BottomNavigation({
  active,
}: {
  active: "home" | "checkin" | "search" | "new";
}) {
  return (
    <nav className="fixed bottom-0 left-1/2 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-4 border-t border-[#f0e1e3] bg-white px-3 py-3">
      <BottomNavItem
        href="/mobile"
        icon={<Calendar size={22} />}
        label="HEUTE"
        active={active === "home"}
      />
      <BottomNavItem
        href="/mobile/scanner"
        icon={<QrCode size={22} />}
        label="CHECK-IN"
        active={active === "checkin"}
      />
      <BottomNavItem
        href="/mobile/search"
        icon={<Search size={22} />}
        label="SUCHEN"
        active={active === "search"}
      />
      <BottomNavItem
        href="/mobile/register"
        icon={<UserPlus size={22} />}
        label="NEUER GAST"
        active={active === "new"}
      />
    </nav>
  );
}

function BottomNavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-center text-[11px] font-bold ${
        active ? "bg-[#ffe8eb] text-[#e52535]" : "text-[#9b8b8d]"
      }`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </Link>
  );
}
