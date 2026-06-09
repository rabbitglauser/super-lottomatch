import Link from "next/link";
import {
  CheckCircle,
  Search,
} from "lucide-react";
import {
  MobileCard,
  MobileHeader,
  MobileShell,
} from "@/components/organisms/MobileShell";

export default function MobileSearch() {
  return (
    <MobileShell activeTab="search">
      <MobileHeader title="Suche" />

      <section className="flex-1 px-6 pb-32 pt-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#df2634]">
          Manuelle Suche
        </p>

        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em]">
          Gast suchen
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#6f5a5d]">
          Suchen Sie nach Name, Gast-Code oder Adresse.
        </p>

        <div className="mt-8 flex h-16 items-center gap-3 rounded-[1.2rem] bg-white px-5 shadow-[0_18px_40px_rgba(42,23,23,0.06)] ring-1 ring-[#eadada]">
          <Search size={24} className="text-[#9b8b8d]" />
          <input
            placeholder="z.B. Samuel Glauser"
            className="w-full bg-transparent text-base outline-none placeholder:text-[#bdaeb0]"
          />
        </div>

        <div className="mt-8">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.25em] text-[#5b484b]">
            Suchresultate
          </p>

          <div className="space-y-4">
            <GuestResult
              name="Samuel Glauser"
              code="SL-8821"
              address="Hauptstrasse 12, 6370 Stans"
              status="Noch nicht eingecheckt"
              href="/mobile/scanner/success"
            />

            <GuestResult
              name="Claudio Hübscher"
              code="882-AF"
              address="Bahnhofstrasse 4, 6300 Zug"
              status="Bereits eingecheckt"
              href="/mobile/scanner/warning"
              warning
            />

            <GuestResult
              name="Amarah Warren"
              code="REG-A04"
              address="Dorfstrasse 8, 6373 Ennetbürgen"
              status="Noch nicht eingecheckt"
              href="/mobile/scanner/success"
            />
          </div>
        </div>

        <Link
          href="/mobile/scanner/error"
          className="mt-8 flex h-14 items-center justify-center rounded-xl bg-white text-base font-extrabold text-[#df2634] shadow-sm ring-1 ring-[#eadada]"
        >
          Kein passender Gast gefunden?
        </Link>
      </section>
    </MobileShell>
  );
}

function GuestResult({
  name,
  code,
  address,
  status,
  href,
  warning = false,
}: {
  name: string;
  code: string;
  address: string;
  status: string;
  href: string;
  warning?: boolean;
}) {
  return (
    <Link href={href}>
      <MobileCard className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold">{name}</h2>
            <p className="mt-1 text-sm text-[#6f5a5d]">{address}</p>
          </div>

          <span className="rounded-full bg-[#fff0f1] px-3 py-1 text-xs font-extrabold text-[#df2634]">
            {code}
          </span>
        </div>

        <div
          className={`mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${
            warning
              ? "bg-[#ffe8eb] text-[#df2634]"
              : "bg-[#eefbf2] text-[#1d7a3a]"
          }`}
        >
          <CheckCircle size={20} />
          {status}
        </div>
      </MobileCard>
    </Link>
  );
}