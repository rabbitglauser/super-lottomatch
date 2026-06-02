import Link from "next/link";
import {
  Ban,
  QrCode,
  Search,
  UserPlus,
} from "lucide-react";
import {
  MobileHeader,
  MobileRedButton,
  MobileShell,
  MobileWhiteButton,
} from "@/components/organisms/MobileShell";

export default function MobileError() {
  return (
    <MobileShell activeTab="checkin">
      <MobileHeader />

      <section className="flex flex-1 flex-col items-center px-6 pb-32 pt-12 text-center">
        <div className="relative flex h-52 w-52 items-center justify-center rounded-full bg-[radial-gradient(circle,#f4a6ad_0%,#9a8081_45%,#ffffff_46%,#ffffff_48%,#fff1f2_49%,#fff1f2_100%)] shadow-[0_0_60px_rgba(225,44,57,0.12)]">
          <div className="absolute -bottom-4 -right-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b90f1d] text-white shadow-xl">
            <Ban size={34} />
          </div>
        </div>

        <h1 className="mt-12 text-3xl font-extrabold tracking-[-0.04em]">
          Gast nicht gefunden
        </h1>

        <p className="mt-4 max-w-[330px] text-base leading-7 text-[#6f5a5d]">
          Keine Übereinstimmung in der Datenbank. Möglicherweise ist der Gast
          noch nicht registriert oder der Scan war fehlerhaft.
        </p>

        <div className="mt-12 w-full space-y-4">
          <MobileRedButton href="/mobile/register">
            <UserPlus size={26} />
            Neuen Gast registrieren
          </MobileRedButton>

          <MobileWhiteButton href="/mobile/search">
            <Search size={26} />
            Erneut suchen
          </MobileWhiteButton>
        </div>

        <Link
          href="/mobile/scanner"
          className="mt-10 flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#b90f1d]"
        >
          <QrCode size={20} />
          Zurück zum QR Scanner
        </Link>
      </section>
    </MobileShell>
  );
}