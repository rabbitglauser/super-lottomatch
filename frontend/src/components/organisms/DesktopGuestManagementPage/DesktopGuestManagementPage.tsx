"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  ChevronDown,
  Copy,
  MoreVertical,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserPlus,
  X,
} from "lucide-react";

import PageReveal from "@/components/atoms/PageReveal";
import { Button } from "@/components/ui/button";
import {
  createGuest,
  deleteGuest,
  fetchGuests,
  toggleGuestMarketing,
  type GuestRecord,
  type GuestRegistrationInput,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const desktopGridClass =
  "lg:grid-cols-[minmax(0,2.45fr)_minmax(120px,0.95fr)_minmax(110px,0.8fr)_minmax(140px,1fr)_110px_40px]";

interface GuestFilters {
  location: string;
  lastParticipation: string;
  marketingConsent: string;
  status: string;
}

const defaultGuestFilters: GuestFilters = {
  location: "Alle Standorte",
  lastParticipation: "Zeitraum wählen",
  marketingConsent: "Alle Status",
  status: "Alle",
};

const NO_PARTICIPATION_LABEL = "Noch keine Teilnahme";

function parseParticipationDate(value: string): Date | null {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function closeParentMenu(event: { currentTarget: HTMLElement }) {
  event.currentTarget.closest("details")?.removeAttribute("open");
}

const locationOptions = [
  "Alle Standorte",
  "Zug",
  "Luzern",
  "Zürich",
  "Bern",
] as const;

const lastParticipationOptions = [
  "Zeitraum wählen",
  "Letzte 30 Tage",
  "Letzte 3 Monate",
  "Dieses Jahr",
] as const;

const marketingConsentOptions = [
  "Alle Status",
  "Eingewilligt",
  "Nicht eingewilligt",
] as const;

const statusOptions = ["Aktiv", "Inaktiv", "Alle"] as const;

const avatarToneClasses = {
  rose: "bg-[#f7d8dc] text-[#b53948]",
  amber: "bg-[#f4e1c5] text-[#9d6226]",
  blue: "bg-[#d7e6ef] text-[#365f82]",
  peach: "bg-[#f5d5cf] text-[#ab5147]",
} as const;

interface FilterFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

function FilterField({ label, value, options, onChange }: FilterFieldProps) {
  return (
    <div className="min-w-0">
      <label className="mb-3 block text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-warm/85">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-2xl border border-transparent bg-white px-4 pr-12 text-sm font-medium text-charcoal outline-none transition focus:border-accent-red/15 focus:ring-4 focus:ring-accent-red/10"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-warm" />
      </div>
    </div>
  );
}

function FilterPanel({
  filters,
  onChange,
  onReset,
}: {
  filters: GuestFilters;
  onChange: <K extends keyof GuestFilters>(key: K, value: GuestFilters[K]) => void;
  onReset: () => void;
}) {
  return (
    <div className="mt-5 rounded-[1.9rem] bg-[#fdecec] px-6 py-7 sm:px-8 sm:py-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <FilterField
          label="Ort/Stadt"
          value={filters.location}
          options={locationOptions}
          onChange={(value) => onChange("location", value)}
        />
        <FilterField
          label="Letzte Teilnahme"
          value={filters.lastParticipation}
          options={lastParticipationOptions}
          onChange={(value) => onChange("lastParticipation", value)}
        />
        <FilterField
          label="Marketing-Einwilligung"
          value={filters.marketingConsent}
          options={marketingConsentOptions}
          onChange={(value) => onChange("marketingConsent", value)}
        />
        <FilterField
          label="Status"
          value={filters.status}
          options={statusOptions}
          onChange={(value) => onChange("status", value)}
        />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-7 inline-flex items-center gap-2 rounded-full px-1 py-1 text-sm font-semibold text-accent-red transition hover:text-accent-red-dark"
      >
        <X className="size-4" />
        <span>Filter zurücksetzen</span>
      </button>
    </div>
  );
}

interface ActionButtonProps {
  icon: LucideIcon;
  variant: "primary" | "secondary";
  children: ReactNode;
  href?: string;
  onClick?: () => void;
}

function ActionButton({
  icon: Icon,
  variant,
  children,
  href,
  onClick,
}: ActionButtonProps) {
  const className = cn(
    "inline-flex h-[74px] w-full items-center justify-start gap-3 rounded-[1.6rem] px-6 text-left text-base font-semibold transition sm:w-[200px]",
    variant === "primary"
      ? "bg-gradient-to-r from-[#f03a49] to-[#b90f1d] text-white shadow-[0_20px_40px_rgba(220,31,45,0.24)] hover:opacity-95"
      : "bg-[#f9e9ea] text-accent-red hover:bg-[#f4dcde]",
  );

  const content = (
    <>
      <Icon className="size-5 shrink-0" />
      <span className="leading-[1.15]">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <Button type="button" className={className} onClick={onClick}>
      {content}
    </Button>
  );
}

function MarketingToggle({
  active,
  label,
  onToggle,
}: {
  active: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "group relative inline-flex h-8 w-14 shrink-0 overflow-hidden rounded-full p-1 transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-red/20 active:scale-95",
        active
          ? "bg-[linear-gradient(135deg,#ff6470_0%,#df2634_48%,#a80f1b_100%)] shadow-[0_12px_26px_rgba(220,31,45,0.28)]"
          : "bg-[#d9cdcc] shadow-inner hover:bg-[#cec0bf]",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_74%_50%,rgba(255,255,255,0.45),transparent_34%)] transition-opacity duration-500",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-y-4 -left-7 w-5 rotate-12 bg-white/45 blur-[1px] transition-all duration-700 ease-out",
          active ? "translate-x-24 opacity-80" : "translate-x-0 opacity-0",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white/35 blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          active ? "translate-x-6 opacity-90" : "translate-x-0 opacity-0",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "relative z-10 flex size-6 items-center justify-center rounded-full bg-white text-accent-red shadow-[0_6px_14px_rgba(31,29,29,0.16)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          active
            ? "translate-x-6 rotate-[360deg]"
            : "translate-x-0 rotate-0 text-transparent",
        )}
      >
        <Check
          className={cn(
            "size-3.5 transition-all duration-300",
            active ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
          strokeWidth={3}
        />
      </span>
    </button>
  );
}

