# Lernziele — Status M426 SuperLottomatch

Statusübersicht der Bewertungskriterien aus `docs/Projektauftrag.pdf`.
**Total: 38 P · Note 6.0: 36 P**

Legende: `[x]` erledigt · `[~]` teilweise · `[ ]` offen

---

## Projektauftrag (2 P)

| Kriterium | P | Status | Nachweis |
|---|---|---|---|
| Anforderungen, Technologien, Schwierigkeiten definiert | 2 | [x] | `docs/PRD.md`, `docs/SCOPE.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md` |

**Zwischensumme: 2 / 2**

## Vorgehen nach Scrum (2 P)

| Kriterium | P | Status | Nachweis |
|---|---|---|---|
| Scrum-Rollen definiert und zugewiesen | 1 | [x] | `CLAUDE.md`, `docs/SCRUM.md` (Sammy PO, Amarah SM, Benji/Oddy/Florian Dev) |
| Team organisiert sich selbst | 1 | [x] | Sprintplanung & Boards in `docs/SCRUM.md` |

**Zwischensumme: 2 / 2**

## Scrum Events (8 P)

| Kriterium | P | Status | Nachweis |
|---|---|---|---|
| Sprint Planning | 2 | [ ] | noch nicht durchgeführt |
| Daily Scrum | 2 | [ ] | noch nicht durchgeführt |
| Sprint Review | 2 | [ ] | noch nicht durchgeführt |
| Sprint Retrospektive | 2 | [ ] | noch nicht durchgeführt |

**Zwischensumme: 0 / 8** — TODO: Scrum Events aufsetzen und protokollieren.

## Scrum Artefakte (5 P)

| Kriterium | P | Status | Nachweis |
|---|---|---|---|
| Product Backlog | 1 | [x] | GitHub Projects / `docs/USER-STORIES.md` |
| Sprint Backlog | 1 | [x] | `docs/SCRUM.md` |
| Scrum Board | 1 | [x] | GitHub Projects |
| User Stories | 1 | [x] | `docs/USER-STORIES.md` |
| Inkrement | 1 | [x] | Lauffähige App via `docker compose up` |

**Zwischensumme: 5 / 5**

## Dokumentation (2 P)

| Kriterium | P | Status | Nachweis |
|---|---|---|---|
| 1–2-seitige Projektbeschreibung | 1 | [x] | `README.md`, `docs/PRD.md` |
| Diagramme / Grafiken | 1 | [x] | `docs/screenshots/ERD-*.png`, `lottomatch_system_architecture.svg`, `lottomatch_current_process.svg`, `lottomatch_digital_vision.svg` |

**Zwischensumme: 2 / 2**

## Source Code (3 P)

| Kriterium | P | Status | Nachweis |
|---|---|---|---|
| Clean Code | 1 | [x] | Ruff/ESLint konfiguriert, Type Hints |
| Sinnvolle Fehlerbehandlung | 1 | [~] | Backend dünn — bisher nur `main.py` + `database.py` |
| Logische Struktur | 1 | [~] | Frontend/Backend/DB sauber getrennt, aber Backend-Modularisierung (`routers/`, `services/`, `models/`, `schemas/`) gemäss `CLAUDE.md` noch **nicht** umgesetzt |

**Zwischensumme: 1–2 / 3** — TODO: Backend in Routers/Services/Models aufteilen.

## CI/CD (2 P)

| Kriterium | P | Status | Nachweis |
|---|---|---|---|
| Pipeline triggert auf allen Branches | 1 | [x] | `.github/workflows/ci.yml` |
| Auto-Deploy bzw. Release-Bundle auf main | 1 | [x] | `.github/workflows/release.yml`, Vercel-Deploy via `vercel.json` |

**Zwischensumme: 2 / 2**

## Tests (2 P)

| Kriterium | P | Status | Nachweis |
|---|---|---|---|
| Unit Tests mit >75 % Coverage | 1 | [x] | Backend: nur `backend/tests/test_main.py` — zu dünn. Frontend: **kein** Jest-Setup im `frontend/src/` sichtbar |
| Tests automatisch in CI, Build failed bei Fehler | 1 | [x] | CI-Pipeline enforced |

**Zwischensumme: 1 / 2** — TODO: Frontend-Tests aufsetzen, Backend-Coverage hochziehen.

## Schlusspräsentation (4 P)

| Kriterium | P | Status | Nachweis |
|---|---|---|---|
| Projektidee | 1 | [ ] | offen |
| Technische Umsetzung | 1 | [ ] | offen |
| Methodische Umsetzung (Scrum) | 1 | [ ] | offen |
| Resultat | 1 | [ ] | offen |

**Zwischensumme: 0 / 4** — kommt am Präsentationstag.

## Einhaltung Rahmenbedingungen (2 P)

| Kriterium | P | Status | Nachweis |
|---|---|---|---|
| Rahmenbedingungen eingehalten | 2 | [x] | Web-App OS-unabhängig, Mobile- und Desktop-Routes (`frontend/src/app/mobile/`, `frontend/src/app/desktop/`), Adress-/ID-Modell für Briefpost-Marketing |

**Zwischensumme: 2 / 2** — Risiko: Onboarding für IT-unerfahrenen Kunden dokumentieren.

## Projekterfüllungsgrad (4 P)

| Kriterium | P | Status | Nachweis |
|---|---|---|---|
| Lauffähig auf Webserver oder lokal | 1 | [x] | `docker-compose.yml` |
| Sämtliche Anforderungen erfüllt | 3 | [~] | Login + Dashboard vorhanden, Kernflüsse Registrierung / QR Check-in / Auslosung im Frontend noch zu verifizieren |

**Zwischensumme: 2–3 / 4** — TODO: End-to-End-Smoketest aller Kernflüsse.

## Ranking in der Klasse (2 P)

| Kriterium | P | Status | Nachweis |
|---|---|---|---|
| Stimmenanteil in der Klasse | 2 | [ ] | externer Faktor, offen bis Klassenabstimmung |

**Zwischensumme: 0 / 2**

---

## Gesamtstand (Schätzung)

| Block | Punkte |
|---|---|
| Sicher erledigt | ~17 |
| Teilweise (Source Code, Tests, Projekterfüllung) | 3–4 |
| Extern / noch ausstehend (Scrum Events, Präsentation, Ranking) | 14 |
| **Aktuell wahrscheinlich** | **~17 / 38** |
| **Zielmarke 6.0** | **36 / 38** |

## Offene Punkte / TODOs

1. **Scrum Events durchführen und protokollieren** — Sprint Planning, Daily Scrum, Sprint Review, Retrospektive (8 P).
2. **Backend modularisieren** (`routers/`, `services/`, `models/`, `schemas/`) — bringt 1 P bei Source Code.
3. **Frontend-Tests** mit Jest + React Testing Library aufsetzen — bringt 1 P bei Tests.
4. **Backend-Coverage** über 75 % heben.
5. **End-to-End-Verifikation** der Kernflüsse (Registrierung, QR Check-in, Auslosung) — sichert die fehlenden 1–2 P bei Projekterfüllung.
6. **Schlusspräsentation** vorbereiten (4 P).
7. **Klassenpräsentation** für gutes Ranking polieren (2 P).
