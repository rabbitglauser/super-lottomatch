"use client";

import { useEffect, useState } from "react";
import { Copy, ShieldCheck, Sparkles } from "lucide-react";

import PageReveal from "@/components/atoms/PageReveal";
import {
  enrichGuest,
  fetchAiSettings,
  fetchDuplicates,
  type AiSettings,
  type DuplicatePair,
  type EnrichmentSuggestion,
} from "@/lib/api";

const surfaceClassName =
  "rounded-[28px] border border-black/5 bg-white shadow-[0_18px_42px_rgba(116,82,82,0.08)]";

function confidenceTone(confidence: number) {
  if (confidence >= 85) return "bg-[#fde6e6] text-accent-red";
  if (confidence >= 75) return "bg-[#fff0dc] text-[#ad6a18]";
  return "bg-[#efebeb] text-muted-warm";
}

function GuestColumn({
  name,
  email,
  city,
}: {
  name: string;
  email: string | null;
  city: string | null;
}) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-[#f0e4e4] bg-[#fffdfd] p-4">
      <p className="truncate text-base font-semibold text-charcoal">{name}</p>
      <p className="mt-1 truncate text-sm text-muted-warm">
        {email ?? "Keine E-Mail"}
      </p>
      <p className="mt-1 truncate text-sm text-muted-warm">{city ?? "—"}</p>
    </div>
  );
}

function PairCard({
  pair,
  settings,
  onMerge,
}: {
  pair: DuplicatePair;
  settings: AiSettings | null;
  onMerge: (pair: DuplicatePair) => void;
}) {
  const [suggestion, setSuggestion] = useState<EnrichmentSuggestion | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const handleEnrich = async () => {
    setBusy(true);
    setNote(null);
    try {
      const result = await enrichGuest(pair.left.id, true);
      if (result.suggestion) {
        setSuggestion(result.suggestion);
      } else {
        setNote(result.message ?? "Keine Anreicherung verfügbar.");
      }
    } catch {
      setNote("Anreicherung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`${surfaceClassName} p-5 sm:p-6`}>
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${confidenceTone(
            pair.confidence,
          )}`}
        >
          {pair.confidence}% Übereinstimmung
        </span>
        <div className="flex flex-wrap gap-1.5">
          {pair.reasons.map((reason) => (
            <span
              key={reason}
              className="rounded-full bg-[#f4f1ea] px-2.5 py-1 text-[0.68rem] font-medium text-muted-warm"
            >
              {reason}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <GuestColumn {...pair.left} />
        <div className="flex items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-warm/70">
          vs
        </div>
        <GuestColumn {...pair.right} />
      </div>

      {suggestion ? (
        <p className="mt-4 rounded-2xl bg-[#f4f1ea] px-4 py-3 text-sm text-charcoal">
          KI-Vorschlag: {suggestion.organization ?? "—"} ·{" "}
          {suggestion.country ?? "—"} ({suggestion.confidence}%)
        </p>
      ) : null}
      {note ? (
        <p className="mt-3 text-sm text-muted-warm">{note}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onMerge(pair)}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#df2634_0%,#b80012_100%)] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(223,38,52,0.24)] transition hover:opacity-95"
        >
          <Copy className="size-4" />
          Zusammenführen vorschlagen
        </button>
        {settings?.enrichmentEnabled ? (
          <button
            type="button"
            onClick={handleEnrich}
            disabled={busy}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#eadede] bg-white px-5 text-sm font-semibold text-charcoal transition hover:bg-[#fff7f7] disabled:opacity-60"
          >
            <Sparkles className="size-4 text-accent-red" />
            {busy ? "Anreichern…" : "KI-Anreicherung"}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default function DesktopDuplicatesPage() {
  const [pairs, setPairs] = useState<DuplicatePair[]>([]);
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [merged, setMerged] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchDuplicates(), fetchAiSettings()])
      .then(([duplicates, aiSettings]) => {
        setPairs(duplicates.pairs);
        setSettings(aiSettings);
      })
      .catch(() => setError("Duplikate konnten nicht geladen werden."))
      .finally(() => setLoaded(true));
  }, []);

  const handleMerge = (pair: DuplicatePair) => {
    setMerged(`${pair.left.name} ↔ ${pair.right.name}`);
  };

  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="w-full px-6 py-8 md:px-8 xl:px-10 xl:py-10">
        <PageReveal delay={0} variant="up">
          <header>
            <h1 className="text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
              Duplikate
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-warm sm:text-lg">
              Mögliche doppelte Gäste mit Konfidenzwert. Prüfen und zusammenführen.
            </p>
          </header>
        </PageReveal>

        <PageReveal delay={120} variant="up">
          <div
            className={`${surfaceClassName} mt-6 flex items-center gap-3 p-4 sm:p-5`}
          >
            <ShieldCheck className="size-5 text-accent-red" />
            <p className="text-sm text-muted-warm">
              {settings?.enrichmentEnabled
                ? `KI-Anreicherung aktiv (${settings.model}). Geteilt: ${settings.sharedFields.join(
                    ", ",
                  )}.`
                : "KI-Anreicherung ist deaktiviert. Erkennung läuft vollständig lokal."}
            </p>
          </div>
        </PageReveal>

        {error ? (
          <p className="mt-6 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-accent-red shadow-[0_12px_28px_rgba(42,23,23,0.05)]">
            {error}
          </p>
        ) : null}
        {merged ? (
          <p className="mt-6 rounded-2xl bg-[#f4f1ea] px-5 py-4 text-sm font-medium text-charcoal">
            Zusammenführung vorgemerkt: {merged}
          </p>
        ) : null}

        {loaded && !error && pairs.length === 0 ? (
          <p className="mt-8 rounded-2xl bg-white px-5 py-8 text-center text-sm text-muted-warm shadow-[0_12px_28px_rgba(42,23,23,0.05)]">
            Keine möglichen Duplikate gefunden.
          </p>
        ) : (
          <div className="mt-8 grid gap-5">
            {pairs.map((pair, index) => (
              <PageReveal
                key={`${pair.left.id}-${pair.right.id}`}
                delay={160 + index * 60}
                variant="up"
              >
                <PairCard pair={pair} settings={settings} onMerge={handleMerge} />
              </PageReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