function MobileField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-muted-warm/80">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function GuestRowMenu({
  guest,
  onDelete,
}: {
  guest: GuestRecord;
  onDelete: () => void;
}) {
  return (
    <details className="group relative">
      <summary
        aria-label={`${guest.name} Optionen`}
        className="inline-flex size-10 shrink-0 list-none items-center justify-center rounded-2xl text-muted-warm transition hover:bg-[#f8eeee] [&::-webkit-details-marker]:hidden"
      >
        <MoreVertical className="size-5" />
      </summary>

      <div className="absolute right-0 z-20 mt-2 min-w-[210px] rounded-2xl border border-[#f0e1e3] bg-white p-2 text-left shadow-[0_18px_40px_rgba(31,29,29,0.12)]">
        <button
          type="button"
          onClick={(event) => {
            navigator.clipboard?.writeText(guest.code);
            closeParentMenu(event);
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-charcoal transition hover:bg-[#fff7f7]"
        >
          <Copy className="size-4" />
          Gast-Code kopieren
        </button>
        <button
          type="button"
          onClick={(event) => {
            onDelete();
            closeParentMenu(event);
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-accent-red transition hover:bg-[#fff7f7]"
        >
          <Trash2 className="size-4" />
          Löschen
        </button>
      </div>
    </details>
  );
}

function GuestRow({
  guest,
  onToggleMarketing,
  onDeleteGuest,
}: {
  guest: GuestRecord;
  onToggleMarketing: (guestId: string) => void;
  onDeleteGuest: (guestId: string) => void;
}) {
  const marketingLabel = `${guest.name} Marketing-Einwilligung ${
    guest.marketingActive ? "deaktivieren" : "aktivieren"
  }`;

  return (
    <article className="rounded-[1.75rem] bg-white px-5 py-5 shadow-[0_18px_36px_rgba(42,23,23,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_52px_rgba(42,23,23,0.1)] sm:px-6 lg:min-h-[92px] lg:px-7">
      <div className="flex items-start justify-between gap-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-4 ring-[#fff6f6]",
              avatarToneClasses[guest.avatarTone],
            )}
          >
            {guest.initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[1.05rem] font-semibold text-charcoal">
              {guest.name}
            </p>
            <p className="mt-1 truncate text-sm text-muted-warm">{guest.email}</p>
          </div>
        </div>

        <GuestRowMenu guest={guest} onDelete={() => onDeleteGuest(guest.id)} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:hidden">
        <MobileField label="Gast-Code">
          <span className="inline-flex rounded-full bg-[#fce8ea] px-3 py-2 text-sm font-semibold text-accent-red">
            {guest.code}
          </span>
        </MobileField>

        <MobileField label="Wohnort">
          <p className="text-sm font-medium text-charcoal">{guest.city}</p>
        </MobileField>

        <MobileField label="Letzte Teilnahme">
          <p className="text-sm font-medium text-charcoal">{guest.lastParticipation}</p>
        </MobileField>

        <MobileField label="Marketing">
          <MarketingToggle
            active={guest.marketingActive}
            label={marketingLabel}
            onToggle={() => onToggleMarketing(guest.id)}
          />
        </MobileField>
      </div>

      <div className={cn("hidden items-center gap-6 lg:grid", desktopGridClass)}>
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-4 ring-[#fff6f6]",
              avatarToneClasses[guest.avatarTone],
            )}
          >
            {guest.initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[1.02rem] font-semibold text-charcoal">
              {guest.name}
            </p>
            <p className="mt-1 truncate text-sm text-muted-warm">{guest.email}</p>
          </div>
        </div>

        <div>
          <span className="inline-flex rounded-full bg-[#fce8ea] px-3 py-2 text-sm font-semibold text-accent-red">
            {guest.code}
          </span>
        </div>

        <p className="text-sm font-medium text-charcoal">{guest.city}</p>
        <p className="text-sm font-medium text-charcoal">{guest.lastParticipation}</p>
        <MarketingToggle
          active={guest.marketingActive}
          label={marketingLabel}
          onToggle={() => onToggleMarketing(guest.id)}
        />

        <GuestRowMenu guest={guest} onDelete={() => onDeleteGuest(guest.id)} />
      </div>
    </article>
  );
}

const emptyGuestForm = {
  firstName: "",
  lastName: "",
  street: "",
  houseNumber: "",
  postalCode: "",
  city: "",
  phone: "",
  email: "",
};

type GuestFormState = typeof emptyGuestForm;

function ModalField({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-warm/85">
        {label}
        {required ? <span className="text-accent-red"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-black/[0.06] bg-white px-4 text-sm text-charcoal outline-none transition focus:border-accent-red/20 focus:ring-4 focus:ring-accent-red/10"
      />
    </label>
  );
}

function ManualGuestModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: GuestRegistrationInput) => Promise<void>;
}) {
  const [form, setForm] = useState<GuestFormState>(emptyGuestForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const setField =
    (key: keyof GuestFormState) => (value: string) =>
      setForm((current) => ({ ...current, [key]: value }));

  const requiredFilled = Boolean(
    form.firstName.trim() &&
      form.lastName.trim() &&
      form.street.trim() &&
      form.houseNumber.trim() &&
      form.postalCode.trim() &&
      form.city.trim(),
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!requiredFilled || submitting) {
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await onCreate({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        street: form.street.trim(),
        houseNumber: form.houseNumber.trim(),
        postalCode: form.postalCode.trim(),
        city: form.city.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        allowEmailMarketing: Boolean(form.email.trim()),
        allowPostMarketing: true,
      });
    } catch {
      setFormError("Gast konnte nicht gespeichert werden.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_rgba(42,23,23,0.25)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-charcoal">
            Manueller Gast
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schliessen"
            className="inline-flex size-9 items-center justify-center rounded-xl text-muted-warm transition hover:bg-[#f8eeee]"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ModalField
              label="Vorname"
              value={form.firstName}
              onChange={setField("firstName")}
              required
            />
            <ModalField
              label="Nachname"
              value={form.lastName}
              onChange={setField("lastName")}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <ModalField
              label="Strasse"
              value={form.street}
              onChange={setField("street")}
              required
            />
            <ModalField
              label="Nr."
              value={form.houseNumber}
              onChange={setField("houseNumber")}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
            <ModalField
              label="PLZ"
              value={form.postalCode}
              onChange={setField("postalCode")}
              required
            />
            <ModalField
              label="Ort"
              value={form.city}
              onChange={setField("city")}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ModalField
              label="Telefon"
              value={form.phone}
              onChange={setField("phone")}
            />
            <ModalField
              label="E-Mail"
              type="email"
              value={form.email}
              onChange={setField("email")}
            />
          </div>

          {formError ? (
            <p className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm font-medium text-accent-red">
              {formError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="h-12 rounded-2xl border-0 bg-[#f5e8e8] px-6 text-sm font-semibold text-charcoal hover:bg-[#efdddd]"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={!requiredFilled || submitting}
              className="h-12 rounded-2xl bg-gradient-to-r from-[#f03a49] to-[#b90f1d] px-6 text-sm font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Speichern..." : "Gast speichern"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DesktopGuestManagementPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<GuestFilters>({
    ...defaultGuestFilters,
  });

  useEffect(() => {
    fetchGuests()
      .then(setGuests)
      .catch(() => setError("Gäste konnten nicht geladen werden."));
  }, []);

  const visibleGuests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return guests.filter((guest) => {
      if (filters.location !== "Alle Standorte" && guest.city !== filters.location) {
        return false;
      }

      if (
        filters.marketingConsent === "Eingewilligt" &&
        !guest.marketingActive
      ) {
        return false;
      }

      if (
        filters.marketingConsent === "Nicht eingewilligt" &&
        guest.marketingActive
      ) {
        return false;
      }

      const hasParticipated = guest.lastParticipation !== NO_PARTICIPATION_LABEL;

      if (filters.status === "Aktiv" && !hasParticipated) {
        return false;
      }

      if (filters.status === "Inaktiv" && hasParticipated) {
        return false;
      }

      if (filters.lastParticipation !== "Zeitraum wählen") {
        const participationDate = parseParticipationDate(guest.lastParticipation);

        if (!participationDate) {
          return false;
        }

        const now = new Date();
        const daysAgo = (days: number) =>
          new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        if (
          filters.lastParticipation === "Letzte 30 Tage" &&
          participationDate < daysAgo(30)
        ) {
          return false;
        }

        if (
          filters.lastParticipation === "Letzte 3 Monate" &&
          participationDate < daysAgo(90)
        ) {
          return false;
        }

        if (
          filters.lastParticipation === "Dieses Jahr" &&
          participationDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      }

      if (!normalizedQuery) {
        return true;
      }

      return [guest.name, guest.email, guest.code, guest.city]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [guests, filters, query]);

  const handleFilterChange = <K extends keyof GuestFilters>(
    key: K,
    value: GuestFilters[K],
  ) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({ ...defaultGuestFilters });
    setShowFilters(false);
  };

  const handleToggleMarketing = (guestId: string) => {
    setGuests((currentGuests) =>
      currentGuests.map((guest) =>
        guest.id === guestId
          ? { ...guest, marketingActive: !guest.marketingActive }
          : guest,
      ),
    );
    toggleGuestMarketing(guestId).catch(() => {
      setGuests((currentGuests) =>
        currentGuests.map((guest) =>
          guest.id === guestId
            ? { ...guest, marketingActive: !guest.marketingActive }
            : guest,
        ),
      );
      setError("Marketing-Einwilligung konnte nicht gespeichert werden.");
    });
  };

  const handleDeleteGuest = (guestId: string) => {
    const guest = guests.find((item) => item.id === guestId);

    if (!guest || !window.confirm(`Gast "${guest.name}" wirklich löschen?`)) {
      return;
    }

    const previousGuests = guests;
    setGuests((currentGuests) =>
      currentGuests.filter((item) => item.id !== guestId),
    );

    deleteGuest(guestId).catch(() => {
      setGuests(previousGuests);
      setError("Gast konnte nicht gelöscht werden.");
    });
  };

  const handleCreateGuest = async (input: GuestRegistrationInput) => {
    await createGuest(input);
    const refreshed = await fetchGuests();
    setGuests(refreshed);
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="w-full px-6 py-8 md:px-8 xl:px-10 xl:py-10">
        <header className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <PageReveal delay={0} variant="up" className="max-w-4xl">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-charcoal sm:text-[3.3rem]">
                Gästeverwaltung
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-warm sm:text-lg">
                Verwalten Sie Ihre Teilnehmerliste, Importieren Sie Daten und
                behalten Sie den Überblick über die Event-Präsenz.
              </p>
            </div>
          </PageReveal>

          <PageReveal delay={120} variant="right" className="xl:shrink-0">
            <div className="flex flex-col gap-4 sm:flex-row">
              <ActionButton
                icon={Upload}
                variant="secondary"
                href="/dashboard/guests/importieren"
              >
                Importieren
              </ActionButton>

              <ActionButton
                icon={UserPlus}
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                <span className="block">Manueller</span>
                <span className="block">Gast</span>
              </ActionButton>
            </div>
          </PageReveal>
        </header>

        <PageReveal delay={220} variant="up">
          <section className="mt-10 rounded-[2rem] bg-white/70 p-4 shadow-[0_18px_40px_rgba(42,23,23,0.05)] sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-warm" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Gäste nach Name, Code oder Wohnort suchen..."
                  className="h-[68px] w-full rounded-[1.5rem] border border-black/[0.04] bg-white pl-14 pr-5 text-[0.97rem] text-charcoal shadow-[0_10px_24px_rgba(42,23,23,0.05)] outline-none transition placeholder:text-input-text focus:border-accent-red/15 focus:ring-4 focus:ring-accent-red/10"
                />
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowFilters((currentState) => !currentState)}
                aria-expanded={showFilters}
                className={cn(
                  "h-[68px] rounded-[1.4rem] border px-6 text-base font-semibold shadow-[0_10px_24px_rgba(42,23,23,0.05)] lg:w-[110px]",
                  showFilters
                    ? "border-accent-red/10 bg-[#f9e9ea] text-accent-red hover:bg-[#f4dcde]"
                    : "border-black/[0.04] bg-white text-charcoal hover:bg-white",
                )}
              >
                <SlidersHorizontal className="size-5 text-accent-red" />
                Filter
              </Button>
            </div>

            {showFilters ? (
              <FilterPanel
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            ) : null}
          </section>
        </PageReveal>

        {error ? (
          <p className="mt-6 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-accent-red shadow-[0_12px_28px_rgba(42,23,23,0.05)]">
            {error}
          </p>
        ) : null}

        <section className="mt-8">
          <PageReveal delay={320} variant="up">
            <div
              className={cn(
                "hidden px-8 pb-3 text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-muted-warm/85 lg:grid",
                desktopGridClass,
              )}
            >
              <span>Name</span>
              <span>Gast-Code</span>
              <span>Wohnort</span>
              <span>Letzte Teilnahme</span>
              <span>Marketing</span>
              <span />
            </div>
          </PageReveal>

          <div className="space-y-4">
            {visibleGuests.map((guest, index) => (
              <PageReveal
                key={guest.id}
                delay={380 + index * 60}
                variant="up"
                className="w-full"
              >
                <GuestRow
                  guest={guest}
                  onToggleMarketing={handleToggleMarketing}
                  onDeleteGuest={handleDeleteGuest}
                />
              </PageReveal>
            ))}
            {visibleGuests.length === 0 ? (
              <div className="rounded-[1.75rem] bg-white px-6 py-10 text-center text-sm text-muted-warm shadow-[0_18px_36px_rgba(42,23,23,0.06)]">
                Keine Gäste gefunden.
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {showCreateModal ? (
        <ManualGuestModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateGuest}
        />
      ) : null}
    </div>
  );
}
