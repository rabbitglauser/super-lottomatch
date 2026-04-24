"use client";

import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  FileUp,
  Lightbulb,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  GUEST_IMPORT_FIELD_OPTIONS,
  GUEST_IMPORT_FILE,
  GUEST_IMPORT_MAPPINGS,
  type GuestImportFile,
} from "@/lib/guest-import-mock";
import { cn } from "@/lib/utils";

const mappingGridClass =
  "xl:grid-cols-[minmax(0,1fr)_minmax(220px,0.95fr)_minmax(0,0.9fr)]";

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function StepIndicator() {
  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <div className="inline-flex items-center gap-2 rounded-full bg-[#f9e9ea] px-4 py-2 text-sm font-semibold tracking-[0.14em] text-accent-red">
        <CheckCircle2 className="size-4" />
        <span>SCHRITT 1</span>
      </div>

      <div className="h-px w-16 bg-[#dfcaca] sm:w-24" />

      <span className="text-sm font-semibold tracking-[0.14em] text-muted-warm">
        SCHRITT 2
      </span>
    </div>
  );
}

function SelectedFileRow({
  file,
  onRemove,
}: {
  file: GuestImportFile;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[1.5rem] bg-[#fbefef] px-4 py-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-accent-red shadow-[0_12px_24px_rgba(220,31,45,0.08)]">
        <FileSpreadsheet className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-charcoal">{file.name}</p>
        <p className="mt-1 text-sm text-muted-warm">
          {file.sizeLabel} • {file.status}
        </p>
      </div>

      <button
        type="button"
        aria-label="Datei entfernen"
        onClick={onRemove}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl text-accent-red transition hover:bg-white"
      >
        <Trash2 className="size-5" />
      </button>
    </div>
  );
}

function UploadCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<GuestImportFile | null>(
    GUEST_IMPORT_FILE,
  );

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile({
      name: file.name,
      sizeLabel: formatFileSize(file.size),
      status: "Bereit zum Mapping",
    });
  };

  const removeFile = () => {
    setSelectedFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-[0_18px_42px_rgba(42,23,23,0.06)] sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-[#dc1f2d] to-[#a80c18] text-white shadow-[0_18px_32px_rgba(220,31,45,0.24)]">
          <FileUp className="size-6" />
        </div>

        <div>
          <h2 className="text-[1.45rem] font-semibold tracking-[-0.03em] text-charcoal">
            Datei auswählen
          </h2>
          <p className="mt-1 text-sm text-muted-warm">
            CSV oder Excel Datei hierher ziehen
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={openFileDialog}
        className="mt-6 flex min-h-[250px] w-full flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-[#edd2d0] bg-[#fffdfd] px-6 py-8 text-center transition hover:border-accent-red/35 hover:bg-[#fff8f8]"
      >
        <div className="flex size-20 items-center justify-center rounded-full bg-[#fdf0f1] text-accent-red">
          <UploadCloud className="size-10" />
        </div>

        <p className="mt-6 max-w-xs text-lg font-medium leading-8 text-charcoal">
          Datei hier ablegen oder{" "}
          <span className="font-semibold text-accent-red underline underline-offset-4">
            Computer durchsuchen
          </span>
        </p>

        <p className="mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-muted-warm">
          MAX. 10MB • CSV, XLSX
        </p>
      </button>

      {selectedFile ? (
        <div className="mt-5">
          <SelectedFileRow file={selectedFile} onRemove={removeFile} />
        </div>
      ) : null}
    </section>
  );
}

