"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  AtSign,
  Calendar,
  CircleUser,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Search,
  User,
  UserPlus,
} from "lucide-react";

import { createGuest } from "@/lib/api";

const initialFormState = {
  firstName: "",
  lastName: "",
  street: "",
  houseNumber: "",
  postalCode: "",
  city: "",
  phone: "",
  email: "",
  consent: false,
};

export default function MobileRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (
    field: keyof typeof initialFormState,
    value: string | boolean,
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.consent) {
      setError("Bitte bestaetigen Sie die Datenschutz-Einwilligung.");
      return;
    }

    setIsSubmitting(true);

    try {
      const guest = await createGuest({
        firstName: form.firstName,
        lastName: form.lastName,
        street: form.street,
        houseNumber: form.houseNumber,
        postalCode: form.postalCode,
        city: form.city,
        phone: form.phone,
        email: form.email,
        allowEmailMarketing: Boolean(form.email),
        allowPostMarketing: true,
      });
      const params = new URLSearchParams({
        code: guest.guestCode,
        name: guest.name,
      });

      router.push(`/mobile/register/confirmation?${params.toString()}`);
    } catch {
      setError("Registrierung konnte nicht gespeichert werden.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbf7f8] text-[#231f20]">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[#fbf7f8]">
        <header className="flex items-center justify-between border-b border-[#f0e1e3] bg-white px-6 py-5">
          <div>
            <h1 className="text-2xl font-extrabold text-[#e12c39]">
              Gast Registrierung
            </h1>
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#5b484b]">
              STV Event Manager
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8eded] text-[#e12c39]">
            <CircleUser size={26} />
          </div>
        </header>

        <form className="flex-1 px-6 pb-32 pt-6" onSubmit={handleSubmit}>
          <div className="relative h-44 overflow-hidden rounded-xl bg-[linear-gradient(140deg,#7a3b1f,#d9a06d,#6f2f1d)] shadow-sm">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-4 left-4 flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[#e12c39]">
              <span className="h-2 w-2 rounded-full bg-[#e12c39]" />
              Check-in Terminal
            </div>
          </div>

          <div className="mt-10 space-y-9">
            <FormSection icon={<User size={15} />} title="Persoenliche Daten">
              <FormInput
                label="Vorname"
                placeholder="Eingeben..."
                value={form.firstName}
                onChange={(value) => updateField("firstName", value)}
                autoComplete="given-name"
                required
              />
              <FormInput
                label="Nachname"
                placeholder="Eingeben..."
                value={form.lastName}
                onChange={(value) => updateField("lastName", value)}
                autoComplete="family-name"
                required
              />
            </FormSection>

            <FormSection icon={<MapPin size={15} />} title="Anschrift">
              <div className="grid grid-cols-[1fr_74px] gap-4">
                <FormInput
                  label="Strasse"
                  placeholder="Hauptstr."
                  value={form.street}
                  onChange={(value) => updateField("street", value)}
                  autoComplete="address-line1"
                  required
                />
                <FormInput
                  label="Nr."
                  placeholder="12"
                  value={form.houseNumber}
                  onChange={(value) => updateField("houseNumber", value)}
                  required
                />
              </div>

              <div className="grid grid-cols-[104px_1fr] gap-4">
                <FormInput
                  label="PLZ"
                  placeholder="6373"
                  value={form.postalCode}
                  onChange={(value) => updateField("postalCode", value)}
                  autoComplete="postal-code"
                  inputMode="numeric"
                  required
                />
                <FormInput
                  label="Ort"
                  placeholder="Ennetbuergen"
                  value={form.city}
                  onChange={(value) => updateField("city", value)}
                  autoComplete="address-level2"
                  required
                />
              </div>
            </FormSection>

            <FormSection icon={<AtSign size={15} />} title="Kontakt (optional)">
              <FormInput
                label="Telefon"
                placeholder="+41 79 000 00 00"
                icon={<Phone size={22} />}
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                autoComplete="tel"
                type="tel"
              />

              <FormInput
                label="Email"
                placeholder="beispiel@email.de"
                icon={<Mail size={22} />}
                value={form.email}
                onChange={(value) => updateField("email", value)}
                autoComplete="email"
                type="email"
              />
            </FormSection>

            <label className="flex gap-4 rounded-xl bg-[#ffd9dc] p-6 text-sm leading-6">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(event) => updateField("consent", event.target.checked)}
                className="mt-1 h-6 w-6 shrink-0 rounded border-[#d9b9bc]"
              />
              <span>
                Ich stimme der Verarbeitung meiner Daten gemaess der{" "}
                <Link
                  href="/datenschutz"
                  className="font-semibold text-[#e12c39] underline"
                >
                  Datenschutzerklaerung
                </Link>{" "}
                fuer den Check-in Prozess zu.
              </span>
            </label>

            {error ? (
              <p className="rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-[#e12c39] shadow-sm ring-1 ring-[#f0e1e3]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-18 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#e12c39] to-[#b80018] text-xl font-extrabold text-white shadow-xl shadow-red-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Speichern..." : "Registrieren"}
              <ArrowRight size={26} />
            </button>
          </div>
        </form>

        <BottomNavigation />
      </div>
    </main>
  );
}

function FormSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-[#5b484b]">
        <span className="text-[#e12c39]">{icon}</span>
        <h2 className="text-sm font-extrabold uppercase tracking-[0.25em]">
          {title}
        </h2>
      </div>

      <div className="space-y-5">{children}</div>
    </div>
  );
}

function FormInput({
  label,
  placeholder,
  icon,
  value,
  onChange,
  type = "text",
  required = false,
  autoComplete,
  inputMode,
}: {
  label: string;
  placeholder: string;
  icon?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>

      <div className="flex h-16 items-center gap-3 rounded-lg bg-[#f5e8e9] px-5">
        {icon && <span className="text-[#bdaeb0]">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className="w-full bg-transparent text-base outline-none placeholder:text-[#bdaeb0]"
        />
      </div>
    </label>
  );
}

function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-1/2 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-4 border-t border-[#f0e1e3] bg-white px-3 py-3">
      <BottomNavItem href="/mobile" icon={<Calendar size={22} />} label="HEUTE" />
      <BottomNavItem href="/mobile/scanner" icon={<QrCode size={22} />} label="CHECK-IN" />
      <BottomNavItem href="/mobile/search" icon={<Search size={22} />} label="SUCHEN" />
      <BottomNavItem active href="/mobile/register" icon={<UserPlus size={22} />} label="NEUER GAST" />
    </nav>
  );
}

function BottomNavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-center text-[11px] font-bold ${
        active ? "bg-[#ffe8eb] text-[#e52535]" : "text-[#9b8b8d]"
      }`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </Link>
  );
}
