export type LegalSectionIcon =
  | "building"
  | "contact"
  | "shield"
  | "file"
  | "database"
  | "server"
  | "scale"
  | "clock";

export interface LegalSection {
  title: string;
  icon: LegalSectionIcon;
  paragraphs?: string[];
  items?: string[];
}

export interface LegalPageContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  badge: string;
  noticeTitle: string;
  noticeText: string;
  sections: LegalSection[];
}

export const impressumContent: LegalPageContent = {
  eyebrow: "Rechtliches",
  title: "Impressum",
  subtitle:
    "Angaben zur aktuellen Demo- und Schulprojektversion von SuperLottoMatch / STV Events. Vor einem produktiven Einsatz müssen diese Informationen mit den realen Betreiber- und Kontaktangaben ergänzt werden.",
  badge: "Stand April 2026",
  noticeTitle: "Platzhalterhinweis",
  noticeText:
    "Diese Seite ist bewusst als strukturierte Demo-Fassung aufgebaut. Sie eignet sich als Design- und Inhaltsgrundlage, ersetzt aber kein rechtsverbindliches Impressum für den Live-Betrieb.",
  sections: [
    {
      title: "Projektkontext",
      icon: "building",
      paragraphs: [
        "SuperLottoMatch / STV Events ist derzeit eine Demo-Anwendung im Rahmen des Schulprojekts M426 am GIBZ. Die Oberfläche dient der Konzeption eines modernen Event-, Gäste- und Check-in-Workflows.",
        "Die nachfolgenden Angaben beschreiben den aktuellen Projektstatus und zeigen, welche Impressumsinformationen vor einem produktiven Einsatz vollständig gepflegt werden müssen.",
      ],
      items: [
        "Projektkontext: GIBZ M426 Schulprojekt",
        "Anwendungstyp: Event- und Gästemanagement-Plattform",
        "Status: Prototyp / Demo-Anwendung",
      ],
    },
    {
      title: "Verantwortliche Stelle",
      icon: "contact",
      paragraphs: [
        "Für die veröffentlichte Produktivversion muss hier die juristisch verantwortliche Organisation mit vollständiger ladungsfähiger Anschrift eingetragen werden.",
      ],
      items: [
        "Organisation: Platzhalter — bitte durch reale Firma / Verein ersetzen",
        "Vertretungsberechtigte Person: Platzhalter — bitte ergänzen",
        "Register- oder UID-Angaben: falls erforderlich ergänzen",
      ],
    },
    {
      title: "Kontakt",
      icon: "file",
      paragraphs: [
        "Die folgenden Angaben sind Platzhalter und müssen vor einem öffentlichen Launch ersetzt oder bestätigt werden.",
      ],
      items: [
        "Adresse: Musteradresse ergänzen",
        "E-Mail: legal@beispiel.ch",
        "Telefon: +41 00 000 00 00",
      ],
    },
    {
      title: "Haftung für Inhalte",
      icon: "shield",
      paragraphs: [
        "Die Inhalte dieser Demo-Anwendung wurden mit Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität wird im aktuellen Projektstadium jedoch keine Gewähr übernommen.",
        "Sobald die Plattform produktiv eingesetzt wird, sollten Verantwortlichkeiten, Freigabeprozesse und Prüfmechanismen für veröffentlichte Inhalte verbindlich geregelt werden.",
      ],
    },
    {
      title: "Urheberrecht und Assets",
      icon: "scale",
      paragraphs: [
        "Texte, Layouts, Grafiken und Interaktionskonzepte in diesem Projekt unterliegen dem Urheberrecht der jeweiligen Ersteller oder den verwendeten Lizenzbedingungen.",
        "Vor einem öffentlichen Rollout sollten sämtliche verwendeten Bilder, Icons, Schriftarten und Markenelemente auf ihre Rechte- und Lizenzlage geprüft werden.",
      ],
    },
    {
      title: "Externe Dienste und Verweise",
      icon: "server",
      paragraphs: [
        "Die Demo verweist auf externe Entwicklungs- und Hosting-Dienste, etwa Dokumentations-, Design- oder Deployment-Plattformen. Für Inhalte externer Seiten sind stets deren jeweilige Betreiber verantwortlich.",
        "Links und Integrationen sollten vor einem Live-Betrieb regelmäßig überprüft und dokumentiert werden.",
      ],
    },
  ],
};

