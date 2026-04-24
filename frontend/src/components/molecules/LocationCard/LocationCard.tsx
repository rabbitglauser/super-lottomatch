import { MapPin } from "lucide-react";

import { LOCATION } from "@/lib/dashboard-mock";

export default function LocationCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-accent-red-soft/60 p-5 shadow-[0_2px_12px_rgba(31,29,29,0.04)] ring-1 ring-black/5">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted-warm uppercase">
        {LOCATION.label}
      </p>

      <div className="mt-4 relative h-32 overflow-hidden rounded-xl bg-white">
        <svg
          aria-hidden
          viewBox="0 0 320 128"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="map-grid"
              x="0"
              y="0"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="#E9DDDB"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="320" height="128" fill="url(#map-grid)" />
          <path
            d="M 0 80 Q 80 40 160 70 T 320 50"
            fill="none"
            stroke="#D9C7C5"
            strokeWidth="2"
          />
          <path
            d="M 40 0 Q 60 60 120 80 T 200 128"
            fill="none"
            stroke="#E9DDDB"
            strokeWidth="1.5"
          />
          <circle cx="160" cy="64" r="6" fill="#DF2634" />
          <circle
            cx="160"
            cy="64"
            r="12"
            fill="#DF2634"
            fillOpacity="0.2"
          />
        </svg>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <MapPin className="mt-0.5 size-4 shrink-0 text-accent-red" />
        <address className="text-sm not-italic leading-relaxed text-charcoal">
          {LOCATION.address.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
      </div>
    </div>
  );
}
