import QuickActionCard from "@/components/molecules/QuickActionCard";
import { QUICK_ACTIONS } from "@/lib/dashboard-mock";

export default function QuickActions() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-charcoal">Schnellzugriff</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        {QUICK_ACTIONS.map((action) => (
          <QuickActionCard
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
