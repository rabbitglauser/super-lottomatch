import Papa from "papaparse";
import * as XLSX from "xlsx";

import { supabase } from "@/lib/supabase";

export const SYSTEM_FIELDS = [
  "Vorname",
  "Nachname",
  "E-Mail",
  "Telefon",
  "Strasse",
  "Hausnummer",
  "PLZ",
  "Ort",
  "Notizen",
] as const;

export type SystemField = (typeof SYSTEM_FIELDS)[number];

export const REQUIRED_FIELDS: readonly SystemField[] = [
  "Vorname",
  "Nachname",
  "E-Mail",
  "Telefon",
  "Strasse",
  "Hausnummer",
  "PLZ",
  "Ort",
] as const;

export type Mapping = Record<SystemField, number | null>;

export interface ParsedFile {
  headers: string[];
  rows: string[][];
}

export interface ImportResult {
  inserted: number;
  failed: { row: number; reason: string }[];
}

const HEADER_SYNONYMS: Record<SystemField, string[]> = {
  Vorname: ["vorname", "firstname", "first_name", "givenname", "given_name"],
  Nachname: ["nachname", "lastname", "last_name", "surname", "familyname", "family_name"],
  "E-Mail": ["email", "e-mail", "mail", "emailaddress", "email_address"],
  Telefon: ["telefon", "phone", "tel", "mobile", "handy", "telephone"],
  Strasse: ["strasse", "street", "str"],
  Hausnummer: ["hausnummer", "housenumber", "house_number", "nr", "nummer", "no"],
  PLZ: ["plz", "zip", "zipcode", "postal", "postalcode", "postal_code", "postleitzahl"],
  Ort: ["ort", "stadt", "city", "town"],
  Notizen: ["notizen", "notes", "bemerkung", "bemerkungen", "comment", "comments", "note"],
};

function normalizeHeader(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function emptyMapping(): Mapping {
  return SYSTEM_FIELDS.reduce((accumulator, field) => {
    accumulator[field] = null;
    return accumulator;
  }, {} as Mapping);
}

export function autoDetectMapping(headers: string[]): Mapping {
  const mapping = emptyMapping();
  const normalizedHeaders = headers.map(normalizeHeader);

  SYSTEM_FIELDS.forEach((field) => {
    const synonyms = HEADER_SYNONYMS[field].map(normalizeHeader);
    const matchIndex = normalizedHeaders.findIndex((header) =>
      synonyms.includes(header),
    );

    if (matchIndex !== -1) {
      mapping[field] = matchIndex;
    }
  });

  return mapping;
}

function getFileExtension(name: string): string {
  const dotIndex = name.lastIndexOf(".");
  return dotIndex === -1 ? "" : name.slice(dotIndex + 1).toLowerCase();
}

async function parseCsv(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data as string[][];

        if (data.length === 0) {
          reject(new Error("CSV-Datei ist leer"));
          return;
        }

        const [headerRow, ...rest] = data;
        resolve({
          headers: headerRow.map((cell) => String(cell ?? "").trim()),
          rows: rest.map((row) => row.map((cell) => String(cell ?? "").trim())),
        });
      },
      error: (error) => reject(error),
    });
  });
}

async function parseXlsx(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("Excel-Datei enthält keine Tabellen");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
    raw: false,
  });

  if (rows.length === 0) {
    throw new Error("Excel-Datei ist leer");
  }

  const [headerRow, ...rest] = rows;
  return {
    headers: headerRow.map((cell) => String(cell ?? "").trim()),
    rows: rest.map((row) => row.map((cell) => String(cell ?? "").trim())),
  };
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const extension = getFileExtension(file.name);

  if (extension === "csv") {
    return parseCsv(file);
  }

  if (extension === "xlsx" || extension === "xls") {
    return parseXlsx(file);
  }

  throw new Error(`Dateityp wird nicht unterstützt: .${extension}`);
}

function cellValue(row: string[], columnIndex: number | null): string {
  if (columnIndex === null) {
    return "";
  }

  const value = row[columnIndex];
  return value === undefined || value === null ? "" : String(value).trim();
}

function optionalCell(row: string[], columnIndex: number | null): string | null {
  const value = cellValue(row, columnIndex);
  return value === "" ? null : value;
}

function describeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error !== "") {
    return error;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const parts = [record.message, record.details, record.hint, record.code]
      .filter((part): part is string => typeof part === "string" && part !== "");

    if (parts.length > 0) {
      return parts.join(" — ");
    }

    try {
      const serialized = JSON.stringify(error);
      if (serialized && serialized !== "{}") {
        return serialized;
      }
    } catch {
      // fall through
    }
  }

  return "Unbekannter Fehler";
}

async function upsertAddress(address: {
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
}): Promise<number> {
  const { data, error } = await supabase
    .from("addresses")
    .upsert(address, {
      onConflict: "street,house_number,postal_code,city",
    })
    .select("id")
    .single<{ id: number }>();

  if (error) {
    throw new Error(`Adresse: ${describeError(error)}`);
  }

  if (!data) {
    throw new Error("Adresse konnte nicht angelegt werden");
  }

  return data.id;
}

async function insertGuest(guest: {
  guest_code: string;
  first_name: string;
  last_name: string;
  address_id: number;
  phone: string;
  email: string;
  notes: string | null;
}): Promise<void> {
  const { error } = await supabase.from("guests").insert({
    guest_code: guest.guest_code,
    first_name: guest.first_name,
    last_name: guest.last_name,
    address_id: guest.address_id,
    phone: guest.phone,
    email: guest.email,
    notes: guest.notes,
    allow_email_marketing: false,
    allow_post_marketing: true,
  });

  if (error) {
    throw new Error(`Gast: ${describeError(error)}`);
  }
}

export async function importGuestRows(
  rows: string[][],
  mapping: Mapping,
): Promise<ImportResult> {
  const result: ImportResult = { inserted: 0, failed: [] };

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const rowNumber = index + 2;

    try {
      const firstName = cellValue(row, mapping["Vorname"]);
      const lastName = cellValue(row, mapping["Nachname"]);
      const street = cellValue(row, mapping["Strasse"]);
      const houseNumber = cellValue(row, mapping["Hausnummer"]);
      const postalCode = cellValue(row, mapping["PLZ"]);
      const city = cellValue(row, mapping["Ort"]);

      const missing = REQUIRED_FIELDS.filter((field) => {
        const columnIndex = mapping[field];
        return columnIndex === null || cellValue(row, columnIndex) === "";
      });

      if (missing.length > 0) {
        throw new Error(`Pflichtfeld leer: ${missing.join(", ")}`);
      }

      const addressId = await upsertAddress({
        street,
        house_number: houseNumber,
        postal_code: postalCode,
        city,
      });

      await insertGuest({
        guest_code: crypto.randomUUID(),
        first_name: firstName,
        last_name: lastName,
        address_id: addressId,
        phone: cellValue(row, mapping["Telefon"]),
        email: cellValue(row, mapping["E-Mail"]),
        notes: optionalCell(row, mapping["Notizen"]),
      });

      result.inserted += 1;
    } catch (error) {
      console.error(`Guest import failed for row ${rowNumber}:`, error);
      result.failed.push({ row: rowNumber, reason: describeError(error) });
    }
  }

  return result;
}

export function isMappingComplete(mapping: Mapping): boolean {
  return REQUIRED_FIELDS.every((field) => mapping[field] !== null);
}
