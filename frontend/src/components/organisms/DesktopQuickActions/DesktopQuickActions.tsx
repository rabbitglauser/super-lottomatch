import PageReveal from "@/components/atoms/PageReveal";
import DesktopQuickActionCard from "@/components/molecules/DesktopQuickActionCard";
import { QUICK_ACTIONS } from "@/lib/dashboard-mock";

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
