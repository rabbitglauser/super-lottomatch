"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Globe2, MapPinned } from "lucide-react";

import { MAPBOX_TOKEN } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MapState = "loading" | "ready" | "unavailable" | "error";
type MapVariant = "compact" | "expanded";

interface DesktopLocationMapProps {
  lat: number;
  lng: number;
  locationLabel: string;
  description?: string;
  variant?: MapVariant;
}

function FallbackMap({
                       locationLabel,
                       reason,
                       variant,
                       description,
                     }: {
  locationLabel: string;
  reason: "unavailable" | "error";
  variant: MapVariant;
  description: string;
}) {
  const patternId = useId();
  const isExpanded = variant === "expanded";

  return (
      <div
          className={cn(
              "relative h-full w-full overflow-hidden bg-[linear-gradient(160deg,rgba(255,255,255,0.98),rgba(252,228,230,0.86))]",
              isExpanded
                  ? "min-h-[620px] rounded-[1.75rem]"
                  : "min-h-[260px] rounded-[1.35rem]",
          )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(223,38,52,0.1),rgba(223,38,52,0)_28%),radial-gradient(circle_at_82%_70%,rgba(184,0,18,0.1),rgba(184,0,18,0)_30%)]" />

        <svg
            aria-hidden
            viewBox="0 0 420 220"
            className="absolute inset-0 h-full w-full opacity-80"
            preserveAspectRatio="none"
        >
          <defs>
            <pattern
                id={patternId}
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
            >
              <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#EEDFE0"
                  strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect width="420" height="220" fill={`url(#${patternId})`} />

          <path
              d="M -8 142 Q 74 84 149 110 T 295 100 T 430 76"
              fill="none"
              stroke="#D9C5C7"
              strokeWidth="2"
          />

          <path
              d="M 12 58 Q 84 127 133 137 T 261 207"
              fill="none"
              stroke="#E6D5D7"
              strokeWidth="1.5"
          />

          <circle cx="235" cy="112" r={isExpanded ? "8" : "6"} fill="#DF2634" />

          <circle
              cx="235"
              cy="112"
              r={isExpanded ? "19" : "15"}
              fill="#DF2634"
              fillOpacity="0.18"
          />
        </svg>

        <div
            className={cn(
                "relative flex h-full flex-col justify-between",
                isExpanded ? "p-6 sm:p-7" : "p-5",
            )}
        >
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/80 bg-white/85 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-red shadow-[0_10px_24px_rgba(31,29,29,0.06)] backdrop-blur-sm">
            <Globe2 className="size-3.5" strokeWidth={2} />
            <span>World View</span>
          </div>

          <div
              className={cn(
                  "rounded-[1.4rem] bg-white/88 shadow-[0_12px_28px_rgba(31,29,29,0.08)] backdrop-blur-sm",
                  isExpanded ? "max-w-sm px-5 py-4" : "max-w-[14rem] px-4 py-3",
              )}
          >
            <div className="flex items-start gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#fde6e6] text-accent-red">
                <MapPinned className="size-4.5" strokeWidth={2} />
              </div>

              <div>
                <p className="text-sm font-semibold tracking-[-0.02em] text-charcoal">
                  {locationLabel}
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-warm">
                  {reason === "unavailable"
                      ? "Mapansicht nicht verfügbar. Mapbox-Token fehlt."
                      : "Mapansicht konnte nicht geladen werden."}
                </p>

                <p className="mt-2 text-xs leading-5 text-muted-warm/90">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function DesktopLocationMap({
                                             lat,
                                             lng,
                                             locationLabel,
                                             description,
                                             variant = "compact",
                                           }: DesktopLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);

  const [mapState, setMapState] = useState<MapState>(
      MAPBOX_TOKEN ? "loading" : "unavailable",
  );

  const isExpanded = variant === "expanded";

  const mapStyle = "mapbox://styles/mapbox/streets-v12";

  const locationText = useMemo(() => locationLabel, [locationLabel]);

  const descriptionText = useMemo(
      () =>
          description ??
          (isExpanded
              ? "Scrollen zum Zoomen, ziehen zum Verschieben."
              : "Klicken Sie für eine größere Kartenansicht mit Standortdetails."),
      [description, isExpanded],
  );

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setMapState("unavailable");
      return;
    }

    let isMounted = true;
    let resizeObserver: ResizeObserver | null = null;
    const resizeTimers: number[] = [];

    const resizeMapSafely = () => {
      const map = mapRef.current;
      const container = mapContainerRef.current;

      if (!map || !container) return;

      const { width, height } = container.getBoundingClientRect();

      if (width > 0 && height > 0) {
        map.resize();
      }
    };

    const scheduleResize = () => {
      requestAnimationFrame(resizeMapSafely);

      [100, 250, 500, 900, 1300].forEach((delay) => {
        const timer = window.setTimeout(resizeMapSafely, delay);
        resizeTimers.push(timer);
      });
    };

    const initMap = async () => {
      try {
        const mapboxglModule = await import("mapbox-gl");
        const mapboxgl = mapboxglModule.default;

        if (!isMounted || !mapContainerRef.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: mapStyle,
          center: [lng, lat],
          zoom: isExpanded ? 5 : 4.5,
          pitch: 0,
          bearing: 0,
          projection: "mercator",
          attributionControl: false,
          logoPosition: "top-left",
        });

        mapRef.current = map;

        map.addControl(
            new mapboxgl.AttributionControl({
              compact: true,
            }),
            "bottom-right",
        );

        map.scrollZoom.enable();
        map.dragPan.enable();
        map.dragRotate.enable();
        map.doubleClickZoom.enable();
        map.keyboard.enable();
        map.touchZoomRotate.enable();

        const markerElement = document.createElement("div");
        markerElement.style.position = "relative";
        markerElement.style.display = "flex";
        markerElement.style.alignItems = "center";
        markerElement.style.justifyContent = "center";
        markerElement.style.width = isExpanded ? "34px" : "30px";
        markerElement.style.height = isExpanded ? "34px" : "30px";
        markerElement.style.pointerEvents = "none";

        const pulseElement = document.createElement("span");
        pulseElement.style.position = "absolute";
        pulseElement.style.width = isExpanded ? "34px" : "30px";
        pulseElement.style.height = isExpanded ? "34px" : "30px";
        pulseElement.style.borderRadius = "9999px";
        pulseElement.style.background = "rgba(223,38,52,0.25)";
        pulseElement.style.boxShadow = "0 0 28px rgba(223,38,52,0.22)";

        const coreElement = document.createElement("span");
        coreElement.style.position = "absolute";
        coreElement.style.width = isExpanded ? "18px" : "16px";
        coreElement.style.height = isExpanded ? "18px" : "16px";
        coreElement.style.borderRadius = "9999px";
        coreElement.style.background = "#df2634";
        coreElement.style.boxShadow =
            "0 0 0 4px rgba(255,255,255,0.95), 0 0 20px rgba(223,38,52,0.38)";

        markerElement.appendChild(pulseElement);
        markerElement.appendChild(coreElement);

        new mapboxgl.Marker({
          element: markerElement,
          anchor: "center",
        })
            .setLngLat([lng, lat])
            .addTo(map);

        map.on("load", () => {
          if (!isMounted) return;

          setMapState("ready");
          map.resize();
          scheduleResize();
        });

        map.on("idle", () => {
          if (!isMounted) return;
          resizeMapSafely();
        });

        map.on("error", (event) => {
          console.error("MAPBOX ERROR:", event.error);

          const message = String(event.error?.message ?? "").toLowerCase();

          if (
              message.includes("unauthorized") ||
              message.includes("forbidden") ||
              message.includes("token") ||
              message.includes("401") ||
              message.includes("403")
          ) {
            setMapState("error");
          }
        });

        if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
          resizeObserver = new ResizeObserver(() => {
            scheduleResize();
          });

          resizeObserver.observe(mapContainerRef.current);
        }

        scheduleResize();
      } catch (error) {
        console.error("Mapbox failed to initialize:", error);

        if (isMounted) {
          setMapState("error");
        }
      }
    };

    setMapState("loading");
    initMap();

    return () => {
      isMounted = false;

      resizeObserver?.disconnect();

      resizeTimers.forEach((timer) => {
        window.clearTimeout(timer);
      });

      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [isExpanded, lat, lng, mapStyle]);

  if (mapState === "unavailable" || mapState === "error") {
    return (
        <FallbackMap
            locationLabel={locationText}
            reason={mapState}
            variant={variant}
            description={descriptionText}
        />
    );
  }

  return (
      <div
          className={cn(
              "relative isolate h-full w-full overflow-hidden bg-[#eaf0f6]",
              isExpanded
                  ? "min-h-[620px] rounded-[1.75rem]"
                  : "min-h-[260px] rounded-[1.35rem]",
          )}
      >
        <div
            ref={mapContainerRef}
            className="absolute inset-0 z-0 h-full w-full"
            style={{
              minHeight: isExpanded ? "620px" : "260px",
            }}
        />

        <div
            className={cn(
                "pointer-events-none absolute z-20 rounded-[1.4rem] border border-white/75 bg-white/78 shadow-[0_18px_34px_rgba(31,29,29,0.08)] backdrop-blur-md",
                isExpanded
                    ? "bottom-5 left-5 right-5 max-w-md px-5 py-4"
                    : "bottom-4 left-4 right-4 max-w-[13rem] px-4 py-3",
            )}
        >
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#fde6e6] text-accent-red">
              <MapPinned className="size-4.5" strokeWidth={2} />
            </div>

            <div>
              <p className="text-sm font-semibold tracking-[-0.02em] text-charcoal">
                {locationText}
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-warm">
                {descriptionText}
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}