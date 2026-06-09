import type { ReactNode } from "react";
import {
  ArrowRight,
  AtSign,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import {
  MobileHeader,
  MobileShell,
} from "@/components/organisms/MobileShell";

export default function MobileRegister() {
  return (
    <MobileShell activeTab="new">
      <MobileHeader title="Gast Registrierung" subtitle="STV Event Manager" />

      <section className="flex-1 px-6 pb-32 pt-6">
        <div className="relative h-44 overflow-hidden rounded-[1.2rem] bg-[linear-gradient(140deg,#7a3b1f,#d9a06d,#6f2f1d)] shadow-sm">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-4 left-4 flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[#df2634]">
            <span className="h-2 w-2 rounded-full bg-[#df2634]" />
            Check-in Terminal
          </div>
        </div>

        <div className="mt-10 space-y-9">
          <FormSection icon={<User size={15} />} title="Persönliche Daten">
            <FormInput label="Vorname" placeholder="Eingeben..." />
            <FormInput label="Nachname" placeholder="Eingeben..." />
          </FormSection>

          <FormSection icon={<MapPin size={15} />} title="Anschrift">
            <div className="grid grid-cols-[1fr_74px] gap-4">
              <FormInput label="Strasse" placeholder="Hauptstr." />
              <FormInput label="Nr." placeholder="12" />
            </div>

            <div className="grid grid-cols-[104px_1fr] gap-4">
              <FormInput label="PLZ" placeholder="12345" />
              <FormInput label="Ort" placeholder="München" />
            </div>
          </FormSection>

          <FormSection icon={<AtSign size={15} />} title="Kontakt optional">
            <FormInput
              label="Telefon"
              placeholder="+49 000 0000000"
              icon={<Phone size={22} />}
            />

            <FormInput
              label="Email"
              placeholder="beispiel@email.de"
              icon={<Mail size={22} />}
            />
          </FormSection>

          <button className="flex h-16 w-full items-center justify-center gap-3 rounded-[1.1rem] bg-gradient-to-r from-[#df2634] to-[#b90f1d] text-xl font-extrabold text-white shadow-[0_18px_34px_rgba(220,31,45,0.22)]">
            Registrieren
            <ArrowRight size={26} />
          </button>

          <label className="flex gap-4 rounded-[1.1rem] bg-[#ffd9dc] p-6 text-sm leading-6">
            <input
              type="checkbox"
              className="mt-1 h-6 w-6 shrink-0 rounded border-[#d9b9bc]"
            />
            <span>
              Ich stimme der Verarbeitung meiner Daten gemäß der{" "}
              <span className="font-semibold text-[#df2634] underline">
                Datenschutzerklärung
              </span>{" "}
              für den Check-in Prozess zu.
            </span>
          </label>
        </div>
      </section>
    </MobileShell>
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
        <span className="text-[#df2634]">{icon}</span>
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
}: {
  label: string;
  placeholder: string;
  icon?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>

      <div className="flex h-16 items-center gap-3 rounded-[1rem] bg-[#f5e8e9] px-5">
        {icon && <span className="text-[#bdaeb0]">{icon}</span>}
        <input
          placeholder={placeholder}
          className="w-full bg-transparent text-base outline-none placeholder:text-[#bdaeb0]"
        />
      </div>
    </label>
  );
}