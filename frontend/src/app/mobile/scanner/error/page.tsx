import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Calendar,
  Clock3,
  QrCode,
  RotateCcw,
  Search,
  ShieldAlert,
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

export default async function ScannerErrorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const code = readParam(params, "code", "Unbekannter Code");
  const reason = readParam(params, "reason", "not-found");
  const reasonLabel =
    reason === "network"
      ? "Server nicht erreichbar"
      : "Gast ist nicht registriert";

  return (
    <main className="min-h-screen bg-[#fbf7f8] text-[#231f20]">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[#fbf7f8]">
        <header className="flex items-center justify-between border-b border-[#f0e1e3] bg-white px-6 py-5">
          <h1 className="text-xl font-extrabold text-[#e12c39]">
            STV Event Manager
          </h1>
          <ShieldAlert size={24} className="text-[#5b484b]" />
        </header>

        <section className="flex flex-1 flex-col px-6 pb-32 pt-12 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#ffe4e7] text-[#e12c39]">
            <AlertTriangle size={48} fill="currentColor" className="text-[#e12c39]" />
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-[-0.04em]">
            Scan fehlgeschlagen
          </h1>

          <div className="mx-auto mt-4 rounded-xl border border-[#ffb3bb] bg-[#ffe8eb] px-5 py-2 text-sm font-bold text-[#e12c39]">
            QR-Code ungueltig oder nicht gefunden
          </div>

          <div className="mt-8 rounded-3xl border border-[#f0e1e3] bg-white p-6 text-left shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffe8eb] text-[#e12c39]">
                <QrCode size={34} />
              </div>

              <div>
                <h2 className="text-xl font-extrabold">Keine gueltige Anmeldung</h2>
                <p className="mt-1 text-sm text-[#6f5a5d]">
                  Der Code konnte nicht eindeutig bestaetigt werden.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <InfoRow icon={<QrCode size={24} />} label="Gescannter Code" value={code} />

              <InfoRow
                icon={<Clock3 size={24} />}
                label="Moeglicher Grund"
                value={reasonLabel}
              />
            </div>
          </div>

          <Link
            href="/mobile/search"
            className="mt-8 flex h-16 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#e12c39] to-[#b80018] text-lg font-extrabold uppercase text-white shadow-xl shadow-red-200"
          >
            <Search size={24} />
            Manuell suchen
          </Link>

          <Link
            href="/mobile/scanner"
            className="mt-4 flex h-16 items-center justify-center gap-3 rounded-2xl bg-white text-lg font-extrabold text-[#e12c39] shadow-sm"
          >
            <RotateCcw size={24} />
            Erneut scannen
          </Link>

          <Link
            href="/mobile/register"
            className="mt-8 flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-[#e12c39]"
          >
            <UserPlus size={20} />
            Neuen Gast registrieren
          </Link>
        </section>

        <BottomNavigation />
      </div>
    </main>
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
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#fff0f1] p-4">
      <div className="flex items-center gap-3 text-[#e12c39]">
        {icon}
        <span className="text-sm font-semibold text-[#5b484b]">{label}</span>
      </div>

      <span className="text-right text-sm font-extrabold">{value}</span>
    </div>
  );
}

function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-1/2 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-4 border-t border-[#f0e1e3] bg-white px-3 py-3">
      <BottomNavItem href="/mobile" icon={<Calendar size={22} />} label="HEUTE" />
      <BottomNavItem
        active
        href="/mobile/scanner"
        icon={<QrCode size={22} />}
        label="CHECK-IN"
      />
      <BottomNavItem href="/mobile/search" icon={<Search size={22} />} label="SUCHEN" />
      <BottomNavItem
        href="/mobile/register"
        icon={<UserPlus size={22} />}
        label="NEUER GAST"
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
