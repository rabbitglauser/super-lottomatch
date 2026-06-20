"use client";

import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";

import PageReveal from "@/components/atoms/PageReveal";
import {
  draftSupportReply,
  recordSupportMessage,
  type SupportMessageInput,
} from "@/lib/api";

const surfaceClassName =
  "rounded-[28px] border border-black/5 bg-white shadow-[0_18px_42px_rgba(116,82,82,0.08)]";

export default function DesktopSupportAssistantPage() {
  const [inquiry, setInquiry] = useState("");
  const [guestCode, setGuestCode] = useState("");
  const [reply, setReply] = useState("");
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleDraft = async () => {
    if (!inquiry.trim()) return;
    setBusy(true);
    setStatus(null);
    try {
      const result = await draftSupportReply(inquiry, guestCode || undefined);
      if (result.enabled && result.draft) {
        setAiDraft(result.draft);
        setReply(result.draft);
      } else {
        setStatus(result.message ?? "KI-Entwürfe sind deaktiviert.");
      }
    } catch {
      setStatus("Entwurf konnte nicht erstellt werden.");
    } finally {
      setBusy(false);
    }
  };

  const resolveSource = (): SupportMessageInput["source"] => {
    if (aiDraft === null) return "human";
    return reply.trim() === aiDraft.trim() ? "ai" : "edited";
  };

  const handleSend = async () => {
    if (!reply.trim() || !inquiry.trim()) return;
    setBusy(true);
    setStatus(null);
    const source = resolveSource();
    try {
      const result = await recordSupportMessage({
        inquiry,
        finalText: reply,
        source,
        guestCode: guestCode || undefined,
      });
      setStatus(
        `Gesendet und protokolliert (#${result.id}, Quelle: ${result.source}).`,
      );
      setInquiry("");
      setReply("");
      setGuestCode("");
      setAiDraft(null);
    } catch {
      setStatus("Nachricht konnte nicht protokolliert werden.");
    } finally {
      setBusy(false);
    }
  };

  const sourceLabel =
    aiDraft === null
      ? "Manuell verfasst"
      : reply.trim() === aiDraft.trim()
        ? "KI-Entwurf (unverändert)"
        : "KI-Entwurf (bearbeitet)";

  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="w-full px-6 py-8 md:px-8 xl:px-10 xl:py-10">
        <PageReveal delay={0} variant="up">
          <header>
            <h1 className="text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
              Support-Assistent
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-warm sm:text-lg">
              KI-gestützte Antwortentwürfe – mit menschlicher Freigabe und
              Protokollierung.
            </p>
          </header>
        </PageReveal>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <PageReveal delay={120} variant="left">
            <section className={`${surfaceClassName} p-5 sm:p-6`}>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/85">
                Anfrage des Gastes
              </p>
              <input
                type="text"
                value={guestCode}
                onChange={(event) => setGuestCode(event.target.value)}
                placeholder="Gast-Code (optional)"
                className="mt-4 h-12 w-full rounded-2xl border border-[#eadede] bg-[#fffdfd] px-4 text-sm text-charcoal outline-none focus:border-accent-red/25 focus:ring-4 focus:ring-accent-red/10"
              />
              <textarea
                value={inquiry}
                onChange={(event) => setInquiry(event.target.value)}
                placeholder="Frage des Gastes eingeben…"
                rows={8}
                className="mt-3 w-full rounded-2xl border border-[#eadede] bg-[#fffdfd] p-4 text-sm text-charcoal outline-none focus:border-accent-red/25 focus:ring-4 focus:ring-accent-red/10"
              />
              <button
                type="button"
                onClick={handleDraft}
                disabled={busy || !inquiry.trim()}
                className="mt-4 inline-flex h-12 items-center gap-2 rounded-2xl border border-[#eadede] bg-white px-5 text-sm font-semibold text-charcoal transition hover:bg-[#fff7f7] disabled:opacity-60"
              >
                <Sparkles className="size-4 text-accent-red" />
                {busy ? "Erstelle…" : "KI-Entwurf erstellen"}
              </button>
            </section>
          </PageReveal>

          <PageReveal delay={200} variant="right">
            <section className={`${surfaceClassName} p-5 sm:p-6`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-warm/85">
                  Antwort
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f1ea] px-3 py-1 text-[0.68rem] font-medium text-muted-warm">
                  <Bot className="size-3.5 text-accent-red" />
                  {sourceLabel}
                </span>
              </div>
              <textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Antwort verfassen oder KI-Entwurf bearbeiten…"
                rows={11}
                className="mt-4 w-full rounded-2xl border border-[#eadede] bg-[#fffdfd] p-4 text-sm leading-6 text-charcoal outline-none focus:border-accent-red/25 focus:ring-4 focus:ring-accent-red/10"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={busy || !reply.trim() || !inquiry.trim()}
                className="mt-4 inline-flex h-12 items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#df2634_0%,#b80012_100%)] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(223,38,52,0.24)] transition hover:opacity-95 disabled:opacity-60"
              >
                <Send className="size-4" />
                Senden &amp; protokollieren
              </button>
            </section>
          </PageReveal>
        </div>

        {status ? (
          <p className="mt-6 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-charcoal shadow-[0_12px_28px_rgba(42,23,23,0.05)]">
            {status}
          </p>
        ) : null}
      </div>
    </div>
  );
}
