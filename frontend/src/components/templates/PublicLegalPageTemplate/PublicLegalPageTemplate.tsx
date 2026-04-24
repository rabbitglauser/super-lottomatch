import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Building2,
  Clock3,
  Database,
  FileText,
  Info,
  Mail,
  Scale,
  ServerCog,
  ShieldCheck,
} from "lucide-react";

import DesktopFooter from "@/components/organisms/DesktopFooter";
import type { LegalPageContent, LegalSectionIcon } from "@/lib/legal-content";

const sectionIcons: Record<LegalSectionIcon, LucideIcon> = {
  building: Building2,
  contact: Mail,
  shield: ShieldCheck,
  file: FileText,
  database: Database,
  server: ServerCog,
  scale: Scale,
  clock: Clock3,
};

interface PublicLegalPageTemplateProps {
  content: LegalPageContent;
}

export default function PublicLegalPageTemplate({
  content,
}: PublicLegalPageTemplateProps) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-page-dashboard px-6 py-8 text-charcoal sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-8%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(223,38,52,0.12),rgba(223,38,52,0)_68%)] blur-3xl" />
        <div className="absolute bottom-[-18%] right-[-8%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(184,0,18,0.08),rgba(184,0,18,0)_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-warm transition hover:text-accent-red"
          >
            <ArrowLeft className="size-4.5" strokeWidth={2} />
            Zur Startseite
          </Link>

          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#f2dede] bg-white/78 px-5 text-sm font-semibold text-accent-red shadow-[0_10px_24px_rgba(223,38,52,0.08)] transition hover:-translate-y-0.5 hover:bg-white"
          >
            Zur Anmeldung
          </Link>
        </div>

        <section className="mt-6 rounded-[2rem] bg-[rgba(255,255,255,0.86)] px-6 py-7 shadow-[0_24px_60px_rgba(42,23,23,0.08)] ring-1 ring-white/70 backdrop-blur-sm sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-accent-red/85">
                {content.eyebrow}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-charcoal sm:text-5xl">
                {content.title}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-warm sm:text-base">
                {content.subtitle}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#fde6e6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent-red">
              <ShieldCheck className="size-4" strokeWidth={2} />
              <span>{content.badge}</span>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[1.8rem] border border-[#f3d4d7] bg-[linear-gradient(135deg,rgba(252,228,230,0.92),rgba(255,248,248,0.88))] px-6 py-6 shadow-[0_18px_36px_rgba(42,23,23,0.05)]">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/75 text-accent-red">
              <Info className="size-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-[-0.03em] text-charcoal">
                {content.noticeTitle}
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-warm sm:text-[0.95rem]">
                {content.noticeText}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          {content.sections.map((section) => {
            const Icon = sectionIcons[section.icon];

            return (
              <article
                key={section.title}
                className="rounded-[1.75rem] bg-[rgba(255,255,255,0.88)] px-6 py-6 shadow-[0_20px_40px_rgba(42,23,23,0.06)] ring-1 ring-white/70 backdrop-blur-sm sm:px-7"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#fde6e6] text-accent-red">
                    <Icon className="size-5" strokeWidth={2} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold tracking-[-0.03em] text-charcoal">
                      {section.title}
                    </h2>

                    {section.paragraphs?.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="mt-3 text-sm leading-7 text-muted-warm sm:text-[0.95rem]"
                      >
                        {paragraph}
                      </p>
                    ))}

                    {section.items?.length ? (
                      <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-warm sm:text-[0.95rem]">
                        {section.items.map((item) => (
                          <li key={item} className="flex gap-3">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-red/70" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <DesktopFooter className="mt-10 sm:mt-12" />
      </div>
    </main>
  );
}
