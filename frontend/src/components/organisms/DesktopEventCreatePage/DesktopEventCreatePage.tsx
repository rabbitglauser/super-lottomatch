"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import {
  Building2,
  CalendarDays,
  Info,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import PageReveal from "@/components/atoms/PageReveal";
import { Button } from "@/components/ui/button";
import { createEvent } from "@/lib/api";
import { cn } from "@/lib/utils";

const upcomingRows = Array.from({ length: 3 }, (_, index) => index);

interface EventDayDraft {
  id: number;
  date: string;
  label: string;
}

let eventDayCounter = 0;

function createEmptyDay(): EventDayDraft {
  eventDayCounter += 1;
  return { id: eventDayCounter, date: "", label: "" };
}

interface SectionCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

function SectionCard({
  title,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-[2rem] bg-white p-6 shadow-[0_20px_45px_rgba(42,23,23,0.06)] sm:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[1.55rem] font-semibold tracking-[-0.03em] text-charcoal">
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) {
  const className =
    "mb-3 block text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-muted-warm/85";

  if (htmlFor) {
    return (
      <label htmlFor={htmlFor} className={className}>
        {children}
      </label>
    );
  }

  return <p className={className}>{children}</p>;
}

function SoftInput({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={cn(
        "h-14 w-full rounded-2xl border border-transparent bg-input-bg px-5 text-[0.95rem] font-medium text-charcoal outline-none transition placeholder:font-normal placeholder:text-input-text focus:border-accent-red/15 focus:ring-4 focus:ring-accent-red/10",
        className,
      )}
      {...props}
    />
  );
}

function SoftTextarea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-[130px] w-full resize-none rounded-2xl border border-transparent bg-input-bg px-5 py-4 text-[0.95rem] font-medium text-charcoal outline-none transition placeholder:font-normal placeholder:text-input-text focus:border-accent-red/15 focus:ring-4 focus:ring-accent-red/10",
        className,
      )}
      {...props}
    />
  );
}

function SectionAction({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 self-start rounded-full px-1 py-1 text-sm font-semibold text-accent-red transition hover:text-accent-red-dark"
    >
      <Plus className="size-4" />
      <span>{children}</span>
    </button>
  );
}

