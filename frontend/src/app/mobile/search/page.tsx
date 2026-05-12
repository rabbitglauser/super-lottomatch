import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  Calendar,
  CheckCircle,
  CircleUser,
  QrCode,
  Search,
  UserPlus,
} from "lucide-react";

export default function MobileSearchPage() {
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

          <div className="mt-8 flex h-16 items-center gap-3 rounded-2xl bg-white px-5 shadow-sm ring-1 ring-[#f0e1e3]">
            <Search size={24} className="text-[#9b8b8d]" />
            <input
              placeholder="z.B. Samuel Glauser"
              className="w-full bg-transparent text-base outline-none placeholder:text-[#bdaeb0]"
            />
          </div>

          <div className="mt-8">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.25em] text-[#5b484b]">
              Suchresultate
            </p>

            <div className="space-y-4">
              <GuestResult
                name="Samuel Glauser"
                code="SL-8821"
                address="Hauptstrasse 12, 6370 Stans"
                status="Noch nicht eingecheckt"
                href="/mobile/scanner/success"
              />

              <GuestResult
                name="Claudio Hübscher"
                code="882-AF"
                address="Bahnhofstrasse 4, 6300 Zug"
                status="Bereits eingecheckt"
                href="/mobile/scanner/warning"
                warning
              />

              <GuestResult
                name="Amarah Warren"
                code="REG-A04"
                address="Dorfstrasse 8, 6373 Ennetbürgen"
                status="Noch nicht eingecheckt"
                href="/mobile/scanner/success"
              />
            </div>
          </div>

          <Link
            href="/mobile/scanner/error"
            className="mt-8 flex h-14 items-center justify-center rounded-xl bg-white text-base font-extrabold text-[#e12c39] shadow-sm ring-1 ring-[#f0e1e3]"
          >
            Kein passender Gast gefunden?
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
  name,
  code,
  address,
  status,
  href,
  warning = false,
}: {
  name: string;
  code: string;
  address: string;
  status: string;
  href: string;
  warning?: boolean;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-[#f0e1e3] bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold">{name}</h2>
          <p className="mt-1 text-sm text-[#6f5a5d]">{address}</p>
        </div>

        <span className="rounded-full bg-[#f3eeee] px-3 py-1 text-xs font-extrabold text-[#e12c39]">
          {code}
        </span>
      </div>

      <div
        className={`mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${
          warning
            ? "bg-[#ffe8eb] text-[#e12c39]"
            : "bg-[#f0fff4] text-[#1d7a3a]"
        }`}
      >
        <CheckCircle size={20} />
        {status}
      </div>
    </Link>
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