import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  Calendar,
  Check,
  CircleUser,
  Download,
  MapPin,
  Printer,
  QrCode,
  Search,
  UserPlus,
} from "lucide-react";

export default function RegisterConfirmationPage() {
  return (
    <main className="min-h-screen bg-[#fbf7f8] text-[#231f20]">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[#fbf7f8]">
        <MobileHeader />

        <section className="flex flex-1 flex-col px-6 pb-32 pt-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ffd9dc] text-[#e12c39]">
            <Check size={34} strokeWidth={4} />
          </div>

          <h1 className="mt-9 text-4xl font-extrabold tracking-[-0.04em]">
            Bestätigung
          </h1>

          <h2 className="mt-6 text-2xl font-extrabold text-[#e12c39]">
            Registrierung abgeschlossen!
          </h2>

          <p className="mx-auto mt-6 max-w-[340px] text-lg leading-7 text-[#6f5a5d]">
            Bitte speichern oder fotografieren Sie diesen Code für den Einlass.
          </p>

          <div className="relative mt-8 rounded-xl bg-white p-8 shadow-sm ring-1 ring-[#f0e1e3]">
            <div className="absolute right-8 top-7 flex items-center gap-2 rounded-full bg-[#eee4e3] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[#5b484b]">
              <span className="h-2 w-2 rounded-full bg-[#e12c39]" />
              Active Code
            </div>

            <div className="mx-auto mt-8 flex h-64 w-64 items-center justify-center bg-[#111]">
              <div className="grid h-36 w-36 grid-cols-5 gap-1 bg-white p-3">
                {Array.from({ length: 25 }).map((_, index) => (
                  <span
                    key={index}
                    className={
                      index % 2 === 0 || index % 7 === 0
                        ? "bg-black"
                        : "bg-white"
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-[#f0e1e3] bg-[#fff9f9] p-8 text-left">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#5b484b]">
              Gäste-Code
            </p>

            <p className="mt-3 text-5xl font-extrabold tracking-[-0.06em] text-[#e12c39]">
              SL-9912
            </p>

            <div className="my-8 h-px bg-[#f0e1e3]" />

            <div className="space-y-5">
              <InfoLine
                icon={<Calendar size={24} />}
                label="Datum"
                value="21. April 2026"
              />

              <InfoLine
                icon={<MapPin size={24} />}
                label="Veranstaltungsort"
                value="STV Ennetbürgen Halle"
              />
            </div>
          </div>

          <button className="mt-8 flex h-16 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#e12c39] to-[#b80018] text-xl font-extrabold text-white shadow-xl shadow-red-200">
            <Download size={25} />
            Als Bild speichern
          </button>

          <button className="mt-4 flex h-16 items-center justify-center gap-3 rounded-xl bg-[#eee7dc] text-xl font-extrabold">
            <Printer size={25} />
            Drucken
          </button>
        </section>

        <BottomNavigation active="new" />
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

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="text-[#e12c39]">{icon}</div>

      <div>
        <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#5b484b]">
          {label}
        </p>
        <p className="text-lg font-extrabold">{value}</p>
      </div>
    </div>
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