function EmptyStateBox({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-24 items-center justify-center rounded-[1.6rem] border border-dashed border-[#ead4d2] bg-[#fff8f8] px-5 py-6 text-center text-sm font-medium text-muted-warm",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PreviewCard() {
  return (
    <SectionCard title="Event Vorschau" className="p-6">
      <div className="relative overflow-hidden rounded-[1.85rem] bg-[#dce4e9] p-5">
        <Image
          src="/mountains.png"
          alt="Bergkulisse"
          fill
          className="object-cover object-center"
          sizes="(max-width: 1279px) 100vw, 30vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/10 to-white/55" />

        <div className="relative flex min-h-[280px] items-end">
          <div className="w-full rounded-[1.65rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_40px_rgba(116,132,143,0.18)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-red-soft text-accent-red">
                <Building2 className="size-5" />
              </div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-charcoal">
                Stewardship Core
              </p>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-red-soft text-accent-red">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-charcoal">
                  Gästeliste
                </p>
                <p className="mt-1 text-sm font-medium text-muted-warm">(0)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export default function DesktopEventCreatePage() {
  const [name, setName] = useState("");
  const [year, setYear] = useState("2026");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState<EventDayDraft[]>(() => [createEmptyDay()]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  const handleAddDay = () => {
    setDays((current) => [...current, createEmptyDay()]);
  };

  const handleRemoveDay = (id: number) => {
    setDays((current) => current.filter((day) => day.id !== id));
  };

  const handleDayChange = (
    id: number,
    field: "date" | "label",
    value: string,
  ) => {
    setDays((current) =>
      current.map((day) => (day.id === id ? { ...day, [field]: value } : day)),
    );
  };

  const handleCancel = () => {
    setName("");
    setYear("2026");
    setDescription("");
    setDays([createEmptyDay()]);
    setMessage(null);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const numericYear = Number(year);
    const validDays = days.filter((day) => day.date);

    if (!trimmedName) {
      setMessage({ tone: "error", text: "Bitte einen Event-Namen eingeben." });
      return;
    }

    if (!Number.isInteger(numericYear) || numericYear < 2000) {
      setMessage({ tone: "error", text: "Bitte ein gültiges Jahr eingeben." });
      return;
    }

    if (validDays.length === 0) {
      setMessage({
        tone: "error",
        text: "Bitte mindestens einen Event-Tag mit Datum hinzufügen.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const created = await createEvent({
        name: trimmedName,
        year: numericYear,
        days: validDays.map((day) => ({ date: day.date })),
      });

      setMessage({
        tone: "success",
        text: `Event "${created.name}" (${created.year}) mit ${created.dayCount} Tag(en) gespeichert.`,
      });
      setName("");
      setDescription("");
      setDays([createEmptyDay()]);
    } catch (error) {
      setMessage({
        tone: "error",
        text:
          error instanceof Error && error.message
            ? error.message
            : "Event konnte nicht gespeichert werden.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="w-full px-6 py-8 md:px-8 xl:px-10 xl:py-10">
        <PageReveal delay={0} variant="up">
          <header>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-charcoal sm:text-[3.3rem]">
              Event erstellen
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-warm sm:text-lg">
              Konfigurieren Sie Ihr neues Lottomatch Event mit präzisen Details.
            </p>
          </header>
        </PageReveal>

        <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,2.18fr)_minmax(320px,1fr)] xl:items-start">
          <div className="space-y-8">
            <PageReveal delay={160} variant="left">
              <SectionCard title="Basisinformationen">
                <div className="space-y-6">
                  <div>
                    <FieldLabel htmlFor="event-name">Event Name</FieldLabel>
                    <SoftInput
                      id="event-name"
                      name="event-name"
                      placeholder="z.B. STV Frühjahrshilfe 2026"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <FieldLabel htmlFor="year">Jahr</FieldLabel>
                      <SoftInput
                        id="year"
                        name="year"
                        value={year}
                        onChange={(event) => setYear(event.target.value)}
                        inputMode="numeric"
                      />
                    </div>

                    <div>
                      <FieldLabel>Status</FieldLabel>
                      <div className="flex h-14 items-center gap-3 rounded-2xl bg-input-bg px-5 text-[0.95rem] font-medium text-charcoal">
                        <span className="size-2.5 rounded-full bg-accent-red" />
                        <span>Planung</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <FieldLabel htmlFor="description">Beschreibung</FieldLabel>
                    <SoftTextarea
                      id="description"
                      name="description"
                      placeholder="Beschreiben Sie das Event, die Ziele und besondere Merkmale..."
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </div>
                </div>
              </SectionCard>
            </PageReveal>

            <PageReveal delay={260} variant="left">
              <SectionCard
                title="Event-Tage hinzufügen"
                action={
                  <SectionAction onClick={handleAddDay}>
                    Tag hinzufügen
                  </SectionAction>
                }
              >
                {days.length === 0 ? (
                  <EmptyStateBox>Keine Tage festgelegt</EmptyStateBox>
                ) : (
                  <div className="space-y-4">
                    {days.map((day) => (
                      <div
                        key={day.id}
                        className="rounded-[1.75rem] bg-[#fdf2f2] p-5"
                      >
                        <div className="grid gap-4 md:grid-cols-[minmax(0,0.95fr)_1px_minmax(0,1.05fr)_auto] md:items-end">
                          <div>
                            <FieldLabel>Datum</FieldLabel>
                            <SoftInput
                              type="date"
                              aria-label="Event-Tag Datum"
                              value={day.date}
                              onChange={(event) =>
                                handleDayChange(day.id, "date", event.target.value)
                              }
                            />
                          </div>

                          <div className="hidden h-full w-px bg-[#eadede] md:block" />

                          <div className="border-t border-[#eadede] pt-4 md:border-0 md:pt-0">
                            <FieldLabel>Bezeichnung</FieldLabel>
                            <SoftInput
                              aria-label="Event-Tag Bezeichnung"
                              placeholder="z.B. Eröffnung"
                              value={day.label}
                              onChange={(event) =>
                                handleDayChange(day.id, "label", event.target.value)
                              }
                            />
                          </div>

                          <button
                            type="button"
                            aria-label="Tag entfernen"
                            onClick={() => handleRemoveDay(day.id)}
                            className="inline-flex size-11 items-center justify-center justify-self-end rounded-2xl bg-white text-accent-red shadow-[0_10px_24px_rgba(220,31,45,0.12)] transition hover:bg-accent-red hover:text-white"
                          >
                            <Trash2 className="size-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex items-center gap-2 text-sm text-muted-warm">
                  <CalendarDays className="size-4 text-accent-red" />
                  <span>
                    Start- und Enddatum werden automatisch aus den Tagen
                    übernommen.
                  </span>
                </div>
              </SectionCard>
            </PageReveal>
          </div>

          <aside className="space-y-6">
            <PageReveal delay={200} variant="right">
              <PreviewCard />
            </PageReveal>

            <PageReveal delay={300} variant="right">
              <div className="space-y-4">
                {message ? (
                  <p
                    className={cn(
                      "rounded-2xl px-5 py-4 text-sm font-medium",
                      message.tone === "success"
                        ? "bg-[#e7f6ec] text-[#1f7a44]"
                        : "bg-[#fdecec] text-accent-red",
                    )}
                  >
                    {message.text}
                  </p>
                ) : null}

                <Button
                  className="h-[58px] w-full rounded-[1.35rem] bg-gradient-to-r from-[#f03a49] to-[#b90f1d] text-base font-semibold text-white shadow-[0_20px_40px_rgba(220,31,45,0.26)] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Speichern..." : "Speichern"}
                </Button>

                <Button
                  variant="secondary"
                  className="h-[58px] w-full rounded-[1.35rem] border-0 bg-[#f5e8e8] text-base font-semibold text-charcoal hover:bg-[#efdddd]"
                  type="button"
                  onClick={handleCancel}
                >
                  Abbrechen
                </Button>
              </div>
            </PageReveal>

            <PageReveal delay={380} variant="right">
              <section className="rounded-[2rem] bg-[#fff1f1] p-6 shadow-[0_18px_40px_rgba(42,23,23,0.05)]">
                <div className="flex gap-4">
                  <div className="w-1 rounded-full bg-accent-red" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-accent-red shadow-[0_10px_24px_rgba(220,31,45,0.08)]">
                        <Info className="size-5" />
                      </div>
                      <h3 className="text-xl font-semibold tracking-[-0.02em] text-charcoal">
                        Hilfe-Center
                      </h3>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-muted-warm">
                      Benötigen Sie Hilfe beim Einrichten Ihres Lottomatch Events?
                      Unser Team steht Ihnen zur Verfügung.
                    </p>
                  </div>
                </div>
              </section>
            </PageReveal>
          </aside>
        </div>

        <PageReveal delay={460} variant="up">
          <SectionCard title="Anstehende Events" className="mt-8">
            <div className="space-y-4">
              {upcomingRows.map((row) => (
                <EmptyStateBox key={row}>Keine anstehende Events</EmptyStateBox>
              ))}
            </div>
          </SectionCard>
        </PageReveal>
      </div>
    </div>
  );
}