function ProTipCard() {
  return (
    <section className="rounded-[2rem] bg-[#ffd8b6] px-6 py-6 text-charcoal shadow-[0_16px_34px_rgba(165,92,31,0.12)] sm:px-7">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/60 text-[#9d4f18]">
          <Lightbulb className="size-5" />
        </div>

        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#7f4c23]">
            Profi-Tipp
          </p>
          <p className="mt-3 text-sm leading-7 text-[#58361b]">
            Achten Sie darauf, dass Ihre Tabelle eine Kopfzeile hat (z.B.
            Name, E-Mail). Das macht die Zuordnung im nächsten Schritt
            kinderleicht!
          </p>
        </div>
      </div>
    </section>
  );
}

function MappingTable() {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-[0_18px_42px_rgba(42,23,23,0.06)] sm:p-7">
      <div className="flex flex-col gap-4 border-b border-[#efe1df] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[1.55rem] font-semibold tracking-[-0.03em] text-charcoal">
            Spalten zuordnen
          </h2>
          <p className="mt-1 text-sm text-muted-warm">
            Prüfen Sie die Vorschau der ersten 3 Zeilen
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#f6eeee] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-charcoal">
          <span className="size-2 rounded-full bg-accent-red" />
          <span>Live-Vorschau</span>
        </div>
      </div>

      <div
        className={cn(
          "mt-6 hidden border-b border-[#f1e6e4] px-2 pb-3 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted-warm/85 xl:grid",
          mappingGridClass,
        )}
      >
        <span>CSV Spalte</span>
        <span>System-Feld</span>
        <span>Beispiel</span>
      </div>

      <div className="mt-2 space-y-4">
        {GUEST_IMPORT_MAPPINGS.map((mapping) => (
          <div
            key={mapping.csvColumn}
            className={cn(
              "rounded-[1.6rem] bg-[#fff8f8] px-4 py-4 xl:grid xl:items-center xl:gap-6 xl:px-5",
              mappingGridClass,
            )}
          >
            <div className="xl:hidden">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-warm/80">
                CSV Spalte
              </p>
            </div>
            <p className="mt-2 text-sm font-semibold text-charcoal xl:mt-0">
              {mapping.csvColumn}
            </p>

            <div className="mt-4 xl:mt-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-warm/80 xl:hidden">
                System-Feld
              </p>
              <div className="relative mt-2 xl:mt-0">
                <select
                  defaultValue={mapping.systemField}
                  className="h-14 w-full appearance-none rounded-2xl border border-transparent bg-input-bg px-4 pr-12 text-sm font-medium text-charcoal outline-none transition focus:border-accent-red/15 focus:ring-4 focus:ring-accent-red/10"
                >
                  {GUEST_IMPORT_FIELD_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-warm" />
              </div>
            </div>

            <div className="mt-4 xl:mt-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-warm/80 xl:hidden">
                Beispiel
              </p>
              <p className="mt-2 text-sm text-muted-warm xl:mt-0">
                {mapping.example}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href="/dashboard/guests"
          className="inline-flex h-[58px] items-center justify-center rounded-[1.3rem] px-5 text-sm font-semibold text-muted-warm transition hover:bg-[#f8eeee] hover:text-charcoal"
        >
          Abbrechen
        </Link>

        <Button
          type="button"
          onClick={() => console.log("Gastimport gestartet")}
          className="h-[58px] rounded-[1.3rem] bg-gradient-to-r from-[#ef3543] to-[#b90f1d] px-6 text-base font-semibold text-white shadow-[0_20px_38px_rgba(220,31,45,0.22)] hover:opacity-95 sm:w-[200px]"
        >
          Import starten
          <ArrowRight className="size-5" />
        </Button>
      </div>
    </section>
  );
}

export default function DesktopGuestImportPage() {
  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="w-full px-6 py-8 md:px-8 xl:px-10 xl:py-10">
        <header className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-charcoal sm:text-[3.3rem]">
              Gäste importieren
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-warm sm:text-lg">
              Laden Sie Ihre Gästeliste sicher hoch. Wir unterstützen CSV-
              Dateien aus Excel, Google Sheets und Outlook.
            </p>
          </div>

          <StepIndicator />
        </header>

        <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-[#efdfdf]">
          <div className="h-full w-[48%] rounded-full bg-gradient-to-r from-[#ef3543] to-[#b90f1d]" />
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)] xl:items-start">
          <div className="space-y-6">
            <UploadCard />
            <ProTipCard />
          </div>

          <MappingTable />
        </div>
      </div>
    </div>
  );
}
