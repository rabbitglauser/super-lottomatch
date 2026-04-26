import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  Calendar,
  Check,
  CircleUser,
  QrCode,
  Search,
  UserPlus,
} from "lucide-react";

export default function MobileLandingPage() {
  return (
    <main className="min-h-screen bg-[#fbf7f8] text-[#231f20]">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[#fbf7f8]">
        <header className="flex items-center justify-between border-b border-[#f0e1e3] bg-white px-6 py-5">
          <h1 className="text-xl font-bold">Home</h1>

          <div className="flex items-center gap-4">
            <Bell size={22} className="text-[#5b484b]" />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8dfe2]">
              <CircleUser size={22} className="text-[#5b484b]" />
            </div>
          </div>
        </header>

        <section className="flex-1 px-6 py-8 pb-28">
          <div className="rounded-3xl bg-[#f8eded] p-8 text-center">
            <p className="text-xs tracking-[0.3em] text-[#6f5a5d]">
              CHECK-INS HEUTE
            </p>

            <p className="mt-3 text-6xl font-extrabold text-[#e52535]">25</p>

            <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#e52535]">
              <span className="h-2 w-2 rounded-full bg-[#e52535]" />
              LIVE STATUS
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <Link
              href="/mobile/scanner"
              className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#e52535] to-[#b80018] p-6 text-white shadow-xl shadow-red-200"
            >
              <div>
                <h2 className="text-xl font-bold">QR-Code scannen</h2>
                <p className="mt-1 text-sm text-white/80">
                  Tickets automatisch erfassen
                </p>
              </div>

              <QrCode size={34} />
            </Link>

            <Link
              href="/mobile/search"
              className="flex items-center justify-between rounded-2xl border border-[#f0e1e3] bg-white p-6 shadow-sm"
            >
              <div>
                <h2 className="text-xl font-bold">Manuelle Suche</h2>
                <p className="mt-1 text-sm text-[#6f5a5d]">
                  Gästeliste durchsuchen
                </p>
              </div>

              <Search size={32} className="text-[#231f20]" />
            </Link>

            <Link
              href="/mobile/register"
              className="flex items-center justify-between rounded-2xl border border-[#f0e1e3] bg-white p-6 shadow-sm"
            >
              <div>
                <h2 className="text-xl font-bold">Neuer Gast registrieren</h2>
                <p className="mt-1 text-sm text-[#6f5a5d]">
                  Vor-Ort Anmeldung
                </p>
              </div>

              <UserPlus size={32} className="text-[#231f20]" />
            </Link>
          </div>

          <div className="mt-8">
            <p className="mb-4 text-xs tracking-[0.3em] text-[#6f5a5d]">
              LETZTE AKTIVITÄTEN
            </p>

            <div className="space-y-3">
              <ActivityItem
                name="Forster, Benjamin"
                time="Check-in vor 2 Min."
                code="VIP-G12"
              />

              <ActivityItem
                name="Warren, Amarah"
                time="Check-in vor 5 Min."
                code="REG-A04"
              />
            </div>
          </div>
        </section>

        <nav className="fixed bottom-0 left-1/2 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-4 border-t border-[#f0e1e3] bg-white px-3 py-3">
          <BottomNavItem active icon={<Calendar size={21} />} label="HEUTE" />
          <BottomNavItem icon={<QrCode size={21} />} label="CHECK-IN" />
          <BottomNavItem icon={<Search size={21} />} label="SUCHEN" />
          <BottomNavItem icon={<UserPlus size={21} />} label="NEUER GAST" />
        </nav>
      </div>
    </main>
  );
}

function ActivityItem({
  name,
  time,
  code,
}: {
  name: string;
  time: string;
  code: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#fff4f5] p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffdfe3] text-[#e52535]">
          <Check size={20} />
        </div>

        <div>
          <p className="font-bold">{name}</p>
          <p className="text-sm text-[#6f5a5d]">{time}</p>
        </div>
      </div>

      <p className="text-xs text-[#6f5a5d]">{code}</p>
    </div>
  );
}

function BottomNavItem({
  icon,
  label,
  active = false,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-center text-[11px] font-bold ${
        active ? "bg-[#ffe8eb] text-[#e52535]" : "text-[#9b8b8d]"
      }`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </div>
  );
}