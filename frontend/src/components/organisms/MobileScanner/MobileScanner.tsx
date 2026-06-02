import Link from "next/link";
import {
  ArrowLeft,
  Flashlight,
  Info,
  Search,
} from "lucide-react";

export default function MobileScanner() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col overflow-hidden bg-black shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <header className="z-20 flex items-center justify-between bg-white/90 px-6 py-5 text-[#231f20] backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link href="/mobile">
              <ArrowLeft size={28} />
            </Link>
            <h1 className="text-2xl font-extrabold">Scanner</h1>
          </div>

          <div className="flex items-center gap-5 text-[#5b484b]">
            <Flashlight size={25} />
            <Info size={27} />
          </div>
        </header>

        <section className="relative flex flex-1 flex-col items-center justify-between px-8 pb-32 pt-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_35%,rgba(255,191,80,0.75),transparent_22%),radial-gradient(circle_at_70%_20%,rgba(255,181,67,0.55),transparent_18%),radial-gradient(circle_at_60%_65%,rgba(168,80,20,0.7),transparent_25%),linear-gradient(140deg,#1b0d07,#4b250e,#090604)]" />
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-3 rounded-full bg-white px-8 py-4 text-[#231f20] shadow-lg">
              <span className="h-3 w-3 rounded-full bg-[#df2634]" />
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

              <div className="absolute left-2 right-2 top-[64px] h-[2px] bg-[#df2634] shadow-[0_0_16px_rgba(223,38,52,0.8)]" />
            </div>
          </div>

          <div className="relative z-10 w-full">
            <p className="mx-auto mb-8 max-w-[300px] text-center text-2xl font-extrabold leading-snug">
              Richten Sie den QR-Code im Feld aus
            </p>

            <Link
              href="/mobile/search"
              className="flex h-16 items-center justify-center gap-4 rounded-[1.1rem] bg-[#df2634] text-xl font-extrabold shadow-xl shadow-black/30"
            >
              <Search size={30} />
              Manuelle Suche
            </Link>

            <Link
              href="/mobile"
              className="mt-4 flex h-16 items-center justify-center rounded-[1.1rem] border border-white/40 bg-black/25 text-xl font-extrabold backdrop-blur-sm"
            >
              Abbrechen
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}