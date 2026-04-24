import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  ChartColumn,
  Monitor,
  QrCode,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";

import { GLSLHills } from "@/components/glsl-hills";
import { cn } from "@/lib/utils";

import LandingHeader from "./LandingHeader";

const featureCards = [
  {
    title: "Gästeverwaltung",
    description: "Gästelisten, Gruppen und Kommunikation zentral steuern.",
    icon: Users,
  },
  {
    title: "Check-in & Zugang",
    description: "Schnelle Check-ins mit QR-Codes und Gästelisten.",
    icon: QrCode,
  },
  {
    title: "Event-Abläufe",
    description: "Zeitpläne, Programmpunkte und Ressourcen im Blick behalten.",
    icon: CalendarClock,
  },
  {
    title: "Auswertungen",
    description: "Echtzeit-Insights für bessere Entscheidungen.",
    icon: ChartColumn,
  },
] as const;

interface LandingLinkProps {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
  variant: "primary" | "secondary";
}

function LandingLink({ href, icon: Icon, children, variant }: LandingLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-[58px] items-center justify-center gap-3 rounded-[1.15rem] px-6 text-sm font-semibold transition duration-200 sm:text-base",
        variant === "primary"
          ? "bg-gradient-to-r from-[#ef3543] to-[#b90f1d] text-white shadow-[0_20px_40px_rgba(220,31,45,0.24)] hover:-translate-y-0.5 hover:shadow-[0_26px_48px_rgba(220,31,45,0.3)]"
          : "border border-[#f3d9d9] bg-white/82 text-accent-red shadow-[0_14px_28px_rgba(42,23,23,0.05)] backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_20px_36px_rgba(42,23,23,0.09)]",
      )}
    >
      <Icon className="size-4.5 shrink-0" strokeWidth={2} />
      <span>{children}</span>
    </Link>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-[1.35rem] bg-[rgba(255,255,255,0.82)] px-4 py-4 shadow-[0_18px_30px_rgba(42,23,23,0.05)] ring-1 ring-white/65 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_24px_38px_rgba(42,23,23,0.09)] sm:px-5 sm:py-[1.125rem]">
      <div className="flex size-9 items-center justify-center rounded-xl bg-[#fde6e6] text-accent-red sm:size-10">
        <Icon className="size-4.5" strokeWidth={2} />
      </div>

      <h3 className="mt-3.5 text-[0.95rem] font-semibold tracking-[-0.02em] text-charcoal sm:text-[0.98rem]">
        {title}
      </h3>
      <p className="mt-2 text-[0.82rem] leading-5 text-muted-warm sm:text-[0.84rem]">
        {description}
      </p>
    </article>
  );
}

export default function DesktopLandingPage() {
  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-page-dashboard text-charcoal">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-x-0 bottom-[4%] h-[76%] opacity-80 sm:bottom-[2%] sm:h-[80%] lg:bottom-0 lg:h-[84%]">
          <GLSLHills
            width="100%"
            height="100%"
            cameraZ={115}
            speed={0.5}
            color="#ba8f93"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,238,238,0.97)_0%,rgba(248,238,238,0.9)_18%,rgba(248,238,238,0.6)_42%,rgba(248,238,238,0.18)_68%,rgba(248,238,238,0.05)_100%)]" />
        <div className="absolute bottom-[-18%] left-[-16%] h-[48%] w-[54%] bg-[radial-gradient(circle_at_center,rgba(223,38,52,0.14),rgba(223,38,52,0.05)_42%,rgba(248,238,238,0)_72%)] blur-2xl" />
        <div className="absolute bottom-[-20%] right-[-18%] h-[52%] w-[52%] bg-[radial-gradient(circle_at_center,rgba(184,0,18,0.12),rgba(223,38,52,0.04)_40%,rgba(248,238,238,0)_72%)] blur-2xl" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col">
        <LandingHeader />

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pb-5 sm:px-8 sm:pb-6 md:pb-7 lg:px-10 lg:pb-8">
          <div className="flex flex-1 items-center justify-center pt-2 sm:pt-4 lg:pt-6">
          <section className="mx-auto w-full max-w-5xl text-center">
            <div className="space-y-5 sm:space-y-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.4em] text-accent-red/85 sm:text-[0.72rem]">
                SUPERLOTTOMATCH
              </p>

              <h1 className="font-semibold leading-[0.95] tracking-[-0.055em] text-4xl sm:text-5xl md:text-6xl lg:text-[5.2rem]">
                <span className="block text-3xl font-thin italic tracking-[-0.04em] text-charcoal/92 sm:text-4xl md:text-5xl lg:text-6xl">
                  Events That Feel
                </span>
                <span className="mt-2 block text-balance">
                  Bigger Than Spreadsheets
                </span>
              </h1>

              <p className="mx-auto max-w-[22rem] text-sm leading-7 text-muted-warm sm:max-w-2xl sm:text-base md:max-w-3xl">
                SuperLottomatch brings guest management, imports, check-ins and
                prize moments into one polished event flow that feels clear,
                fast and memorable.
              </p>
            </div>

            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <LandingLink href="/login" icon={Monitor} variant="primary">
                Zur Desktop-Version
              </LandingLink>
              <LandingLink href="/mobile" icon={Smartphone} variant="secondary">
                Zur mobilen Version
              </LandingLink>
            </div>
          </section>
          </div>

          <div className="w-full pb-2 sm:pb-3">
            <section
              id="features"
              className="mx-auto grid w-full max-w-6xl gap-5 sm:gap-6 md:grid-cols-2 lg:gap-7 xl:grid-cols-4 xl:gap-8"
            >
              {featureCards.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                />
              ))}
            </section>

            <div className="mt-9 flex items-center justify-center gap-2 text-sm font-medium text-muted-warm sm:mt-10">
              <ShieldCheck
                className="size-4.5 text-accent-red"
                strokeWidth={2}
              />
              <span>Sicher. Zuverlässig. DSGVO-konform.</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
