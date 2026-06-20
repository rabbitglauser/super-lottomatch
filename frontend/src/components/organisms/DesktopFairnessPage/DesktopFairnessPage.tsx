"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Lightbulb, Scale } from "lucide-react";

import PageReveal from "@/components/atoms/PageReveal";
import ProgressBar from "@/components/atoms/ProgressBar";
import { fetchFairness, type FairnessData } from "@/lib/api";

const surfaceClassName =
  "rounded-[28px] border border-black/5 bg-white shadow-[0_18px_42px_rgba(116,82,82,0.08)]";

function scoreTone(score: number) {
  if (score >= 95) return "text-accent-red";
  if (score >= 80) return "text-[#ad6a18]";
  return "text-[#b80012]";
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default function DesktopFairnessPage() {
  const [winnerCount, setWinnerCount] = useState(1);
  const [data, setData] = useState<FairnessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (winners: number) => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchFairness(winners));
    } catch {
      setError("Fairness-Analyse konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run(1);
  }, [run]);

  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="w-full px-6 py-8 md:px-8 xl:px-10 xl:py-10">
        <PageReveal delay={0} variant="up">
          <header>
            <h1 className="text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
              Fairness-Analyse
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-warm sm:text-lg">
              Monte-Carlo-Simulation der Verlosung zur Erkennung von Verzerrungen.
            </p>
          </header>
        </PageReveal>

        <PageReveal delay={120} variant="up">
          <div
            className={`${surfaceClassName} mt-6 flex flex-wrap items-end gap-4 p-5 sm:p-6`}
          >
            <label className="flex flex-col gap-2 text-sm font-medium text-charcoal">
              Anzahl Gewinner
              <input
                type="number"
                min={1}
                value={winnerCount}
                onChange={(event) =>
                  setWinnerCount(Math.max(1, Number(event.target.value) || 1))
                }
                className="h-12 w-32 rounded-2xl border border-[#eadede] bg-[#fffdfd] px-4 text-sm text-charcoal outline-none focus:border-accent-red/25 focus:ring-4 focus:ring-accent-red/10"
              />
            </label>
            <button
              type="button"
              onClick={() => run(winnerCount)}
              disabled={loading}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#df2634_0%,#b80012_100%)] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(223,38,52,0.24)] transition hover:opacity-95 disabled:opacity-60"
            >
              <Scale className="size-4" />
              {loading ? "Simuliere…" : "Simulieren"}
            </button>
          </div>
        </PageReveal>

        {error ? (
          <p className="mt-6 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-accent-red shadow-[0_12px_28px_rgba(42,23,23,0.05)]">
            {error}
          </p>
        ) : null}

        {data ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
            <PageReveal delay={200} variant="left">
              <section className={`${surfaceClassName} p-5 sm:p-6`}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/85">
                      Fairness Score
                    </p>
                    <p
                      className={`mt-2 text-[3rem] font-semibold leading-none ${scoreTone(
                        data.fairnessScore,
                      )}`}
                    >
                      {data.fairnessScore}
                    </p>
                  </div>
                  <p className="text-sm text-muted-warm">
                    {data.runs.toLocaleString("de-CH")} Simulationen ·{" "}
                    {data.participantCount} Teilnehmende
                  </p>
                </div>
                <ProgressBar
                  value={data.fairnessScore}
                  className="mt-4 h-2 bg-[#f4e5e6]"
                />

                <div className="mt-6 overflow-hidden rounded-2xl border border-[#f0e4e4]">
                  <div className="grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] gap-2 border-b border-[#f0e4e4] bg-[#fffdfd] px-4 py-3 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted-warm/80">
                    <span>Gruppe</span>
                    <span>Erwartet</span>
                    <span>Beobachtet</span>
                    <span>Abweichung</span>
                  </div>
                  {data.groups.map((group) => (
                    <div
                      key={group.group}
                      className="grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] gap-2 border-b border-[#f0e4e4] px-4 py-3 text-sm last:border-b-0"
                    >
                      <span className="truncate font-medium text-charcoal">
                        {group.group}
                        {group.flagged ? (
                          <AlertTriangle className="ml-1 inline size-3.5 text-[#ad6a18]" />
                        ) : null}
                      </span>
                      <span className="tabular-nums text-muted-warm">
                        {percent(group.expectedShare)}
                      </span>
                      <span className="tabular-nums text-muted-warm">
                        {percent(group.observedShare)}
                      </span>
                      <span
                        className={`tabular-nums ${
                          group.flagged ? "font-semibold text-[#b80012]" : "text-muted-warm"
                        }`}
                      >
                        {percent(group.deviation)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </PageReveal>

            <PageReveal delay={280} variant="right">
              <section className={`${surfaceClassName} p-5 sm:p-6`}>
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-4 text-accent-red" />
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/85">
                    Empfehlungen
                  </p>
                </div>
                <ul className="mt-4 space-y-3">
                  {data.recommendations.map((tip) => (
                    <li
                      key={tip}
                      className="rounded-2xl bg-[#f4f1ea] px-4 py-3 text-sm leading-6 text-charcoal"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
                {data.edgeCases.length > 0 ? (
                  <div className="mt-5">
                    <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted-warm/80">
                      Auffälligkeiten
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-warm">
                      {data.edgeCases.map((edge) => (
                        <li key={edge}>• {edge}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            </PageReveal>
          </div>
        ) : null}
      </div>
    </div>
  );
}
