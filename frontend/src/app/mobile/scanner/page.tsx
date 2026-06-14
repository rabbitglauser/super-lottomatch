"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Calendar,
  Flashlight,
  Info,
  Loader2,
  QrCode,
  Search,
  UserPlus,
} from "lucide-react";

import { checkInByCode } from "@/lib/api";

type DetectedBarcode = { rawValue: string };
type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]>;
};
type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorInstance;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

function resultParams(result: Awaited<ReturnType<typeof checkInByCode>>) {
  return new URLSearchParams({
    name: result.guest.name,
    code: result.guest.code,
    checkedInAt: result.checkedInAt ?? "",
    address: result.guest.address,
  });
}

export default function MobileScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);
  const [cameraState, setCameraState] = useState<
    "idle" | "starting" | "active" | "blocked" | "unsupported"
  >("idle");
  const [manualCode, setManualCode] = useState("");
  const [message, setMessage] = useState("Kamera wird vorbereitet...");

  const stopCamera = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const processCode = useCallback(
    async (rawCode: string, method: "qr_code" | "guest_code" = "qr_code") => {
      const code = rawCode.trim();

      if (!code || isProcessingRef.current) {
        return;
      }

      isProcessingRef.current = true;
      setMessage("Check-in wird verarbeitet...");

      try {
        const result = await checkInByCode(code, method);
        const params = resultParams(result).toString();
        stopCamera();
        router.push(
          result.status === "already-checked-in"
            ? `/mobile/scanner/warning?${params}`
            : `/mobile/scanner/success?${params}`,
        );
      } catch {
        stopCamera();
        router.push(`/mobile/scanner/error?code=${encodeURIComponent(code)}`);
      }
    },
    [router, stopCamera],
  );

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.BarcodeDetector) {
      setCameraState("unsupported");
      setMessage("QR-Erkennung ist in diesem Browser nicht verfuegbar.");
      return;
    }

    setCameraState("starting");
    setMessage("Kamera wird gestartet...");

    try {
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      const video = videoRef.current;

      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      setCameraState("active");
      setMessage("QR-Code im Feld ausrichten");

      const scan = async () => {
        const activeVideo = videoRef.current;

        if (!activeVideo || !streamRef.current) {
          return;
        }

        if (!isProcessingRef.current && activeVideo.readyState >= 2) {
          try {
            const codes = await detector.detect(activeVideo);
            const rawValue = codes[0]?.rawValue;

            if (rawValue) {
              await processCode(rawValue, "qr_code");
              return;
            }
          } catch {
            setMessage("QR-Code konnte noch nicht gelesen werden.");
          }
        }

        frameRef.current = window.requestAnimationFrame(scan);
      };

      frameRef.current = window.requestAnimationFrame(scan);
    } catch {
      setCameraState("blocked");
      setMessage("Kamera konnte nicht geoeffnet werden.");
      stopCamera();
    }
  }, [processCode, stopCamera]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      startCamera();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleManualSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    processCode(manualCode, "guest_code");
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col overflow-hidden bg-black">
        <header className="z-20 flex items-center justify-between bg-[#ded9d7] px-6 py-5 text-[#231f20]">
          <div className="flex items-center gap-4">
            <Link href="/mobile">
              <ArrowLeft size={28} />
            </Link>
            <h1 className="text-2xl font-bold">Scanner</h1>
          </div>

          <div className="flex items-center gap-5 text-[#5b484b]">
            <Flashlight size={26} />
            <Info size={28} />
          </div>
        </header>

        <section className="relative flex flex-1 flex-col items-center justify-between px-8 pb-32 pt-10">
          <video
            ref={videoRef}
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-3 rounded-full bg-white px-8 py-4 text-[#231f20] shadow-lg">
              <span
                className={`h-3 w-3 rounded-full ${
                  cameraState === "active" ? "bg-[#1d7a3a]" : "bg-[#e52535]"
                }`}
              />
              <div className="text-xs font-extrabold uppercase tracking-[0.25em]">
                <p>STV Check-in</p>
                <p>
                  {cameraState === "active"
                    ? "Kamera aktiv"
                    : cameraState === "starting"
                      ? "Startet"
                      : "Fallback"}
                </p>
              </div>
            </div>

            <div className="relative mt-16 h-[310px] w-[320px]">
              <div className="absolute left-0 top-0 h-16 w-16 rounded-tl-2xl border-l-4 border-t-4 border-white" />
              <div className="absolute right-0 top-0 h-16 w-16 rounded-tr-2xl border-r-4 border-t-4 border-white" />
              <div className="absolute bottom-0 left-0 h-16 w-16 rounded-bl-2xl border-b-4 border-l-4 border-white" />
              <div className="absolute bottom-0 right-0 h-16 w-16 rounded-br-2xl border-b-4 border-r-4 border-white" />

              <div className="absolute left-2 right-2 top-[64px] h-[2px] bg-[#e52535] shadow-[0_0_16px_rgba(229,37,53,0.8)]" />

              {cameraState === "starting" ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="size-10 animate-spin text-white" />
                </div>
              ) : null}
            </div>
          </div>

          <div className="relative z-10 w-full">
            <p className="mx-auto mb-6 max-w-[300px] text-center text-2xl font-bold leading-snug">
              {message}
            </p>

            {cameraState === "blocked" || cameraState === "unsupported" ? (
              <button
                type="button"
                onClick={startCamera}
                className="mb-4 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-white text-base font-extrabold text-[#e52535]"
              >
                Kamera erneut starten
              </button>
            ) : null}

            <form onSubmit={handleManualSubmit} className="rounded-2xl bg-black/35 p-3 backdrop-blur-sm">
              <label className="flex h-14 items-center gap-3 rounded-xl bg-white px-4 text-[#231f20]">
                <QrCode size={22} className="text-[#e52535]" />
                <input
                  value={manualCode}
                  onChange={(event) => setManualCode(event.target.value)}
                  placeholder="Gast-Code manuell eingeben"
                  className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-[#9b8b8d]"
                />
              </label>
              <button
                type="submit"
                className="mt-3 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#e52535] text-base font-extrabold shadow-xl shadow-black/30"
              >
                <Search size={24} />
                Code einchecken
              </button>
            </form>

            <Link
              href="/mobile/search"
              className="mt-4 flex h-16 items-center justify-center gap-4 rounded-xl bg-white text-xl font-bold text-[#e52535] shadow-xl shadow-black/20"
            >
              <Search size={30} />
              Suche oeffnen
            </Link>

            <Link
              href="/mobile"
              className="mt-4 flex h-16 items-center justify-center rounded-xl border border-white/40 bg-black/25 text-xl font-bold backdrop-blur-sm"
            >
              Abbrechen
            </Link>
          </div>
        </section>

        <nav className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-4 border-t border-[#f0e1e3] bg-white px-3 py-3 text-[#9b8b8d]">
          <BottomNavItem href="/mobile" icon={<Calendar size={22} />} label="HEUTE" />
          <BottomNavItem active href="/mobile/scanner" icon={<QrCode size={22} />} label="CHECK-IN" />
          <BottomNavItem href="/mobile/search" icon={<Search size={22} />} label="SUCHEN" />
          <BottomNavItem href="/mobile/register" icon={<UserPlus size={22} />} label="NEUER GAST" />
        </nav>
      </div>
    </main>
  );
}

function BottomNavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-center text-[11px] font-bold ${
        active ? "bg-[#ffe8eb] text-[#e52535]" : "text-[#9b8b8d]"
      }`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </Link>
  );
}
