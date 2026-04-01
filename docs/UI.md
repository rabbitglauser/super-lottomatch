# UI Design — SuperLottomatch

## Design Philosophy

SuperLottomatch targets an audience that is **majority aged 40+** with limited tech experience. Every design decision prioritizes clarity, simplicity, and accessibility. A guest should be able to register or check in within **2 screens and under 30 seconds**.

---

## Design System

### Constraints

| Rule | Value |
|------|-------|
| Minimum body font size | 18px |
| Minimum touch target | 48px height |
| Contrast ratio | WCAG AA (4.5:1 minimum) |
| Max steps per action | 2 screens |
| Language | German |
| Layout | Mobile-first, responsive |

### Component Library

Built with **Tailwind CSS** and inspired by:
- [21st.dev](https://21st.dev/home) — modern component patterns
- [Stitch](https://stitch.ch) — Swiss design references

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Heading (h1) | 32px | Bold |
| Heading (h2) | 24px | Semibold |
| Body text | 18px | Regular |
| Button label | 18px | Semibold |
| Caption / helper text | 14px | Regular |

### Color Palette

| Role | Usage |
|------|-------|
| **Primary** | CTAs, active states, links |
| **Secondary** | Supporting elements, badges |
| **Success** | Confirmation screens, check-in success |
| **Error** | Validation errors, failed actions |
| **Neutral** | Backgrounds, borders, disabled states |

---

## Guest App (Public)

### Page Map

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing Page | Event branding, two CTAs: "Ich bin neu" / "Ich war schon da" |
| `/register` | Registration | Form: Vorname, Nachname, Strasse, PLZ, Ort |
| `/checkin` | Returning Guest | Enter last name or scan QR code from invitation letter |
| `/confirmed` | Confirmation | "Du bist dabei!" with QR code to save/screenshot |

### User Flow

```
Landing Page
├── "Ich bin neu" ──▶ Registration Form ──▶ Confirmation + QR Code
└── "Ich war schon da" ──▶ Name / QR Lookup ──▶ Confirmation + QR Code
```

### Key UI Decisions

- **No login required** — guests access the app directly via link or QR code on their invitation
- **Large CTAs on landing page** — two clearly labeled buttons, no ambiguity
- **Inline validation** — form errors appear next to the field immediately
- **QR code screen** — prominent display with "Screenshot speichern" instruction and download button
- **AI Chatbot widget** — floating button in the bottom-right corner for event FAQs (date, location, how to register)

---

## Admin Dashboard (Protected)

### Page Map

| Route | Page | Purpose |
|-------|------|---------|
| `/admin/login` | Login | Single shared password for all club members |
| `/admin/guests` | Guest List | Searchable/filterable table, inline edit, CSV export |
| `/admin/checkin` | Check-in Station | QR scanner via camera + manual name fallback |
| `/admin/raffle` | Raffle Draw | Day selection, draw button, animated reveal, history |
| `/admin/cleanup` | Address Cleanup | List inactive guests (3+ years), bulk archive/delete |

### User Flow

```
Login
└── Dashboard Navigation (sidebar or tabs)
    ├── Guest List ──▶ Search / Filter / Edit / Export CSV
    ├── Check-in Station ──▶ Scan QR / Search Name ──▶ Confirm Check-in
    ├── Raffle Draw ──▶ Select Day ──▶ Draw Winner ──▶ Animated Reveal
    └── Address Cleanup ──▶ Review Inactive ──▶ Bulk Archive/Delete
```

### Key UI Decisions

- **QR Scanner** — opens device camera directly in the browser, full-screen scanning area with overlay guide
- **Manual fallback** — searchable name field below the scanner for when camera is unavailable
- **Check-in confirmation** — green success banner with guest name displayed for 3 seconds
- **Raffle animation** — suspenseful reveal (name shuffle effect) before showing the winner
- **Guest table** — sortable columns, search-as-you-type, pagination, inline edit on double-click
- **Cleanup view** — checkbox selection with "Alle markieren" and bulk action bar

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| < 640px (mobile) | Single column, stacked cards, full-width buttons |
| 640–1024px (tablet) | Two-column where useful, sidebar collapses to hamburger |
| > 1024px (desktop) | Full sidebar navigation, wider tables, side-by-side panels |

The **Guest App** is optimized for mobile (most guests will use their phone). The **Admin Dashboard** is optimized for tablet/laptop (used at the event station).

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Contrast | All text meets WCAG AA (4.5:1) |
| Touch targets | All interactive elements min 48px |
| Keyboard navigation | All actions reachable via Tab + Enter |
| Screen readers | Semantic HTML, ARIA labels on icons and interactive elements |
| Error messages | Associated with form fields via `aria-describedby` |
| Focus indicators | Visible focus ring on all interactive elements |
