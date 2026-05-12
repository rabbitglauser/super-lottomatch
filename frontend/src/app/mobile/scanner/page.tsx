import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Flashlight,
  Info,
  QrCode,
  Search,
  UserPlus,
} from "lucide-react";

export default function MobileScannerPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col overflow-hidden bg-black">
        <header className="z-20 flex items-center justify-between bg-[#ded9d7] px-6 py-5 text-[#231f20]">
          <div className="flex items-center gap-4">
            <Link href="/mobile">
              <ArrowLeft size={28} />
            </Link>
            <h1 className="text-2xl font-bold">Scanner</h1>
          </div>

          <div className="flex items-center gap-5 text-[#5b484b]">
            <Flashlight size={26} />
            <Info size={28} />
          </div>
        </header>

        <section className="relative flex flex-1 flex-col items-center justify-between px-8 pb-32 pt-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_35%,rgba(255,191,80,0.75),transparent_22%),radial-gradient(circle_at_70%_20%,rgba(255,181,67,0.55),transparent_18%),radial-gradient(circle_at_60%_65%,rgba(168,80,20,0.7),transparent_25%),linear-gradient(140deg,#1b0d07,#4b250e,#090604)]" />

          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-3 rounded-full bg-white px-8 py-4 text-[#231f20] shadow-lg">
              <span className="h-3 w-3 rounded-full bg-[#e52535]" />
              <div className="text-xs font-extrabold uppercase tracking-[0.25em]">
                <p>STV Stewardship</p>
                <p>Active</p>
              </div>
            </div>

            <div className="relative mt-16 h-[310px] w-[320px]">
              <div className="absolute left-0 top-0 h-16 w-16 rounded-tl-2xl border-l-4 border-t-4 border-white" />
              <div className="absolute right-0 top-0 h-16 w-16 rounded-tr-2xl border-r-4 border-t-4 border-white" />
              <div className="absolute bottom-0 left-0 h-16 w-16 rounded-bl-2xl border-b-4 border-l-4 border-white" />
              <div className="absolute bottom-0 right-0 h-16 w-16 rounded-br-2xl border-b-4 border-r-4 border-white" />

              <div className="absolute left-2 right-2 top-[64px] h-[2px] bg-[#e52535] shadow-[0_0_16px_rgba(229,37,53,0.8)]" />
            </div>
          </div>

          <div className="relative z-10 w-full">
            <p className="mx-auto mb-8 max-w-[300px] text-center text-2xl font-bold leading-snug">
              Richten Sie den QR-Code im Feld aus
            </p>

            <Link
              href="/mobile/search"
              className="flex h-16 items-center justify-center gap-4 rounded-xl bg-[#e52535] text-xl font-bold shadow-xl shadow-black/30"
            >
              <Search size={30} />
              Manuelle Suche
            </Link>

            <Link
              href="/mobile"
              className="mt-4 flex h-16 items-center justify-center rounded-xl border border-white/40 bg-black/25 text-xl font-bold backdrop-blur-sm"
            >
              Abbrechen
            </Link>
          </div>
        </section>

        <nav className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-4 border-t border-[#f0e1e3] bg-white px-3 py-3 text-[#9b8b8d]">
          <BottomNavItem href="/mobile" icon={<Calendar size={22} />} label="HEUTE" />
          <BottomNavItem active href="/mobile/scanner" icon={<QrCode size={22} />} label="CHECK-IN" />
          <BottomNavItem href="/mobile/search" icon={<Search size={22} />} label="SUCHEN" />
          <BottomNavItem href="/mobile/register" icon={<UserPlus size={22} />} label="NEUER GAST" />
        </nav>
      </div>
    </main>
  );
}

function BottomNavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
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