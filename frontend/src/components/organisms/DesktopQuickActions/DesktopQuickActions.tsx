import DesktopQuickActionCard from "@/components/molecules/DesktopQuickActionCard";
import { QUICK_ACTIONS } from "@/lib/dashboard-mock";

export default function DesktopQuickActions() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-charcoal">Schnellzugriff</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        {QUICK_ACTIONS.map((action) => (
          <DesktopQuickActionCard
            key={action.label}
            label={action.label}
            icon={action.icon}
            tone={action.tone}
          />
        ))}
      </div>
    </section>
  );
}
