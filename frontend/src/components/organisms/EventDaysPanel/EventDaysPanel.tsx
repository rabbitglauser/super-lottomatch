import EventDayCard from "@/components/molecules/EventDayCard";
import { EVENT_DAYS } from "@/lib/dashboard-mock";

export default function EventDaysPanel() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-charcoal">Event-Tage</h2>
        <a
          href="#"
          className="text-sm font-medium text-accent-red hover:underline"
        >
          Alle anzeigen
        </a>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {EVENT_DAYS.map((event) => (
          <EventDayCard key={`${event.month}-${event.day}`} event={event} />
        ))}
      </div>
    </section>
  );
}
