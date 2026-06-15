"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  CircleUser,
  Download,
  FileUp,
  Loader2,
} from "lucide-react";

import IconButton from "@/components/atoms/IconButton";
import { Button } from "@/components/ui/button";
import { fetchGuestExport } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function DesktopNavActions() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleExport = async () => {
    setExportError(null);
    setIsExporting(true);

    try {
      const { blob, filename } = await fetchGuestExport();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = filename;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setIsMenuOpen(false);
    } catch {
      setExportError("Export konnte nicht heruntergeladen werden.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div ref={menuRef} className="relative">
        <Button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          onClick={() => {
            setIsMenuOpen((currentState) => !currentState);
            setExportError(null);
          }}
          className="bg-brand text-white hover:bg-brand/90"
        >
          Import/Export
          <ChevronDown
            className={cn(
              "ml-1 size-4 transition-transform",
              isMenuOpen ? "rotate-180" : "rotate-0",
            )}
          />
        </Button>

        {isMenuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-72 rounded-2xl border border-black/5 bg-white p-2 text-charcoal shadow-[0_24px_60px_rgba(31,29,29,0.14)]"
          >
            <Link
              role="menuitem"
              href="/dashboard/guests/importieren"
              onClick={() => setIsMenuOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition hover:bg-[#fff7f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red/30"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-red-soft text-accent-red">
                <FileUp className="size-4" />
              </span>
              <span>Gäste importieren</span>
            </Link>

            <button
              role="menuitem"
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition hover:bg-[#fff7f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red/30 disabled:cursor-wait disabled:opacity-70"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-red-soft text-accent-red">
                {isExporting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
              </span>
              <span>{isExporting ? "Export wird erstellt..." : "Gäste exportieren"}</span>
            </button>

            {exportError ? (
              <p className="px-3 pb-2 pt-1 text-xs font-medium text-accent-red">
                {exportError}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <IconButton icon={Bell} ariaLabel="Benachrichtigungen" />
      <IconButton icon={CircleUser} ariaLabel="Profil" />
    </div>
  );
}