export const privacyContent: LegalPageContent = {
  eyebrow: "Rechtliches",
  title: "Datenschutz",
  subtitle:
    "Überblick über die derzeit vorgesehene Verarbeitung personenbezogener Daten in der Demo-Version von SuperLottoMatch / STV Events. Vor dem Live-Betrieb müssen diese Angaben rechtlich geprüft und vervollständigt werden.",
  badge: "Stand April 2026",
  noticeTitle: "Hinweis zum Schulprojekt",
  noticeText:
    "Diese Datenschutzhinweise sind als nachvollziehbare Platzhalterstruktur für das Projekt gedacht. Sie zeigen den vorgesehenen Aufbau, sind aber noch keine finale rechtliche Fassung für den produktiven Einsatz.",
  sections: [
    {
      title: "Verantwortliche Stelle",
      icon: "building",
      paragraphs: [
        "Die verantwortliche Stelle für die produktive Verarbeitung personenbezogener Daten ist vor dem Live-Gang eindeutig zu benennen. In der aktuellen Demo dient diese Seite als Platzhalter für die spätere Betreiberorganisation.",
      ],
      items: [
        "Verantwortliche Organisation: Platzhalter — bitte ersetzen",
        "Kontakt Datenschutz: datenschutz@beispiel.ch",
        "Anschrift: Musteradresse ergänzen",
      ],
    },
    {
      title: "Welche Daten verarbeitet werden",
      icon: "database",
      paragraphs: [
        "Je nach Nutzung der Plattform können insbesondere Stamm-, Event- und Nutzungsdaten verarbeitet werden. Dazu gehören in der vorgesehenen Produktlogik sowohl Administrations- als auch Gästeinformationen.",
      ],
      items: [
        "Login- und Zugangsdaten von Administrationsbenutzern",
        "Gästelisten, Importdaten und optionale Notizen",
        "Check-in-, Anwesenheits- und Event-bezogene Statusdaten",
        "Technische Protokolle wie Fehler- oder Serverlogs",
      ],
    },
    {
      title: "Zwecke der Verarbeitung",
      icon: "file",
      paragraphs: [
        "Die Verarbeitung erfolgt, um Events zu planen, Gäste zu verwalten, Importprozesse durchzuführen, Check-ins abzubilden und den operativen Eventablauf nachvollziehbar zu dokumentieren.",
        "Darüber hinaus können technische Daten zur Sicherstellung von Stabilität, Sicherheit und Fehleranalyse verarbeitet werden.",
      ],
    },
    {
      title: "Hosting und technische Systeme",
      icon: "server",
      paragraphs: [
        "Die aktuelle Projektumgebung nutzt für Demo- und Entwicklungszwecke externe Plattformen für Frontend- und Backend-Bereitstellung. Je nach Deployment können dabei technische Verbindungsdaten, Serverlogs oder Diagnoseinformationen verarbeitet werden.",
        "Vor dem produktiven Betrieb sollten Hosting-Standorte, Auftragsverarbeiter, Speicherorte und Sicherheitsmassnahmen transparent dokumentiert und rechtlich geprüft werden.",
      ],
    },
    {
      title: "Speicherdauer und Schutz",
      icon: "clock",
      paragraphs: [
        "Personenbezogene Daten sollten nur so lange gespeichert werden, wie dies für den jeweiligen Verarbeitungszweck erforderlich ist. Für die produktive Version sind verbindliche Lösch- und Archivierungsfristen festzulegen.",
      ],
      items: [
        "Zugriff nur für berechtigte Personen",
        "Transport- und Anwendungssicherheit prüfen",
        "Lösch- und Exportprozesse vor Go-live definieren",
      ],
    },
    {
      title: "Weitergabe und Rechte betroffener Personen",
      icon: "scale",
      paragraphs: [
        "Eine Weitergabe personenbezogener Daten an Dritte darf nur erfolgen, wenn eine rechtliche Grundlage besteht oder dies für den Betrieb zwingend erforderlich ist.",
        "Betroffene Personen haben im Rahmen der anwendbaren Datenschutzgesetze insbesondere das Recht auf Auskunft, Berichtigung, Löschung sowie Einschränkung der Verarbeitung.",
      ],
      items: [
        "Anfragen zu Auskunft oder Berichtigung müssen dokumentiert beantwortet werden",
        "Löschbegehren und Aufbewahrungspflichten sind gegeneinander abzuwägen",
        "Kontaktwege und Zuständigkeiten für Datenschutzanfragen sind vor Produktivstart verbindlich festzulegen",
      ],
    },
  ],
};
