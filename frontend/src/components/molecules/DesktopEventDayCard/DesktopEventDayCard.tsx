import type { EventDay } from "@/lib/dashboard-mock";
import { cn } from "@/lib/utils";

interface EventDayCardProps {
  event: EventDay;
}

export default function DesktopEventDayCard({ event }: EventDayCardProps) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(31,29,29,0.04)] ring-1 ring-black/5 transition-all",
        event.active &&
          "before:absolute before:inset-y-4 before:left-0 before:w-1 before:rounded-r-full before:bg-accent-red",
      )}
    >
      <div
        className={cn(
          "flex size-14 shrink-0 flex-col items-center justify-center rounded-xl",
          event.active ? "bg-accent-red-soft" : "bg-page-dashboard",
        )}
      >
        <span
          className={cn(
            "text-[10px] font-semibold tracking-wider uppercase",
            event.active ? "text-accent-red" : "text-muted-warm",
          )}
        >
          {event.month}
        </span>
        <span
          className={cn(
            "text-lg font-semibold leading-none",
            event.active ? "text-accent-red" : "text-charcoal",
          )}
        >
          {event.day}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-charcoal">
          {event.title}
        </p>
        <p className="mt-1 text-xs text-muted-warm">
          {event.time} • {event.guests} Gäste
        </p>
      </div>
    </div>
  );
}
