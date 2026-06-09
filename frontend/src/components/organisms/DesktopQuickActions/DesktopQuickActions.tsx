import PageReveal from "@/components/atoms/PageReveal";
import DesktopQuickActionCard from "@/components/molecules/DesktopQuickActionCard";
import {
  Dices,
  FileUp,
  Gift,
  Plus,
  QrCode,
  UserPlus,
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Gast hinzufügen", icon: UserPlus, tone: "light" },
  { label: "Gäste importieren", icon: FileUp, tone: "light" },
  { label: "Check-in öffnen", icon: QrCode, tone: "light" },
  { label: "Preis erstellen", icon: Gift, tone: "light" },
  { label: "Verlosung starten", icon: Dices, tone: "red" },
  { label: "Neues Event", icon: Plus, tone: "red" },
] as const;

export default function DesktopQuickActions() {
  return (
    <section>
      <PageReveal delay={320} variant="left" className="max-w-max">
        <h2 className="text-xl font-semibold text-charcoal">Schnellzugriff</h2>
      </PageReveal>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        {QUICK_ACTIONS.map((action, index) => (
          <PageReveal
            key={action.label}
            delay={400 + index * 70}
            variant="up"
            className="h-full w-full"
          >
            <DesktopQuickActionCard
              label={action.label}
              icon={action.icon}
              tone={action.tone}
            />
          </PageReveal>
        ))}
      </div>
    </section>
  );
}
