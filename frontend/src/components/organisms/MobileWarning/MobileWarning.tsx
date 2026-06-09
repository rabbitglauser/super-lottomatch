import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Clock3,
  MapPin,
} from "lucide-react";
import {
  MobileCard,
  MobileHeader,
  MobileShell,
} from "@/components/organisms/MobileShell";

export default function MobileWarning() {
  return (
    <MobileShell activeTab="checkin">
      <MobileHeader />

      <section className="flex flex-1 flex-col px-6 pb-32 pt-10 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#fff0f1] text-[#df2634]">
          <AlertTriangle size={50} fill="currentColor" />
        </div>

        <h1 className="mt-8 text-4xl font-extrabold tracking-[-0.04em]">
          Warnung
        </h1>

        <div className="mx-auto mt-3 rounded-lg border border-[#ffb3bb] bg-[#ffe8eb] px-5 py-2 text-sm font-bold text-[#df2634]">
          Achtung: Gast bereits eingecheckt!
        </div>

        <MobileCard className="mt-8 p-6 text-left">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-[radial-gradient(circle,#e8d5c9_0%,#6b7a6c_100%)]" />

            <div>
              <h2 className="text-2xl font-extrabold">
                Herr. Claudio Hübscher
              </h2>
              <p className="text-sm text-[#5b484b]">
                User Code · ID: #882-AF
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <InfoRow
              icon={<Clock3 size={26} />}
              label="Erster Check-in heute"
              value="08:42 Uhr"
            />

            <InfoRow
              icon={<MapPin size={26} />}
              label="Station"
              value="Haupteingang West"
            />
          </div>
        </MobileCard>

        <Link
          href="/mobile/scanner/success"
          className="mt-6 flex h-16 items-center justify-center rounded-[1.1rem] bg-gradient-to-r from-[#df2634] to-[#b90f1d] text-lg font-extrabold uppercase text-white shadow-[0_18px_34px_rgba(220,31,45,0.22)]"
        >
          Check-in trotzdem bestätigen
        </Link>

        <Link
          href="/mobile/scanner"
          className="mt-4 flex h-16 items-center justify-center rounded-[1.1rem] bg-[#eee4e3] text-lg font-extrabold text-[#231f20]"
        >
          Abbrechen
        </Link>

        <p className="mx-auto mt-8 max-w-[320px] text-sm leading-6 text-[#6f5a5d]">
          Hinweis: Dies kann vorkommen, wenn der Gast das Gelände kurzzeitig
          verlassen hat oder die Karte versehentlich doppelt gescannt wurde.
        </p>
      </section>
    </MobileShell>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#fff0f1] p-4">
      <div className="flex items-center gap-3 text-[#df2634]">
        {icon}
        <span className="text-sm font-semibold text-[#5b484b]">{label}</span>
      </div>

      <span className="text-base font-extrabold text-[#df2634]">{value}</span>
    </div>
  );
}