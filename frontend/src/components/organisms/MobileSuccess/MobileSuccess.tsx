import Link from "next/link";
import type { ReactNode } from "react";
import { Award, Check, Star, User, UserPlus } from "lucide-react";
import {
  MobileCard,
  MobileShell,
} from "@/components/organisms/MobileShell";

export default function MobileSuccess() {
  return (
    <MobileShell activeTab="checkin">
      <section className="flex flex-1 flex-col px-6 pb-32 pt-14 text-center">
        <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-[#f9dfe2]">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f4b9c0]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#df2634] text-white">
              <Check size={34} strokeWidth={4} />
            </div>
          </div>
        </div>

        <p className="mt-14 text-sm font-extrabold uppercase tracking-[0.35em] text-[#5b484b]">
          Erfolg
        </p>

        <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.04em] text-[#df2634]">
          Check-in erfolgreich!
        </h1>

        <MobileCard className="mt-14 px-6 py-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ffe9eb] text-[#df2634]">
            <User size={30} />
          </div>

          <h2 className="mt-6 text-3xl font-extrabold">Samuel Glauser</h2>

          <div className="mx-auto mt-4 flex w-fit items-center gap-3 rounded-full bg-[#f3eeee] px-6 py-3">
            <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#5b484b]">
              Gast-Code
            </span>
            <span className="text-xl font-extrabold text-[#df2634]">
              SL-8821
            </span>
          </div>
        </MobileCard>

        <div className="mt-5 grid grid-cols-2 gap-4 text-left">
          <InfoCard
            icon={<Star size={24} fill="currentColor" />}
            label="Status"
            value="Zweite Teilnahme"
          />

          <InfoCard
            icon={<Award size={24} fill="currentColor" />}
            label="Tickets"
            value="2 Lose insgesamt"
          />
        </div>

        <Link
          href="/mobile/scanner"
          className="mt-14 flex h-20 items-center justify-center gap-4 rounded-[1.2rem] bg-gradient-to-r from-[#df2634] to-[#b90f1d] text-xl font-extrabold text-white shadow-[0_18px_34px_rgba(220,31,45,0.22)]"
        >
          <UserPlus size={30} />
          Nächster Gast
        </Link>

        <Link
          href="/mobile"
          className="mt-10 text-sm font-extrabold uppercase tracking-[0.25em] text-[#5b484b]"
        >
          Details ansehen
        </Link>
      </section>
    </MobileShell>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <MobileCard className="bg-[#fff0f1] p-5">
      <div className="text-[#df2634]">{icon}</div>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.15em] text-[#5b484b]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </MobileCard>
  );
}