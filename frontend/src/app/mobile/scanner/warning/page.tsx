import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CircleUser,
  Clock3,
  MapPin,
  QrCode,
  Search,
  UserPlus,
} from "lucide-react";

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
  fallback: string,
) {
  const value = params[key];
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && raw.trim().length > 0 ? raw : fallback;
}

export default async function ScannerWarningPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const name = readParam(params, "name", "Gast");
  const code = readParam(params, "code", "-");
  const checkedInAt = readParam(params, "checkedInAt", "-");
  const address = readParam(params, "address", "Adresse nicht hinterlegt");
  const successParams = new URLSearchParams({
    name,
    code,
    checkedInAt,
    address,
  }).toString();

  return (
    <main className="min-h-screen bg-[#fbf7f8] text-[#231f20]">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[#fbf7f8]">
        <MobileHeader />

        <section className="flex flex-1 flex-col px-6 pb-32 pt-10 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#fff0f1] text-[#e12c39]">
            <AlertTriangle size={50} fill="currentColor" />
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-[-0.04em]">
            Warnung
          </h1>

          <div className="mx-auto mt-3 rounded-lg border border-[#ffb3bb] bg-[#ffe8eb] px-5 py-2 text-sm font-bold text-[#e12c39]">
            Gast ist bereits eingecheckt.
          </div>

          <div className="mt-8 rounded-3xl border border-[#f0e1e3] bg-white p-6 text-left shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#ffe8eb] text-[#e12c39]">
                <QrCode size={30} />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold">{name}</h2>
                <p className="text-sm text-[#5b484b]">Gast-Code: {code}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <InfoRow
                icon={<Clock3 size={26} />}
                label="Erster Check-in heute"
                value={checkedInAt}
              />

              <InfoRow
                icon={<MapPin size={26} />}
                label="Adresse"
                value={address}
              />
            </div>
          </div>

          <Link
            href={`/mobile/scanner/success?${successParams}`}
            className="mt-6 flex h-16 items-center justify-center rounded-xl bg-gradient-to-r from-[#e12c39] to-[#b80018] text-lg font-extrabold uppercase text-white shadow-xl shadow-red-200"
          >
            Details bestaetigen
          </Link>

          <Link
            href="/mobile/scanner"
            className="mt-4 flex h-16 items-center justify-center rounded-xl bg-[#eee4e3] text-lg font-extrabold text-[#231f20]"
          >
            Abbrechen
          </Link>

          <p className="mx-auto mt-8 max-w-[320px] text-sm leading-6 text-[#6f5a5d]">
            Hinweis: Dies kann vorkommen, wenn der Gast das Gelaende kurzzeitig
            verlassen hat oder die Karte versehentlich doppelt gescannt wurde.
          </p>
        </section>

        <BottomNavigation active="checkin" />
      </div>
    </main>
  );
}

function MobileHeader() {
  return (
    <header className="flex items-center justify-between border-b border-[#f0e1e3] bg-white px-6 py-5">
      <h1 className="text-xl font-extrabold text-[#e12c39]">
        STV EVENT MANAGER
      </h1>

      <div className="flex items-center gap-4 text-[#5b484b]">
        <Bell size={22} />
        <CircleUser size={24} />
      </div>
    </header>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#fff0f1] p-4">
      <div className="flex items-center gap-3 text-[#e12c39]">
        {icon}
        <span className="text-sm font-semibold text-[#5b484b]">{label}</span>
      </div>

      <span className="text-right text-base font-extrabold text-[#e12c39]">
        {value}
      </span>
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
