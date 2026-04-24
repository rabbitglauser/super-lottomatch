"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import DesktopLocationMap from "./DesktopLocationMap";

interface DesktopLocationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  locationLabel: string;
  lat: number;
  lng: number;
}

export default function DesktopLocationDetailsModal({
  open,
  onClose,
  locationLabel,
  lat,
  lng,
}: DesktopLocationDetailsModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 lg:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[rgba(31,29,29,0.32)] backdrop-blur-[10px]" />

      <div
        id="location-details-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${locationLabel} Kartenansicht`}
        className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_32px_80px_rgba(31,29,29,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          aria-label="Standortansicht schließen"
          variant="outline"
          size="icon-lg"
          className="absolute right-5 top-5 z-20 rounded-2xl border-white/85 bg-white/90 text-charcoal shadow-[0_14px_26px_rgba(31,29,29,0.12)] hover:bg-white hover:text-accent-red"
          onClick={onClose}
        >
          <X className="size-5" />
        </Button>

        <div className="h-[70vh] min-h-[420px] sm:h-[76vh]">
          <DesktopLocationMap
            lat={lat}
            lng={lng}
            locationLabel={locationLabel}
            description="Ziehen oder zoomen Sie, um den Veranstaltungsort im größeren Kartenfenster zu erkunden."
            variant="expanded"
          />
        </div>
      </div>
    </div>
  );
}
