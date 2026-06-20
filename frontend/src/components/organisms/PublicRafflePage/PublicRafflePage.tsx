"use client";

import { useEffect, useState } from "react";
import { Gift, Trophy, Users } from "lucide-react";

import PageReveal from "@/components/atoms/PageReveal";
import { fetchPublicRaffle, type PublicRaffleData } from "@/lib/api";

const surfaceClassName =
  "rounded-[28px] border border-black/5 bg-white shadow-[0_18px_42px_rgba(116,82,82,0.08)]";

function RaffleSummary({ data }: { data: PublicRaffleData }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className={`${surfaceClassName} flex items-center gap-4 p-6`}>
        <div className="flex size-12 items-center justify-center rounded-full bg-[#fde6e6] text-accent-red">
          <Gift className="size-5" />
        </div>
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/85">
            Preise im Topf
          </p>
          <p className="mt-1 text-3xl font-semibold text-charcoal">
            {data.prizes.length}
          </p>
        </div>
      </div>
      <div className={`${surfaceClassName} flex items-center gap-4 p-6`}>
        <div className="flex size-12 items-center justify-center rounded-full bg-[#fde6e6] text-accent-red">
          <Users className="size-5" />
        </div>
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/85">
            Gewinner total
          </p>
          <p className="mt-1 text-3xl font-semibold text-charcoal">
            {data.totalWinners}
          </p>
        </div>
      </div>
    </div>
  );
}

function PublicPrizeCard({
  name,
  description,
  category,
  value,
  winnerCount,
  eligibilityLabel,
}: PublicRaffleData["prizes"][number]) {
  return (
    <article className={`${surfaceClassName} p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#fde6e6] text-accent-red">
          <Trophy className="size-6" strokeWidth={1.9} />
        </div>
        <span className="inline-flex rounded-full bg-[#fde6e6] px-3 py-1.5 text-xs font-semibold text-accent-red">
          {category}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-charcoal">
        {name}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-warm">{description}</p>
      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-[#f0e4e4] pt-4 text-sm">
        <div>
          <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-warm/80">
            Wert
          </dt>
          <dd className="mt-1 font-semibold text-charcoal tabular-nums">{value}</dd>
        </div>
        <div>
          <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-warm/80">
            Gewinner
          </dt>
          <dd className="mt-1 font-semibold text-charcoal tabular-nums">
            {winnerCount}
          </dd>
        </div>
        <div>
          <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-warm/80">
            Teilnahme
          </dt>
          <dd className="mt-1 font-medium text-charcoal">{eligibilityLabel}</dd>
        </div>
      </dl>
    </article>
  );
}

export default function PublicRafflePage() {
  const [data, setData] = useState<PublicRaffleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicRaffle()
      .then(setData)
      .catch(() => setError("Die Preisübersicht konnte nicht geladen werden."));
  }, []);

  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="mx-auto w-full max-w-5xl px-6 py-12 md:px-8">
        <PageReveal delay={0} variant="up">
          <header className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent-red">
              {data?.eventName ?? "Lottomatch"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
              Das gibt es zu gewinnen
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-warm">
              Eine Übersicht aller Preise unserer diesjährigen Verlosung.
            </p>
          </header>
        </PageReveal>

        {error ? (
          <p className="mt-8 rounded-2xl bg-white px-5 py-4 text-center text-sm font-medium text-accent-red shadow-[0_12px_28px_rgba(42,23,23,0.05)]">
            {error}
          </p>
        ) : null}

        {data ? (
          <>
            <div className="mt-10">
              <RaffleSummary data={data} />
            </div>

            {data.prizes.length === 0 ? (
              <p className="mt-10 rounded-2xl bg-white px-5 py-8 text-center text-sm text-muted-warm shadow-[0_12px_28px_rgba(42,23,23,0.05)]">
                Es sind noch keine Preise veröffentlicht.
              </p>
            ) : (
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {data.prizes.map((prize, index) => (
                  <PageReveal key={prize.id} delay={120 + index * 60} variant="up">
                    <PublicPrizeCard {...prize} />
                  </PageReveal>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
