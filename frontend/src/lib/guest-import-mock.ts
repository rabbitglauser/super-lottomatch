export interface GuestImportFile {
  name: string;
  sizeLabel: string;
  status: string;
}

export interface GuestImportMapping {
  csvColumn: string;
  systemField: string;
  example: string;
}

export const GUEST_IMPORT_FILE: GuestImportFile = {
  name: "gaesteliste_sommerevent_2026.csv",
  sizeLabel: "420 KB",
  status: "Bereit zum Mapping",
};

export const GUEST_IMPORT_FIELD_OPTIONS = [
  "Vorname",
  "Nachname",
  "E-Mail",
  "Telefon",
  "Firma",
  "Notizen / Tisch",
] as const;

export const GUEST_IMPORT_MAPPINGS: GuestImportMapping[] = [
  {
    csvColumn: "Vorname",
    systemField: "Vorname",
    example: "Maximilian",
  },
  {
    csvColumn: "Nachname",
    systemField: "Nachname",
    example: "Mustermann",
  },
  {
    csvColumn: "E-Mail Adresse",
    systemField: "E-Mail",
    example: "max@beispiel.de",
  },
  {
    csvColumn: "Tisch_Nr",
    systemField: "Notizen / Tisch",
    example: "Tisch 12",
  },
];
