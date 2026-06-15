const APP_TIME_ZONE = "Europe/Zurich";

export const GUEST_EXPORT_FILENAME = "superlottomatch-guests-export.csv";

const GUEST_EXPORT_HEADERS = [
  "Gast-Code",
  "Vorname",
  "Nachname",
  "Strasse",
  "Hausnummer",
  "PLZ",
  "Ort",
  "Telefon",
  "E-Mail",
  "E-Mail Marketing",
  "Post Marketing",
  "Notizen",
  "Letzte Teilnahme",
  "Erstellt am",
] as const;

interface GuestExportAddress {
  city: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
}

export interface GuestExportRow {
  guest_code: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  allow_email_marketing: boolean;
  allow_post_marketing: boolean;
  notes: string | null;
  created_at: string;
  addresses?: GuestExportAddress | GuestExportAddress[] | null;
  checkins?: { checked_in_at: string }[] | null;
}

function relationOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function latestBy<T>(items: T[], getValue: (item: T) => string | null | undefined) {
  return items.reduce<string | null>((latestValue, item) => {
    const value = getValue(item);

    if (!value) {
      return latestValue;
    }

    if (!latestValue || new Date(value) > new Date(latestValue)) {
      return value;
    }

    return latestValue;
  }, null);
}

function formatExportDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(value));
}

function exportCell(value: boolean | number | string | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function exportBool(value: boolean) {
  return value ? "Ja" : "Nein";
}

function escapeCsvCell(value: string) {
  if (/[;"\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

function buildCsv(rows: string[][]) {
  return `${rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(";"))
    .join("\n")}\n`;
}

export class GuestExportCsvBuilder {
  build(rows: GuestExportRow[]) {
    const csvRows = rows.map((row) => {
      const address = relationOne(row.addresses);
      const lastParticipation = latestBy(
        row.checkins ?? [],
        (checkin) => checkin.checked_in_at,
      );

      return [
        exportCell(row.guest_code),
        exportCell(row.first_name),
        exportCell(row.last_name),
        exportCell(address?.street),
        exportCell(address?.house_number),
        exportCell(address?.postal_code),
        exportCell(address?.city),
        exportCell(row.phone),
        exportCell(row.email),
        exportBool(row.allow_email_marketing),
        exportBool(row.allow_post_marketing),
        exportCell(row.notes),
        formatExportDate(lastParticipation),
        formatExportDate(row.created_at),
      ];
    });

    return `\uFEFF${buildCsv([[...GUEST_EXPORT_HEADERS], ...csvRows])}`;
  }
}
