# Scrum-Dokumentation — SuperLottomatch

**Date:** 2026-06-04
**Status:** Ratified

**Modul:** M426 (GIBZ)  
**Projektdauer:** 5 Wochen  
**Sprintlänge:** 1 Woche

---

## 1. Vorgehen nach Scrum

### 1.1 Scrumrollen

| Rolle | Person | Verantwortlichkeiten |
|-------|--------|----------------------|
| **Product Owner** | Sammy | Pflege und Priorisierung des Product Backlogs, Abnahme der Inkremente, Vertretung der Stakeholder-Interessen, Definition der Akzeptanzkriterien |
| **Scrum Master** | Amarah | Moderation der Scrum Events, Beseitigung von Hindernissen, Sicherstellung der Einhaltung des Scrum-Prozesses, Coaching des Teams |
| **Developer** | Benji | Umsetzung der Sprint-Backlog-Einträge, Code Reviews, technische Entscheidungen, Qualitätssicherung |
| **Developer** | Oddy | Umsetzung der Sprint-Backlog-Einträge, Code Reviews, technische Entscheidungen, Qualitätssicherung |

### 1.2 Selbstorganisation

Das Team organisiert sich selbst nach folgenden Prinzipien:

- **Aufgabenverteilung:** Die Entwickler wählen eigenständig Aufgaben aus dem Sprint Backlog. Es gibt keine Zuweisung durch den Scrum Master oder Product Owner.
- **Entscheidungsfindung:** Technische Entscheidungen werden im Team diskutiert und gemeinsam getroffen. Bei Uneinigkeit entscheidet die Mehrheit.
- **Kommunikation:** Das Team kommuniziert über einen gemeinsamen Chat-Kanal (z. B. Discord/Teams) und tauscht sich bei Bedarf auch ausserhalb der Daily Scrums aus.
- **Verantwortung:** Jedes Teammitglied trägt Verantwortung für die Qualität des gesamten Produkts, nicht nur für die eigenen Aufgaben.

---

## 2. Scrum Events

### 2.1 Sprint Planning

| Aspekt | Details                                      |
|--------|----------------------------------------------|
| **Zeitpunkt** | Jeweils am ersten Tag des Sprints (Dienstag) |
| **Timebox** | max. 1 Stunde                                |
| **Teilnehmer** | Gesamtes Scrum-Team                          |
| **Moderation** | Scrum Master (Amarah)                        |

**Ablauf:**
1. Der Product Owner (Sammy) stellt die höchstpriorisierten Einträge aus dem Product Backlog vor.
2. Das Team klärt offene Fragen und bespricht Akzeptanzkriterien.
3. Das Team schätzt den Aufwand der Einträge (z. B. mit Story Points oder T-Shirt-Sizes).
4. Basierend auf der Teamkapazität werden Einträge in das Sprint Backlog übernommen.
5. Das Team definiert ein Sprint-Ziel, das den Fokus des Sprints beschreibt.

### 2.2 Daily Scrum

| Aspekt | Details |
|--------|---------|
| **Zeitpunkt** | Täglich (während der Unterrichtszeit) |
| **Timebox** | max. 15 Minuten |
| **Teilnehmer** | Entwicklungsteam (Benji, Oddy), Scrum Master (Amarah) |
| **Format** | Stand-up |

**Jedes Teammitglied beantwortet drei Fragen:**
1. Was habe ich seit dem letzten Daily Scrum erledigt?
2. Was werde ich bis zum nächsten Daily Scrum erledigen?
3. Gibt es Hindernisse, die mich blockieren?

Der Scrum Master notiert allfällige Impediments und kümmert sich um deren Beseitigung.

### 2.3 Sprint Review

| Aspekt | Details |
|--------|---------|
| **Zeitpunkt** | Am letzten Tag des Sprints (Freitag) |
| **Timebox** | max. 45 Minuten |
| **Teilnehmer** | Gesamtes Scrum-Team, ggf. Stakeholder (Lehrperson) |
| **Moderation** | Product Owner (Sammy) |

**Ablauf:**
1. Das Team präsentiert das fertiggestellte Inkrement in einer Live-Demo.
2. Der Product Owner überprüft, ob die Akzeptanzkriterien erfüllt sind.
3. Stakeholder-Feedback wird gesammelt und im Product Backlog festgehalten.
4. Der Product Owner aktualisiert den Product Backlog auf Basis des Feedbacks.

