"use client";

import { LOCATION } from "@/lib/dashboard-mock";

import DesktopLocationMap from "./DesktopLocationMap";

export default function DesktopLocationCard() {
  return (
    <section className="overflow-hidden rounded-[1.75rem] bg-accent-red-soft/60 p-5 shadow-[0_12px_30px_rgba(31,29,29,0.08)] ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-warm uppercase">
            {LOCATION.label}
          </p>
          <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.03em] text-charcoal">
            {LOCATION.locationLabel}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-warm">
            Interaktive Kartenansicht mit Zoom und Pan direkt im Dashboard.
          </p>
        </div>
      </div>

      <div className="relative mt-5 h-[23rem] overflow-hidden rounded-[1.45rem] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <DesktopLocationMap
          lat={LOCATION.coordinates.lat}
          lng={LOCATION.coordinates.lng}
          locationLabel={LOCATION.locationLabel}
          description="Scrollen zum Zoomen, ziehen zum Verschieben."
          variant="compact"
        />
      </div>
    </section>
  );
}
