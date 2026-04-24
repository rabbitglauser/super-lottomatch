import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone } from "lucide-react";

export default function MobileLandingPage() {
  return (
    <main className="min-h-dvh bg-page-dashboard px-6 py-8 text-charcoal sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[2rem] bg-[rgba(255,255,255,0.88)] p-7 text-center shadow-[0_24px_50px_rgba(42,23,23,0.08)] ring-1 ring-white/70 backdrop-blur-sm sm:p-10">
          <div className="mx-auto flex size-16 items-center justify-center rounded-[1.4rem] bg-[#fde6e6] text-accent-red shadow-[0_18px_30px_rgba(223,38,52,0.12)]">
            <Smartphone className="size-7" strokeWidth={2} />
          </div>

          <p className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-accent-red/80">
            Mobile Entry
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Die mobile Version ist in Vorbereitung
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-warm sm:text-base">
            Dieser Bereich ist für die kommende mobile Erfahrung von
            SuperLottomatch reserviert. Bis dahin steht Ihnen die Desktop-Version
            mit dem vollständigen Event-Workflow zur Verfügung.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex h-[54px] items-center justify-center gap-2 rounded-[1.1rem] border border-[#edd4d4] bg-white px-5 text-sm font-semibold text-charcoal transition hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(42,23,23,0.08)]"
            >
              <ArrowLeft className="size-4.5" strokeWidth={2} />
              Zur Startseite
            </Link>
            <Link
              href="/login"
              className="inline-flex h-[54px] items-center justify-center gap-2 rounded-[1.1rem] bg-gradient-to-r from-[#ef3543] to-[#b90f1d] px-5 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(220,31,45,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_42px_rgba(220,31,45,0.28)]"
            >
              <Monitor className="size-4.5" strokeWidth={2} />
              Zur Desktop-Version
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