### 2.4 Sprint Retrospektive

| Aspekt | Details |
|--------|---------|
| **Zeitpunkt** | Nach dem Sprint Review (Freitag) |
| **Timebox** | max. 30 Minuten |
| **Teilnehmer** | Gesamtes Scrum-Team |
| **Moderation** | Scrum Master (Amarah) |

**Format — drei Spalten:**

| Was lief gut? | Was können wir verbessern? | Massnahmen |
|---------------|---------------------------|------------|
| *(wird im Sprint befüllt)* | *(wird im Sprint befüllt)* | *(wird im Sprint befüllt)* |

**Ablauf:**
1. Jedes Teammitglied notiert Punkte zu den drei Spalten.
2. Die Punkte werden gemeinsam besprochen und gruppiert.
3. Das Team einigt sich auf konkrete Verbesserungsmassnahmen für den nächsten Sprint.
4. Die Massnahmen werden dokumentiert und im nächsten Sprint verfolgt.

---

## 3. Scrum Artefakte

### 3.1 Product Backlog

- **Verantwortlich:** Product Owner (Sammy)
- **Inhalt:** Alle Anforderungen an das Produkt in Form von User Stories, priorisiert nach Geschäftswert.
- **Priorisierung:** Der Product Owner ordnet die Einträge nach Wichtigkeit (MoSCoW-Methode: Must, Should, Could, Won't).
- **Refinement:** Das Team verfeinert die obersten Backlog-Einträge regelmässig, damit sie für den nächsten Sprint bereit sind (Definition of Ready).

### 3.2 Sprint Backlog

- **Verantwortlich:** Entwicklungsteam (Benji, Oddy)
- **Inhalt:** Die vom Team ausgewählten Product-Backlog-Einträge für den aktuellen Sprint, aufgeteilt in konkrete Aufgaben (Tasks).
- **Auswahl:** Im Sprint Planning wählt das Team basierend auf der Kapazität die Einträge aus, die es sich für den Sprint vornimmt.
- **Anpassung:** Das Sprint Backlog wird während des Sprints vom Team aktualisiert; neue Erkenntnisse fliessen in die Aufgabenplanung ein.

### 3.3 Scrum Board

Das Team verwendet ein Scrum Board (GitHub Projects) mit folgenden Spalten:

| To Do | In Progress | Review | Done |
|-------|-------------|--------|------|
| Aufgaben, die noch nicht begonnen wurden | Aufgaben, an denen gerade gearbeitet wird | Aufgaben, die auf Code Review oder Abnahme warten | Abgeschlossene Aufgaben, die die DoD erfüllen |

- Jede Aufgabe wird als Karte dargestellt und enthält den Verantwortlichen sowie den Status.
- Das Board wird täglich im Daily Scrum aktualisiert.

### 3.4 User Stories

User Stories folgen dem Format:

> **Als** [Rolle] **möchte ich** [Funktion], **damit** [Nutzen].

**Beispiel:**
> Als Lottospieler möchte ich meine Lottozahlen eingeben, damit ich prüfen kann, ob ich gewonnen habe.

Jede User Story enthält:
- **Akzeptanzkriterien:** Klare Bedingungen, die erfüllt sein müssen, damit die Story als fertig gilt.
- **Story Points:** Aufwandschätzung des Teams.
- **Priorität:** Vom Product Owner festgelegt.

### 3.5 Inkrement

Das Inkrement ist die Summe aller im Sprint abgeschlossenen Product-Backlog-Einträge. Es muss die **Definition of Done (DoD)** erfüllen:

| Kriterium | Beschreibung |
|-----------|--------------|
| Code vollständig | Alle Aufgaben der User Story sind implementiert |
| Code Review | Mindestens ein anderes Teammitglied hat den Code geprüft |
| Tests bestanden | Alle relevanten Tests sind grün |
| Dokumentation | Relevante Dokumentation ist aktualisiert |
| Akzeptanzkriterien | Alle Akzeptanzkriterien der User Story sind erfüllt |
| Lauffähig | Das Inkrement ist auf der Zielumgebung lauffähig und demonstrierbar |

Am Ende jedes Sprints wird das Inkrement im Sprint Review vorgestellt und vom Product Owner abgenommen.
