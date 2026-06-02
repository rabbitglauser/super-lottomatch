import Link from "next/link";
import {
  Calendar,
  Check,
  QrCode,
  Search,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import {
  MobileCard,
  MobileHeader,
  MobileShell,
} from "@/components/organisms/MobileShell";

export default function MobileLandingPage() {
  return (
    <MobileShell activeTab="home">
      <MobileHeader title="Home" />

      <section className="flex-1 px-6 pb-32 pt-8">
        <MobileCard className="p-8 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.32em] text-[#7b6b6d]">
            Check-ins heute
          </p>

          <div className="mt-3 flex items-center justify-center gap-3">
            <p className="text-6xl font-extrabold tracking-[-0.06em] text-[#df2634]">
              25
            </p>
            <TrendingUp size={28} className="text-[#df2634]" />
          </div>

          <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-[#fff0f1] px-4 py-2 text-xs font-extrabold uppercase text-[#df2634]">
            <span className="h-2 w-2 rounded-full bg-[#df2634]" />
            Live Status
          </div>
        </MobileCard>

        <div className="mt-6 space-y-4">
          <ActionCard
            href="/mobile/scanner"
            title="QR-Code scannen"
            description="Tickets automatisch erfassen"
            icon={<QrCode size={34} />}
            primary
          />

          <ActionCard
            href="/mobile/search"
            title="Manuelle Suche"
            description="Gästeliste durchsuchen"
            icon={<Search size={32} />}
          />

          <ActionCard
            href="/mobile/register"
            title="Neuer Gast registrieren"
            description="Vor-Ort Anmeldung"
            icon={<UserPlus size={32} />}
          />
        </div>

        <div className="mt-8">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.3em] text-[#7b6b6d]">
            Letzte Aktivitäten
          </p>

          <div className="space-y-3">
            <ActivityItem
              name="Forster, Benjamin"
              time="Check-in vor 2 Min."
              code="VIP-G12"
            />
            <ActivityItem
              name="Warren, Amarah"
              time="Check-in vor 5 Min."
              code="REG-A04"
            />
          </div>
        </div>
      </section>
    </MobileShell>
  );
}

function ActionCard({
  href,
  title,
  description,
  icon,
  primary = false,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-[1.3rem] p-6 shadow-[0_18px_34px_rgba(42,23,23,0.06)] transition active:scale-[0.98] ${
        primary
          ? "bg-gradient-to-r from-[#df2634] to-[#b90f1d] text-white"
          : "border border-[#eadada] bg-white text-[#231f20]"
      }`}
    >
      <div>
        <h2 className="text-xl font-extrabold">{title}</h2>
        <p className={`mt-1 text-sm ${primary ? "text-white/80" : "text-[#6f5a5d]"}`}>
          {description}
        </p>
      </div>

      <div className={primary ? "text-white" : "text-[#231f20]"}>{icon}</div>
    </Link>
  );
}

function ActivityItem({
  name,
  time,
  code,
}: {
  name: string;
  time: string;
  code: string;
}) {
  return (
    <MobileCard className="flex items-center justify-between bg-[#fff7f8] p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ffe1e4] text-[#df2634]">
          <Check size={20} />
        </div>

        <div>
          <p className="font-extrabold">{name}</p>
          <p className="text-sm text-[#6f5a5d]">{time}</p>
        </div>
      </div>

      <p className="text-xs font-semibold text-[#6f5a5d]">{code}</p>
    </MobileCard>
  );
}