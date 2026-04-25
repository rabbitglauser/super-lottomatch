import PageReveal from "@/components/atoms/PageReveal";
import DesktopEventDayCard from "@/components/molecules/DesktopEventDayCard";
import { EVENT_DAYS } from "@/lib/dashboard-mock";

export default function DesktopEventDaysPanel() {
  return (
    <section>
      <PageReveal delay={340} variant="right">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-charcoal">Event-Tage</h2>
          <a
            href="#"
            className="text-sm font-medium text-accent-red hover:underline"
          >
            Alle anzeigen
          </a>
        </div>
      </PageReveal>

      <div className="mt-4 flex flex-col gap-3">
        {EVENT_DAYS.map((event, index) => (
          <PageReveal
            key={`${event.month}-${event.day}`}
            delay={430 + index * 70}
            variant="right"
          >
            <DesktopEventDayCard event={event} />
          </PageReveal>
        ))}
      </div>
    </section>
  );
}
