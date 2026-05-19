import Link from "next/link";
import type { ReactNode } from "react";
import {
  Award,
  Calendar,
  Check,
  QrCode,
  Search,
  Star,
  User,
  UserPlus,
} from "lucide-react";

export default function ScannerSuccessPage() {
  return (
    <main className="min-h-screen bg-[#fbf7f8] text-[#231f20]">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[#fbf7f8]">
        <section className="flex flex-1 flex-col px-6 pb-32 pt-14 text-center">
          <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-[#f9dfe2]">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f4b9c0]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e12c39] text-white">
                <Check size={34} strokeWidth={4} />
              </div>
            </div>
          </div>

          <p className="mt-14 text-sm font-bold uppercase tracking-[0.35em] text-[#5b484b]">
            Erfolg
          </p>

          <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.04em] text-[#e12c39]">
            Check-in erfolgreich!
          </h1>

          <div className="mt-14 rounded-3xl border border-[#f0e1e3] bg-white px-6 py-8 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ffe9eb] text-[#e12c39]">
              <User size={30} />
            </div>

            <h2 className="mt-6 text-3xl font-extrabold">Samuel Glauser</h2>

            <div className="mx-auto mt-4 flex w-fit items-center gap-3 rounded-full bg-[#f3eeee] px-6 py-3">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#5b484b]">
                Gast-Code
              </span>
              <span className="text-xl font-extrabold text-[#e12c39]">
                SL-8821
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 text-left">
            <InfoCard
              icon={<Star size={24} fill="currentColor" />}
              label="Status"
              value="Zweite Teilnahme"
            />

            <InfoCard
              icon={<Award size={24} fill="currentColor" />}
              label="Tickets"
              value="2 Lose insgesamt"
            />
          </div>

          <Link
            href="/mobile/scanner"
            className="mt-14 flex h-20 items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-[#e12c39] to-[#b80018] text-xl font-extrabold text-white shadow-xl shadow-red-200"
          >
            <UserPlus size={30} />
            Nächster Gast
          </Link>

          <Link
            href="/mobile"
            className="mt-10 text-sm font-extrabold uppercase tracking-[0.25em] text-[#5b484b]"
          >
            Details ansehen
          </Link>
        </section>

        <BottomNavigation />
      </div>
    </main>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#fff0f1] p-5">
      <div className="text-[#e12c39]">{icon}</div>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.15em] text-[#5b484b]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
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